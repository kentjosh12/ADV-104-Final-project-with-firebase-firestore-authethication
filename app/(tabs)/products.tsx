// File: app/(tabs)/products.tsx

import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../firebase';
// 🛑 Import useAuth for user context
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where
} from 'firebase/firestore';
import { useAuth } from '../../src/hooks/useAuth';

interface Product {
  id: string;
  name: string;
  displayName: string;
  price: number;
  quantity: number;
  storeId: string;
  userId: string;
}

interface Log {
  id: string;
  userId: string;
  storeId: string;
  action: string;
  timestamp: any;
}

export default function ProductsScreen() {
  const { storeId, storeName } = useLocalSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'logs'>('products');
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // 🛑 Get user from the custom hook
  const { user } = useAuth();
  const currentUserId = user?.uid;

  // --- Load Products ---
  const loadProducts = async () => {
    if (!storeId || !currentUserId) return; // require auth to satisfy security rules
    try {
      setRefreshing(true);
      console.log('products: loadProducts called with storeId=', storeId, 'userId=', currentUserId);
      const productsQuery = query(
        collection(db, 'products'),
        where('storeId', '==', storeId),
        where('userId', '==', currentUserId),
        orderBy('name')
      );
      const querySnapshot = await getDocs(productsQuery);
      const productsList: Product[] = [];
      querySnapshot.forEach((doc) => {
        productsList.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsList);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setRefreshing(false);
    }
  };

  // --- Load Logs (More Efficient) ---
  const loadLogs = async () => {
    if (!storeId || !currentUserId) return; // require auth to satisfy security rules
    try {
      console.log('products: loadLogs called with storeId=', storeId, 'userId=', currentUserId);
      // 🛑 FIX: Filter logs directly in the query for performance
      const logsQuery = query(
        collection(db, 'logs'),
        where('storeId', '==', storeId),
        where('userId', '==', currentUserId),
        orderBy('timestamp', 'desc') // Sort by timestamp in Firestore
      );
      
      const querySnapshot = await getDocs(logsQuery);
      const logsList: Log[] = [];
      
      querySnapshot.forEach((doc) => {
        logsList.push({ id: doc.id, ...doc.data() } as Log);
      });
      
      setLogs(logsList);
      
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  // --- Focus Effect to Load Data ---
  useFocusEffect(
    useCallback(() => {
      if (storeId) {
        loadProducts();
        loadLogs();
      }
    }, [storeId, currentUserId])
  );

  const filteredProducts = products.filter(product =>
    (product.displayName || product.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddProduct = () => {
    router.push(`/add-product?storeId=${storeId}&storeName=${storeName}`);
  };

  const handleEditProduct = (product: Product) => {
    router.push(`/edit-product?storeId=${storeId}&storeName=${storeName}&productId=${product.id}`);
  };

  // --- Delete Product ---
  const handleDeleteProduct = async (product: Product) => {
    if (product.quantity > 0) {
      Alert.alert(
        'Cannot Delete',
        'You can only delete products with 0 quantity. Please set quantity to 0 first.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${product.displayName || product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('products: deleting product id=', product.id, 'userId=', currentUserId);
              await deleteDoc(doc(db, 'products', product.id));

              // 🛑 FIX: Add userId to log entry for consistency
              await addDoc(collection(db, 'logs'), {
                storeId: storeId as string,
                userId: currentUserId,
                action: `Deleted product: ${product.displayName || product.name}`,
                timestamp: new Date(),
              });

              loadProducts();
              loadLogs(); // Reload logs after a deletion
              Alert.alert('Success', 'Product deleted successfully');
            } catch (error) {
              console.error('Error deleting product:', error);
              Alert.alert('Error', 'Failed to delete product');
            }
          }
        }
      ]
    );
  };

  const handleRefresh = () => {
    if (storeId) {
      loadProducts();
      loadLogs();
    }
  };

  if (!storeId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>Please select a store first</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{storeName}</Text>
      </View>
      
      {/* --- Tab Selector --- */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, styles.tabLeft, activeTab === 'products' && styles.tabActive]}
          onPress={() => setActiveTab('products')}
        >
          <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, styles.tabRight, activeTab === 'logs' && styles.tabActive]}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={[styles.tabText, activeTab === 'logs' && styles.tabTextActive]}>
            Logs ({logs.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* --- PRODUCTS TAB --- */}
      {activeTab === 'products' ? (
        <>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddProduct}
            >
              <Text style={styles.addButtonText}>Add New Product</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.refreshButton, refreshing && styles.refreshButtonDisabled]}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              {refreshing && <ActivityIndicator size="small" color="white" />}
              <Text style={styles.refreshButtonText}>
                {refreshing && activeTab === 'products' ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <Text style={styles.productName}>{item.displayName || item.name}</Text>
                <Text style={styles.productDetail}>Price: ₱{Number(item.price).toFixed(2)}</Text>
                <Text style={styles.productDetail}>Quantity: {item.quantity}</Text>
                
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => handleEditProduct(item)}
                  >
                    <Text style={styles.buttonActionText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.deleteButton, item.quantity > 0 && styles.deleteButtonDisabled]}
                    onPress={() => handleDeleteProduct(item)}
                    disabled={item.quantity > 0}
                  >
                    <Text style={styles.buttonActionText}>
                      {item.quantity > 0 ? 'Cannot Delete' : 'Delete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {products.length === 0 && !refreshing ? 'No products found' : 'No products match your search'}
                </Text>
              </View>
            }
          />
        </>
      ) : (
        /* --- LOGS TAB --- */
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <View style={styles.logCard}>
              <Text style={styles.logAction}>{item.action}</Text>
              <Text style={styles.logDetail}>
                User: **{item.userId}**
              </Text>
              <Text style={styles.logDetail}>
                {item.timestamp?.toDate ? new Date(item.timestamp.toDate()).toLocaleString() : 'Unknown date'}
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.flatListContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No logs found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = require('react-native').StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#f9fafb',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignSelf: 'center',
    width: '100%',
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLeft: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  tabRight: {
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
  },
  tabActive: {
    backgroundColor: '#2563eb',
  },
  tabText: {
    color: '#6b7280',
    fontWeight: '700',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#fff',
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    fontSize: 15,
    color: '#1f2937',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  refreshButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  refreshButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  productDetail: {
    color: '#6b7280',
    marginTop: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 10,
  },
  editButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#f59e0b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  logCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  logAction: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  logDetail: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  flatListContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
    fontWeight: '500',
  },
});
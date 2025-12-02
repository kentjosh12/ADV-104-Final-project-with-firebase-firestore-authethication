import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { db } from '../../firebase';
import { collection, getDocs, query, where, orderBy, deleteDoc, doc, addDoc } from 'firebase/firestore';

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

  const loadProducts = async () => {
    try {
      setRefreshing(true);
      const productsQuery = query(
        collection(db, 'products'),
        where('storeId', '==', storeId),
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

  const loadLogs = async () => {
    try {
      const logsQuery = query(collection(db, 'logs'));
      
      const querySnapshot = await getDocs(logsQuery);
      const logsList: Log[] = [];
      
      querySnapshot.forEach((doc) => {
        const logData = doc.data();
        if (logData.storeId === storeId) {
          logsList.push({ id: doc.id, ...logData } as Log);
        }
      });
      
      logsList.sort((a, b) => {
        const timeA = a.timestamp?.toDate?.() || new Date(0);
        const timeB = b.timestamp?.toDate?.() || new Date(0);
        return timeB.getTime() - timeA.getTime();
      });
      
      setLogs(logsList);
    } catch (error) {
      console.error('Error loading logs:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (storeId) {
        loadProducts();
        loadLogs();
      }
    }, [storeId])
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

  const handleDeleteProduct = async (product: Product) => {
    if (product.quantity > 0) {
      Alert.alert(
        'Cannot Delete',
        'You can only delete products with 0 quantity. Please set quantity to 0 first.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      await deleteDoc(doc(db, 'products', product.id));

      await addDoc(collection(db, 'logs'), {
        storeId: storeId as string,
        action: `Deleted product: ${product.displayName || product.name}`,
        timestamp: new Date(),
      });

      loadProducts();
      Alert.alert('Success', 'Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      Alert.alert('Error', 'Failed to delete product');
    }
  };

  const handleRefresh = () => {
    if (storeId) {
      loadProducts();
      loadLogs();
    }
  };

  if (!storeId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Please select a store first</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f8fafc' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        {storeName}
      </Text>
      
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: activeTab === 'products' ? '#2563eb' : '#e2e8f0',
            alignItems: 'center',
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
          }}
          onPress={() => setActiveTab('products')}
        >
          <Text style={{ color: activeTab === 'products' ? 'white' : '#64748b', fontWeight: 'bold' }}>
            Products
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: activeTab === 'logs' ? '#2563eb' : '#e2e8f0',
            alignItems: 'center',
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          }}
          onPress={() => setActiveTab('logs')}
        >
          <Text style={{ color: activeTab === 'logs' ? 'white' : '#64748b', fontWeight: 'bold' }}>
            Logs
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'products' ? (
        <>
          <TextInput
            style={{
              backgroundColor: 'white',
              padding: 12,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#64748b',
              marginBottom: 16,
              fontSize: 16,
            }}
            placeholder="Search products..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <TouchableOpacity 
              style={{
                backgroundColor: '#2563eb',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
                flex: 1,
              }}
              onPress={handleAddProduct}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                Add New Product
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={{
                backgroundColor: '#10b981',
                padding: 16,
                borderRadius: 8,
                alignItems: 'center',
                flex: 1,
              }}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            renderItem={({ item }) => (
              <View style={{
                backgroundColor: 'white',
                padding: 16,
                borderRadius: 12,
                marginBottom: 12,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.displayName || item.name}</Text>
                <Text style={{ color: '#666', marginTop: 4 }}>Price: ₱{item.price}</Text>
                <Text style={{ color: '#666', marginTop: 4 }}>Quantity: {item.quantity}</Text>
                
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                  <TouchableOpacity 
                    style={{
                      backgroundColor: '#f59e0b',
                      padding: 8,
                      borderRadius: 6,
                      flex: 1,
                      marginRight: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => handleEditProduct(item)}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={{
                      backgroundColor: item.quantity > 0 ? '#64748b' : '#ef4444',
                      padding: 8,
                      borderRadius: 6,
                      flex: 1,
                      marginLeft: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => handleDeleteProduct(item)}
                    disabled={item.quantity > 0}
                  >
                    <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
                      {item.quantity > 0 ? 'Cannot Delete' : 'Delete'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', padding: 20 }}>
                <Text style={{ fontSize: 16, color: '#64748b' }}>
                  {products.length === 0 ? 'No products found' : 'No products match your search'}
                </Text>
              </View>
            }
          />
        </>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          renderItem={({ item }) => (
            <View style={{
              backgroundColor: 'white',
              padding: 12,
              borderRadius: 8,
              marginBottom: 8,
              borderLeftWidth: 4,
              borderLeftColor: '#2563eb',
            }}>
              <Text style={{ fontSize: 14, color: '#1e293b' }}>{item.action}</Text>
              <Text style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                {item.timestamp?.toDate ? new Date(item.timestamp.toDate()).toLocaleString() : 'Unknown date'}
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', padding: 20 }}>
              <Text style={{ fontSize: 16, color: '#64748b' }}>No logs found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
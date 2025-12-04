import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. IMPORT THE REAL-TIME HOOK
import { useAuth } from '../../src/hooks/useAuth';
import { useStores } from '../../src/hooks/useStores';

// Firestore Imports for Delete operation
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';

// Import the Store Card Component
import StoreCard from '../components/StoreCard';

interface Store {
  id: string;
  name: string;
  description: string;
  userId: string;
  createdAt: any;
}

export default function MyStoresScreen() {
  const { user, isLoading: authLoading } = useAuth();
  const { stores, isLoading, error } = useStores();

  // Redirect unauthenticated users to the login screen
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [authLoading, user]);

  const handleDeleteStore = async (store: Store) => {
    if (!user || store.userId !== user.uid) {
      alert("You can only delete your own stores.");
      return;
    }

    try {
      console.log('index: deleting store id=', store.id, 'user.uid=', user.uid);
      await deleteDoc(doc(db, 'stores', store.id));
      console.log(`Store ${store.name} deleted.`);
    } catch (err) {
      console.error(err);
      alert("Failed to delete store.");
    }
  };

  if (authLoading || isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.centerText}>Loading your stores...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <Text style={styles.errorHint}>Check your internet connection and Firestore rules.</Text>
      </View>
    );
  }

  // If the user is not signed in we already redirected above.
  if (!user) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.centerText}>Redirecting to login...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Stores</Text>
        <Text style={styles.headerSubtitle}>({stores.length} store{stores.length !== 1 ? 's' : ''})</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => router.push('/add-store')}
      >
        <Text style={styles.addButtonText}>Add New Store</Text>
      </TouchableOpacity>

      <FlatList
        data={stores}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StoreCard 
            store={item} 
            onPress={() => router.push(`/products?storeId=${item.id}&storeName=${encodeURIComponent(item.name)}`)}
            onDelete={(deletedStore) => handleDeleteStore(deletedStore as Store)}
          />
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={stores.length === 0 ? styles.emptyContainer : null}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You haven't added any stores yet!</Text>
            <Text style={styles.emptySubtext}>Tap "Add New Store" to get started</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  centerText: {
    marginTop: 12,
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: 4,
  },
  addButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptySubtext: {
    textAlign: 'center',
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#dc2626',
    fontWeight: '700',
  },
  errorHint: {
    textAlign: 'center',
    fontSize: 14,
    color: '#ef4444',
    marginTop: 8,
    fontWeight: '500',
  }
});

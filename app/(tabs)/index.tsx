import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { db } from '../../firebase';
import { collection, getDocs, query, deleteDoc, doc } from 'firebase/firestore';
import StoreCard from '../components/StoreCard';

interface Store {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
}

export default function StoresScreen() {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingStoreId, setDeletingStoreId] = useState<string | null>(null);
  const router = useRouter();

  // Load stores when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 Loading stores...');
      loadStores();
    }, [])
  );

  const loadStores = async () => {
    try {
      setLoading(true);
      console.log('📡 Loading stores from Firebase...');
      
      const storesQuery = query(collection(db, 'stores'));
      const querySnapshot = await getDocs(storesQuery);
      const storesList: Store[] = [];
      
      querySnapshot.forEach((doc) => {
        const storeData = doc.data();
        storesList.push({ 
          id: doc.id, 
          ...storeData 
        } as Store);
      });
      
      console.log(`📊 Loaded ${storesList.length} stores`);
      setStores(storesList);

    } catch (error: any) {
      console.error('❌ Error loading stores:', error);
      Alert.alert('Error', 'Failed to load stores: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStorePress = (store: Store) => {
    router.push(`/(tabs)/products?storeId=${store.id}&storeName=${encodeURIComponent(store.name)}`);
  };

  const handleDeleteStore = async (store: Store) => {
    console.log('🗑️ Deleting store:', store.name);
    
    try {
      setDeletingStoreId(store.id);
      
      await deleteDoc(doc(db, 'stores', store.id));
      console.log('✅ Store deleted successfully!');

      // Update UI immediately
      setStores(prevStores => prevStores.filter(s => s.id !== store.id));
      
      Alert.alert('Success!', `Store "${store.name}" has been deleted.`);

    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      Alert.alert('Error', `Failed to delete store "${store.name}".\n\nError: ${error.message}`);
    } finally {
      setDeletingStoreId(null);
    }
  };

  const handleAddStore = () => {
    console.log('➡️ Navigating to add store screen');
    router.push('/add-store');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>Loading stores...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f8fafc' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        My Stores
      </Text>

      <TouchableOpacity 
        style={{
          backgroundColor: '#2563eb',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 20,
        }}
        onPress={handleAddStore}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          ➕ Add New Store
        </Text>
      </TouchableOpacity>

      {stores.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 20 }}>
            No stores found.{'\n'}Create your first store!
          </Text>
          <TouchableOpacity 
            style={{
              backgroundColor: '#2563eb',
              padding: 12,
              borderRadius: 8,
            }}
            onPress={handleAddStore}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
              Create First Store
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={stores}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <StoreCard 
              store={item} 
              onPress={() => handleStorePress(item)}
              onDelete={handleDeleteStore}
              isDeleting={deletingStoreId === item.id}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
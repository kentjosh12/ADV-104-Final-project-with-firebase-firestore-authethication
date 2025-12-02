import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebase';

export default function DebugDelete() {
  const [loading, setLoading] = useState(false);
  const [storeId, setStoreId] = useState('');

  const testSimpleDelete = async () => {
    if (!storeId.trim()) {
      Alert.alert('Error', 'Please enter a store ID');
      return;
    }

    try {
      setLoading(true);
      console.log('🧪 Starting simple delete test...');
      
      // Step 1: Check if store exists
      console.log('📝 Checking if store exists...');
      const storeDoc = await getDoc(doc(db, 'stores', storeId));
      
      if (!storeDoc.exists()) {
        Alert.alert('Error', `Store with ID "${storeId}" does not exist`);
        return;
      }
      
      const storeData = storeDoc.data();
      console.log('🏪 Store found:', storeData);
      
      // Step 2: Try to delete
      console.log('🗑️ Attempting to delete store...');
      await deleteDoc(doc(db, 'stores', storeId));
      console.log('✅ Store deleted successfully!');
      
      Alert.alert('Success', `Store "${storeData.name}" deleted successfully!`);
      setStoreId('');
      
    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        name: error.name
      });
      
      Alert.alert('Delete Failed', `Error: ${error.code}\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const listStores = async () => {
    try {
      const { collection, getDocs } = await import('firebase/firestore');
      const querySnapshot = await getDocs(collection(db, 'stores'));
      
      let storesInfo = 'Stores in database:\n\n';
      querySnapshot.forEach((doc) => {
        storesInfo += `ID: ${doc.id}\nName: ${doc.data().name}\n\n`;
      });
      
      if (querySnapshot.size === 0) {
        storesInfo = 'No stores found in database';
      }
      
      Alert.alert('Stores List', storesInfo);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to list stores: ' + error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f8fafc' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Debug Delete Test
      </Text>

      <TouchableOpacity 
        style={{
          backgroundColor: '#3b82f6',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 20,
        }}
        onPress={listStores}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          📋 List All Stores
        </Text>
      </TouchableOpacity>

      <Text style={{ fontSize: 16, marginBottom: 10 }}>Store ID to delete:</Text>
      <TextInput
        style={{
          backgroundColor: 'white',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#64748b',
          marginBottom: 20,
          fontSize: 16,
        }}
        placeholder="Paste store ID here"
        value={storeId}
        onChangeText={setStoreId}
      />

      <TouchableOpacity 
        style={{
          backgroundColor: loading ? '#94a3b8' : '#ef4444',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 10,
        }}
        onPress={testSimpleDelete}
        disabled={loading}
      >
        {loading && <ActivityIndicator size="small" color="white" />}
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          {loading ? 'Deleting...' : '🧪 Test Delete This Store'}
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 30, padding: 15, backgroundColor: '#e8f4fd', borderRadius: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Instructions:</Text>
        <Text style={{ fontSize: 12, marginBottom: 5 }}>1. Click "List All Stores" to see store IDs</Text>
        <Text style={{ fontSize: 12, marginBottom: 5 }}>2. Copy a store ID from the list</Text>
        <Text style={{ fontSize: 12, marginBottom: 5 }}>3. Paste the ID in the input field</Text>
        <Text style={{ fontSize: 12 }}>4. Click "Test Delete This Store"</Text>
      </View>
    </View>
  );
}

// Add this import at the top if TextInput is not available
import { TextInput } from 'react-native';

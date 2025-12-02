import { router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../firebase';

export default function AddStoreScreen() {
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddStore = async () => {
    if (!storeName.trim()) {
      Alert.alert('Error', 'Please enter a store name');
      return;
    }

    try {
      setLoading(true);
      console.log('💾 Saving store to Firebase:', storeName);

      // Add store to Firebase
      const docRef = await addDoc(collection(db, 'stores'), {
        name: storeName.trim(),
        createdAt: new Date(),
        // Remove userId for now to simplify
      });

      console.log('✅ Store saved with ID:', docRef.id);
      
      Alert.alert('Success', 'Store created successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            setStoreName('');
            router.back();
          }
        }
      ]);

    } catch (error: any) {
      console.error('❌ Error adding store:', error);
      Alert.alert('Error', 'Failed to create store: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f8fafc' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Add New Store
      </Text>
      
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
        placeholder="Enter store name"
        value={storeName}
        onChangeText={setStoreName}
      />
      
      <TouchableOpacity 
        style={{
          backgroundColor: loading ? '#94a3b8' : '#2563eb',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
        }}
        onPress={handleAddStore}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          {loading ? 'Saving...' : 'Create Store'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
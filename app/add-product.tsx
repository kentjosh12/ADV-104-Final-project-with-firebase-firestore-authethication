import { router, useLocalSearchParams } from 'expo-router';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../firebase';

export default function AddProductScreen() {
  const { storeId, storeName } = useLocalSearchParams();
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddProduct = async () => {
    if (!productName.trim() || !price || !quantity) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    const priceValue = parseFloat(price);
    const quantityValue = parseInt(quantity);

    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (isNaN(quantityValue) || quantityValue < 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    if (!storeId) {
      Alert.alert('Error', 'Store information is missing');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Adding product to store:', storeId);

      // Check if product already exists in this store
      const productsQuery = query(
        collection(db, 'products'),
        where('storeId', '==', storeId),
        where('name', '==', productName.trim().toLowerCase())
      );
      const querySnapshot = await getDocs(productsQuery);
      
      if (!querySnapshot.empty) {
        Alert.alert('Error', 'A product with this name already exists in this store');
        return;
      }

      // Get current user (if available)
      const user = auth.currentUser;

      // Add product
      await addDoc(collection(db, 'products'), {
        name: productName.trim().toLowerCase(),
        displayName: productName.trim(),
        price: priceValue,
        quantity: quantityValue,
        storeId: storeId,
        userId: user?.uid || 'anonymous', // Use user ID if available, otherwise 'anonymous'
        createdAt: new Date(),
      });

      // Add log
      await addDoc(collection(db, 'logs'), {
        storeId: storeId as string,
        userId: user?.uid || 'anonymous',
        action: `Added product: ${productName.trim()} (Quantity: ${quantityValue}, Price: ₱${priceValue})`,
        timestamp: new Date(),
      });

      Alert.alert('Success', 'Product added successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            setProductName('');
            setPrice('');
            setQuantity('');
            router.back();
          }
        }
      ]);

    } catch (error: any) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f8fafc' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Add New Product
      </Text>
      
      <TextInput
        style={{
          backgroundColor: 'white',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#64748b',
          marginBottom: 12,
          fontSize: 16,
        }}
        placeholder="Product Name"
        value={productName}
        onChangeText={setProductName}
      />
      
      <TextInput
        style={{
          backgroundColor: 'white',
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: '#64748b',
          marginBottom: 12,
          fontSize: 16,
        }}
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />
      
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
        placeholder="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />
      
      <TouchableOpacity 
        style={{
          backgroundColor: loading ? '#94a3b8' : '#2563eb',
          padding: 16,
          borderRadius: 8,
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 10,
        }}
        onPress={handleAddProduct}
        disabled={loading}
      >
        {loading && <ActivityIndicator size="small" color="white" />}
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          {loading ? 'Adding Product...' : 'Add Product'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{
          backgroundColor: '#6b7280',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 12,
        }}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontSize: 14 }}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}
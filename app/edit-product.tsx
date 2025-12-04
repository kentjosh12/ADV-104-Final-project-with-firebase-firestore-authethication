// File: app/edit-product.tsx

import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
// 🛑 Changed: Import only 'db' for Firestore
import { db } from '../firebase';
// 🛑 Added: Use the custom stateful hook for user data
import { addDoc, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { useAuth } from '../src/hooks/useAuth';

interface Product {
  id: string; // Add ID here for consistency, though implicitly available via productId
  name: string;
  displayName: string;
  price: number;
  quantity: number;
  userId?: string; // Add optional userId property
}

export default function EditProductScreen() {
  const { storeId, storeName, productId } = useLocalSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // 🛑 Get user from the custom hook
  const { user } = useAuth(); 

  useEffect(() => {
    console.log('EditProductScreen params:', { storeId, storeName, productId });
    if (productId) {
      loadProduct();
    } else {
      setInitialLoading(false);
      Alert.alert('Error', 'No product ID provided');
    }
    // Dependency array cleaned up to avoid unnecessary re-runs
  }, [productId]); 

  const loadProduct = async () => {
    try {
      console.log('Loading product with ID:', productId);
      
      if (!productId) {
        Alert.alert('Error', 'No product ID provided');
        setInitialLoading(false);
        return;
      }

      const productDoc = await getDoc(doc(db, 'products', productId as string));
      
      if (!productDoc.exists()) {
        Alert.alert('Error', 'Product not found');
        setInitialLoading(false);
        return;
      }

      // Ensure the id is included in the state
      const productData = { id: productDoc.id, ...productDoc.data() } as Product;
      console.log('Product data loaded:', productData);
      
      setProduct(productData);
      setProductName(productData.displayName || productData.name || '');
      // Ensure the price and quantity are strings for TextInput
      setPrice(productData.price.toString());
      setQuantity(productData.quantity.toString());
      
    } catch (error: any) {
      console.error('Error loading product:', error);
      Alert.alert('Error', 'Failed to load product: ' + error.message);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    // Validate inputs
    if (!productName.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }

    if (!price || !quantity) {
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

    if (!storeId || !productId) {
      Alert.alert('Error', 'Missing store or product ID');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Update attempt with:', {
        storeId,
        productId,
        productName,
        price: priceValue,
        quantity: quantityValue
      });

      // Check if product name already exists (excluding current product)
      const currentProductName = product?.name || '';
      if (productName.trim().toLowerCase() !== currentProductName.toLowerCase()) {
        console.log('Checking for duplicate product names...');
        const productsQuery = query(
          collection(db, 'products'),
          where('storeId', '==', storeId),
          where('name', '==', productName.trim().toLowerCase())
        );
        const querySnapshot = await getDocs(productsQuery);
        
        if (!querySnapshot.empty) {
          // Check if the duplicate product found is NOT the current product being edited
          const existingProduct = querySnapshot.docs[0];
          if (existingProduct.id !== productId) {
             Alert.alert('Error', 'A product with this name already exists in this store');
             return;
          }
        }
      }

      // Determine the User ID for the log
      const userId = user?.uid || 'anonymous'; 

      // Update product
      console.log('Updating product in Firestore...');
      const productRef = doc(db, 'products', productId as string);
      await updateDoc(productRef, {
        name: productName.trim().toLowerCase(),
        displayName: productName.trim(),
        price: priceValue,
        quantity: quantityValue,
        updatedAt: new Date(),
      });

      // Add log
      console.log('Adding log entry...');
      await addDoc(collection(db, 'logs'), {
        storeId: storeId as string,
        // 🛑 FIX: Add the userId to the log entry
        userId: userId, 
        action: `Updated product: ${productName.trim()} (Quantity: ${quantityValue}, Price: ₱${priceValue})`,
        timestamp: new Date(),
      });

      console.log('Product updated successfully!');
      Alert.alert('Success', 'Product updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

    } catch (error: any) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={{ marginTop: 10 }}>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
          Product not found or failed to load
        </Text>
        <Text style={{ fontSize: 12, color: '#666', marginBottom: 20, textAlign: 'center' }}>
          Product ID: {productId || 'Not provided'}
        </Text>
        
        <TouchableOpacity 
          style={{
            backgroundColor: '#2563eb',
            padding: 12,
            borderRadius: 8,
            marginBottom: 10,
          }}
          onPress={() => router.back()}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Go Back</Text>
        </TouchableOpacity>

        
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#f8fafc' }}>
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Edit {product.displayName} in {storeName}
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
        }}
        onPress={handleUpdateProduct}
        disabled={loading}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          {loading ? 'Updating...' : 'Update Product'}
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
      >
        <Text style={{ color: 'white', fontSize: 14 }}>
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}
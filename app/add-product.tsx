import { router, useLocalSearchParams } from 'expo-router';
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../firebase';
import { useAuth } from '../src/hooks/useAuth';

export default function AddProductScreen() {
  const { storeId, storeName } = useLocalSearchParams();
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleAddProduct = async () => {
    // Basic validation
    if (!productName.trim()) {
      Alert.alert('Validation Error', 'Product name is required.');
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Validation Error', 'Enter a valid price greater than 0.');
      return;
    }

    const quantityValue = parseInt(quantity, 10);
    if (isNaN(quantityValue) || quantityValue < 0) {
      Alert.alert('Validation Error', 'Enter a valid non-negative quantity.');
      return;
    }

    if (!storeId) {
      Alert.alert('Error', 'Store ID is missing.');
      return;
    }

    const userId = user?.uid;
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to add a product.');
      return;
    }

    setLoading(true);
    try {
      console.log('add-product: current user uid=', userId, 'storeId=', storeId, 'product=', productName.trim());
      // Check if product already exists in this store (case-insensitive by using lowercase)
      const productsQuery = query(
        collection(db, 'products'),
        where('storeId', '==', storeId),
        where('userId', '==', userId),
        where('name', '==', productName.trim().toLowerCase())
      );
      const querySnapshot = await getDocs(productsQuery);

      if (!querySnapshot.empty) {
        Alert.alert('Error', 'A product with this name already exists in this store');
        return;
      }

      // 1. Create Product Document
      const newProduct = {
        name: productName.trim().toLowerCase(),
        displayName: productName.trim(),
        price: priceValue,
        quantity: quantityValue,
        storeId: storeId,
        userId: userId,
        createdAt: new Date(),
      };
      console.log('add-product: creating product doc=', newProduct);
      await addDoc(collection(db, 'products'), newProduct);

      // 2. Create Log Document
      await addDoc(collection(db, 'logs'), {
        storeId,
        userId,
        action: `Added product: ${productName.trim()} (Quantity: ${quantityValue}, Price: ₱${priceValue})`,
        timestamp: new Date(),
      });

      Alert.alert('Success', 'Product added successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);

      setProductName('');
      setPrice('');
      setQuantity('');
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Failed to add product: ' + (error?.message || String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Product</Text>
        <Text style={styles.headerSubtitle}>Add item to {storeName || 'your store'}</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter product name"
          placeholderTextColor="#d1d5db"
          value={productName}
          onChangeText={setProductName}
          editable={!loading}
        />

        <Text style={styles.label}>Price (₱)</Text>
        <TextInput
          style={styles.input}
          placeholder="0.00"
          placeholderTextColor="#d1d5db"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        <Text style={styles.label}>Quantity</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          placeholderTextColor="#d1d5db"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="number-pad"
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.addButton, loading && styles.addButtonDisabled]}
        onPress={handleAddProduct}
        disabled={loading}
      >
        {loading && <ActivityIndicator size="small" color="white" />}
        <Text style={styles.addButtonText}>
          {loading ? 'Adding Product...' : 'Add Product'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={loading}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '400',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#1f2937',
  },
  addButton: {
    marginBottom: 12,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  addButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    marginTop: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#6b7280',
    fontSize: 15,
    fontWeight: '600',
  }
});

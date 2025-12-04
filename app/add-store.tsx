import { Stack, router } from 'expo-router';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../firebase'; // Assuming '../STORAGE/firebase' is correct path
import { useAuth } from '../src/hooks/useAuth';

// Interface for the store data structure
interface StoreData {
  name: string;
  description: string;
  userId: string;
  createdAt: number;
}

export default function AddStoreScreen() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveStore = async () => {
    if (!user || isAuthLoading) {
      Alert.alert("Authentication Error", "User not logged in or authentication is loading.");
      return;
    }

    if (!storeName.trim()) {
      Alert.alert("Validation Error", "Please enter a valid Store Name.");
      return;
    }

    setIsSaving(true);

    try {
      const newStore: StoreData = {
        name: storeName.trim(),
        description: description.trim() || 'No description provided.',
        userId: user.uid,
        createdAt: Date.now(),
      };

      // Firestore path: We will use a dedicated 'stores' collection
      const storesCollectionRef = collection(db, 'stores');

      // Add the new store document
      await addDoc(storesCollectionRef, newStore);
      
      Alert.alert("Success", `Store "${storeName}" created successfully!`);
      
      // Navigate back to the home/stores list
      router.back();

    } catch (error) {
      console.error("Error adding store: ", error);
      Alert.alert("Error", "Failed to create store. Please check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Show a loading screen while auth is resolving
  if (isAuthLoading || !user) {
    return (
        <View style={styles.centered}>
            <ActivityIndicator size="large" color="#2563eb" />
            <Text style={styles.loadingText}>Loading user data...</Text>
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Create Store', headerShown: true }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Store</Text>
          <Text style={styles.headerSubtitle}>Set up your store details</Text>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.label}>Store Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Aling Nena's Sari-Sari"
            placeholderTextColor="#9ca3af"
            value={storeName}
            onChangeText={setStoreName}
            editable={!isSaving}
          />
          
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Briefly describe your store..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            editable={!isSaving}
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSaveStore}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Create Store</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={isSaving}
        >
            <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: '#f9fafb',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
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
  textArea: {
    height: 110,
    textAlignVertical: 'top',
    paddingVertical: 12,
  },
  saveButton: {
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: '#0d9488',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#0d9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#a7f3d0',
  },
  saveButtonText: {
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
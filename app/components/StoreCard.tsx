// File: app/(tabs)/components/StoreCard.tsx

import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Store {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
  // Note: 'location' is NOT here, matching your existing StoreCard definition
}

interface StoreCardProps {
  store: Store;
  onPress: () => void;
  // onDelete requires the full Store object as an argument
  onDelete: (store: Store) => void; 
  isDeleting?: boolean;
}

export default function StoreCard({ store, onPress, onDelete, isDeleting = false }: StoreCardProps) {
  const handleDelete = () => {
    Alert.alert(
      'Delete Store',
      `Are you sure you want to delete "${store.name}"? This will also delete all products in this store.`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => console.log('🔴 User cancelled deletion')
        },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            console.log('🟢 User confirmed deletion, calling onDelete...');
            // 🛑 Passes the store object back to the parent function
            onDelete(store); 
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.card, isDeleting && styles.cardDeleting]}>
      {/* Store Info - Clickable */}
      <TouchableOpacity style={styles.infoSection} onPress={onPress} disabled={isDeleting}>
        <Text style={styles.storeName}>{store.name}</Text>
        <Text style={styles.storeDate}>
          Created: {store.createdAt?.toDate ? new Date(store.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
        </Text>
      </TouchableOpacity>
      
      {/* Delete Button */}
      <TouchableOpacity 
        style={[styles.deleteButton, isDeleting && styles.deleteButtonDisabled]}
        onPress={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting && <ActivityIndicator size="small" color="white" />}
        <Text style={styles.deleteButtonText}>
          {isDeleting ? 'Deleting...' : 'Delete Store'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
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
  cardDeleting: {
    opacity: 0.6,
  },
  infoSection: {
    marginBottom: 12,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  storeDate: {
    color: '#6b7280',
    marginTop: 6,
    fontSize: 13,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteButtonDisabled: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0.05,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  }
});

import React from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

interface Store {
  id: string;
  name: string;
  userId: string;
  createdAt: any;
}

interface StoreCardProps {
  store: Store;
  onPress: () => void;
  onDelete: (store: Store) => void;
  isDeleting?: boolean;
}

export default function StoreCard({ store, onPress, onDelete, isDeleting = false }: StoreCardProps) {
  const handleDelete = () => {
    console.log('🟡 Delete button clicked for store:', store.name);
    console.log('🟡 Store ID:', store.id);
    
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
            onDelete(store);
          }
        }
      ]
    );
  };

  return (
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
      opacity: isDeleting ? 0.6 : 1,
    }}>
      {/* Store Info - Clickable */}
      <TouchableOpacity onPress={onPress} disabled={isDeleting}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{store.name}</Text>
        <Text style={{ color: '#666', marginTop: 4 }}>
          Created: {store.createdAt?.toDate ? new Date(store.createdAt.toDate()).toLocaleDateString() : 'Unknown'}
        </Text>
      </TouchableOpacity>
      
      {/* Delete Button */}
      <TouchableOpacity 
        style={{
          backgroundColor: isDeleting ? '#94a3b8' : '#ef4444',
          padding: 10,
          borderRadius: 6,
          alignItems: 'center',
          marginTop: 12,
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
        }}
        onPress={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting && <ActivityIndicator size="small" color="white" />}
        <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>
          {isDeleting ? 'Deleting...' : 'Delete Store'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
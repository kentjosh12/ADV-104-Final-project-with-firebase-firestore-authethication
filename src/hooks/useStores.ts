import { collection, onSnapshot, orderBy, query, QuerySnapshot, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../firebase'; // Assuming correct path
import { useAuth } from './useAuth'; // Assuming useAuth is in the same directory

// Define the structure of a Store object
interface Store {
  id: string; // Document ID from Firestore
  name: string;
  description: string;
  userId: string;
  createdAt: number;
}

interface StoresState {
  stores: Store[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch and listen to real-time changes for a user's stores.
 * The data will update instantly when a new store is added or modified.
 */
export function useStores(): StoresState {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Guard against unauthenticated state
    if (isAuthLoading || !user) {
      if (!isAuthLoading) {
        setStores([]); // Clear stores if user logs out
        setIsLoading(false);
      }
      return;
    }

    console.log('useStores: user is present, uid=', user.uid);

    const userId = user.uid;
    const storesCollectionRef = collection(db, 'stores');

    // 2. Create a query: Filter by the current user's ID and order by creation time
    const userStoresQuery = query(
      storesCollectionRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    // 3. Attach the real-time listener (onSnapshot)
    // This function runs immediately and then runs again every time data changes in Firestore
    const unsubscribe = onSnapshot(userStoresQuery, (snapshot: QuerySnapshot) => {
      try {
        const storesList: Store[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Store)); // Type assertion for convenience
        
        setStores(storesList);
        setIsLoading(false);
        setError(null);
      } catch (e) {
        console.error("Error processing stores snapshot:", e);
        setError("Failed to fetch stores in real-time.");
        setIsLoading(false);
      }
    }, (e) => {
        // Handle listener errors (e.g., permission denied)
        console.error("Firestore listener error:", e);
        setError("Failed to connect to real-time updates.");
        setIsLoading(false);
    });

    // Cleanup function: This is crucial! It stops the listener when the component unmounts.
    return () => unsubscribe();
  }, [user, isAuthLoading]); // Re-run effect when user or auth state changes

  return { stores, isLoading, error };
}
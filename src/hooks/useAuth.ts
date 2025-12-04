import { User, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../../firebase'; // Correct import path

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged listens for user sign in, sign out, and initial state check
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsLoading(false); 
    });

    return unsubscribe; 
  }, []);

  return { user, isLoading };
}
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { db, auth } from '../firebase';
import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';

export default function TestFirebase() {
  const [status, setStatus] = useState<string>('Testing...');
  const [firestoreStatus, setFirestoreStatus] = useState<string>('Not tested');
  const [authStatus, setAuthStatus] = useState<string>('Not tested');

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      setStatus('Testing Firebase configuration...');
      console.log('Firebase Config:', {
        projectId: "sari-sari-storage-9f8c0",
        authDomain: "sari-sari-storage-9f8c0.firebaseapp.com"
      });

      // Test 1: Authentication
      setAuthStatus('Testing authentication...');
      await testAuthentication();
      
      // Test 2: Firestore Write
      setFirestoreStatus('Testing Firestore write...');
      await testFirestoreWrite();
      
      // Test 3: Firestore Read
      setFirestoreStatus('Testing Firestore read...');
      await testFirestoreRead();

      setStatus('✅ All tests passed! Firebase is connected successfully!');
      Alert.alert('Success', 'Firebase is connected successfully!');

    } catch (error: any) {
      console.error('Firebase test failed:', error);
      setStatus('❌ Connection failed: ' + error.message);
      Alert.alert('Error', 'Firebase connection failed: ' + error.message);
    }
  };

  const testAuthentication = async () => {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, 
        (user) => {
          if (user) {
            setAuthStatus('✅ Authenticated as: ' + user.uid);
            console.log('User:', user);
            resolve(user);
          } else {
            // Try anonymous auth
            signInAnonymously(auth)
              .then((userCredential) => {
                setAuthStatus('✅ Signed in anonymously: ' + userCredential.user.uid);
                resolve(userCredential.user);
              })
              .catch((error) => {
                setAuthStatus('❌ Auth failed: ' + error.message);
                reject(error);
              });
          }
          unsubscribe();
        },
        (error) => {
          setAuthStatus('❌ Auth error: ' + error.message);
          reject(error);
          unsubscribe();
        }
      );
    });
  };

  const testFirestoreWrite = async () => {
    try {
      const testData = {
        message: 'Test connection from React Native app',
        timestamp: new Date(),
        test: true
      };

      const docRef = await addDoc(collection(db, 'connection-test'), testData);
      setFirestoreStatus('✅ Write successful! Document ID: ' + docRef.id);
      console.log('Document written with ID: ', docRef.id);
      return docRef.id;
    } catch (error: any) {
      setFirestoreStatus('❌ Write failed: ' + error.message);
      throw error;
    }
  };

  const testFirestoreRead = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'connection-test'));
      const documents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFirestoreStatus('✅ Read successful! Found ' + documents.length + ' documents');
      console.log('Documents:', documents);
    } catch (error: any) {
      setFirestoreStatus('❌ Read failed: ' + error.message);
      throw error;
    }
  };

  const clearTestData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'connection-test'));
      const deletePromises = querySnapshot.docs.map(doc => 
        setDoc(doc.ref, { _deleted: true })
      );
      await Promise.all(deletePromises);
      Alert.alert('Success', 'Test data cleared!');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to clear test data: ' + error.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
        Firebase Connection Test
      </Text>

      <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Overall Status:</Text>
        <Text style={{ fontSize: 14, color: status.includes('✅') ? 'green' : 'red' }}>
          {status}
        </Text>
      </View>

      <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Authentication:</Text>
        <Text style={{ fontSize: 14, color: authStatus.includes('✅') ? 'green' : 'red' }}>
          {authStatus}
        </Text>
      </View>

      <View style={{ backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 20 }}>
        <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>Firestore:</Text>
        <Text style={{ fontSize: 14, color: firestoreStatus.includes('✅') ? 'green' : 'red' }}>
          {firestoreStatus}
        </Text>
      </View>

      <TouchableOpacity 
        style={{ 
          backgroundColor: '#007AFF', 
          padding: 15, 
          borderRadius: 10, 
          alignItems: 'center',
          marginBottom: 10 
        }}
        onPress={testFirebaseConnection}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          Run Tests Again
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={{ 
          backgroundColor: '#FF3B30', 
          padding: 15, 
          borderRadius: 10, 
          alignItems: 'center' 
        }}
        onPress={clearTestData}
      >
        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
          Clear Test Data
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20, padding: 15, backgroundColor: '#e8f4fd', borderRadius: 10 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Instructions:</Text>
        <Text style={{ fontSize: 12, marginBottom: 5 }}>1. Click "Run Tests Again" to test connection</Text>
        <Text style={{ fontSize: 12, marginBottom: 5 }}>2. Check Firebase Console to see test data</Text>
        <Text style={{ fontSize: 12, marginBottom: 5 }}>3. All tests should show green ✅ marks</Text>
        <Text style={{ fontSize: 12 }}>4. Use "Clear Test Data" to clean up</Text>
      </View>
    </View>
  );
}
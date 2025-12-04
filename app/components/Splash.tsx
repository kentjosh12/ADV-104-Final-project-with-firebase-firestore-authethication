import React from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export default function Splash() {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Storage</Text>
      <Text style={styles.subtitle}>Inventory made simple</Text>

      <ActivityIndicator size="small" color="#2563eb" style={styles.spinner} />

      <Image source={require('../../assets/images/icon.png')} style={styles.icon} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 6,
  },
  spinner: {
    marginTop: 18,
  },
  icon: {
    width: 44,
    height: 44,
    position: 'absolute',
    right: 18,
    top: 18,
    opacity: 0.85,
  },
});

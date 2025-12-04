import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { signOut } from "firebase/auth";
import React from "react";
import { auth } from "../../firebase";

export default function TabLayout() {

  const logout = () => {
    signOut(auth);
  };

  return (
    <Tabs
      screenOptions={{
        headerRight: () => (
          <Ionicons
            name="log-out-outline"
            size={24}
            color="red"
            style={{ marginRight: 15 }}
            onPress={logout}
          />
        ),
        headerShown: true,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e2eeef",
          paddingBottom: 4,
          height: 60,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "My Stores",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: "All Products",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cube-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

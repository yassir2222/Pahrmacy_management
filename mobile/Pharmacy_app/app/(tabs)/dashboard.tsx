import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Href } from 'expo-router';
// Assuming your AuthContext is here - ADJUST THE PATH if necessary!
import { useAuth } from '../../context/AuthContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { logout, token } = useAuth(); // Get logout function and token from context

  const handleLogout = async () => {
    try {
      await logout(); // Call the logout function from context (handles token removal)
      // Redirect to the login screen after successful logout
      // Make sure '/(auth)/login' matches your actual login screen path
      router.replace('/(auth)/login' as Href);
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout Error", "Could not log out. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.text}>
        Welcome to your dashboard! You are logged in.
      </Text>

      {/* Optional: Display part of the token for verification (REMOVE in production) */}
      {/* {token && <Text style={styles.tokenInfo}>Token starts with: {token.substring(0, 10)}...</Text>} */}


      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5', // Light background color
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#555',
  },
  tokenInfo: {
    fontSize: 12,
    color: 'grey',
    marginBottom: 30,
    fontFamily: 'monospace', // Use monospace font for token snippet
    
  },
  button: {
    backgroundColor: '#e74c3c', // A red color for logout
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25, // More rounded corners
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
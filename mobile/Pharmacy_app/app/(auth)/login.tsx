import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { Href, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import axios from 'axios'; 


const API_BASE_URL = 'http://192.168.1.103:8083'; 
const LOGIN_URL = `${API_BASE_URL}/api/auth/login`;
const AUTH_TOKEN_KEY = 'my-jwt-token'; 

export default function LoginScreen() {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // const { login } = useAuth(); // Assuming you have a login function in your AuthContext
 

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Attempting login to:', LOGIN_URL);
      const response = await axios.post(LOGIN_URL, {
        username: email, 
        password: password,
      });

      console.log('Login Response Status:', response.status);
      console.log('Login Response Data:', response.data);

      if (response.data && response.data.token) {
        const token = response.data.token;

        // --- Store the token securely ---
       // await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
       await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
      //await login(token);
        console.log('Token stored securely.');
        router.replace('/(tabs)/' as Href); // Navigate to your main screen after login
        
      } else {
        // Handle cases where response is successful but token is missing
        console.error('Login successful, but no token received.');
        setError('Login failed: Invalid response from server.');
      }

    } catch (err: any) {
      console.error('Login Error:', err);
      setError('Login failed. Please check your credentials or network connection.');

      // More specific error handling based on Axios error structure
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // Server responded with a status code outside the 2xx range
          console.error('Error Status:', err.response.status);
          console.error('Error Data:', err.response.data);
          if (err.response.status === 401) {
            setError('Login failed: Invalid credentials.');
          } else {
            // Use error message from backend if available
            const message = err.response.data?.message || 'An error occurred on the server.';
            setError(`Login failed: ${message}`);
          }
        } else if (err.request) {
          // Request was made but no response received (network issue)
          console.error('Network Error:', err.request);
          setError('Login failed: Could not connect to the server. Check network and backend URL/IP.');
        } else {
          // Something else happened setting up the request
          console.error('Axios Setup Error:', err.message);
          setError(`Login failed: ${err.message}`);
        }
      } else {
         // Not an Axios error
         setError(`Login failed: ${err.message || 'An unknown error occurred.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <View style={styles.container}>
      
       <TextInput
         style={styles.input}
         placeholder="Email (Username)"
         value={email}
         onChangeText={setEmail}
         keyboardType="email-address"
         autoCapitalize="none"
       />
       <TextInput
         style={styles.input}
         placeholder="Password"
         value={password}
         onChangeText={setPassword}
         secureTextEntry
       />

       {error && <Text style={styles.errorText}>{error}</Text>}

       <TouchableOpacity
         style={[styles.button, isLoading && styles.buttonDisabled]}
         onPress={handleLogin}
         disabled={isLoading}
       >
         {isLoading ? (
           <ActivityIndicator size="small" color="#ffffff" />
         ) : (
           <Text style={styles.buttonText}>Log In</Text>
         )}
       </TouchableOpacity>

    
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  input: { height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10, paddingHorizontal: 10 },
  button: { backgroundColor: 'blue', padding: 15, alignItems: 'center', borderRadius: 5 },
  buttonDisabled: { backgroundColor: 'grey' },
  buttonText: { color: 'white', fontWeight: 'bold' },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
});
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import HomeScreen from "./screens/HomeScreen"
import InventoryScreen from "./screens/InventoryScreen"
import SalesScreen from "./screens/SalesScreen"
import SuppliersScreen from "./screens/SuppliersScreen"
import ProfileScreen from "./screens/ProfileScreen"
import LoginScreen from "./screens/LoginScreen"
import SignupScreen from "./screens/SignupScreen"
import SettingsScreen from "./screens/SettingsScreen"
import EditProfileScreen from "./screens/EditProfileScreen"
import ChangePasswordScreen from "./screens/ChangePasswordScreen"
import NotificationsScreen from "./screens/NotificationsScreen"
import HelpSupportScreen from "./screens/HelpSupportScreen"
import AboutScreen from "./screens/AboutScreen"
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
  
const Stack = createNativeStackNavigator();
  
function RootStack() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Inventory" component={InventoryScreen} />
      <Stack.Screen name="Sales" component={SalesScreen} />
      <Stack.Screen name="Suppliers" component={SuppliersScreen} />
    </Stack.Navigator>
  );
}
  
export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SafeAreaProvider style={styles.container}>
          <Toaster />
          <NavigationContainer>
            <RootStack />
          </NavigationContainer>
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
  
const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none"
  }
});

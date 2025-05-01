// Example structure for app/_layout.tsx
import React, { useEffect } from 'react';
import { Href, Slot, useRouter, useSegments } from 'expo-router';
// Import AuthProvider
import { AuthProvider, useAuth } from '@/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

function RootLayoutContent() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuth(); // Now using the real auth context

  useEffect(() => {
    if (isLoading) {
      return; // Wait until auth status is determined
    }

    const inAuthGroup = segments.length > 0 && segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated and not already in auth flow
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to main app if authenticated and somehow landed in auth flow
      router.replace('/(tabs)/' as Href); // Or your default authenticated route
    }
  }, [isAuthenticated, isLoading, segments, router]);

  // Optionally show a loading spinner while checking auth
  if (isLoading) {
    // return <LoadingSpinner />;
    return null; // Or a splash screen component
  }

  // Render the current route determined by Expo Router
  return <Slot />;
}
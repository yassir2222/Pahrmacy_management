import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

type RootStackParamList = {
  Profile: undefined;
  About: undefined;
};

type AboutScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'About'>;
};

export default function AboutScreen({ navigation }: AboutScreenProps) {
  const { theme } = useTheme();

  const appVersion = '1.0.0';
  const buildNumber = '1';

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://se7ati.com/privacy-policy');
  };

  const handleTermsOfService = () => {
    Linking.openURL('https://se7ati.com/terms-of-service');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('../assets/profile.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: theme.text }]}>Se7ati</Text>
          <Text style={[styles.version, { color: theme.textSecondary }]}>
            Version {appVersion} ({buildNumber})
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>About Se7ati</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            Se7ati is a comprehensive pharmacy management system designed to help pharmacies streamline their operations, 
            manage inventory, track sales, and provide better service to their customers. Our mission is to make pharmacy 
            management more efficient and accessible.
          </Text>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Features</Text>
          <View style={styles.featureList}>
            {[
              'Inventory Management',
              'Sales Tracking',
              'Supplier Management',
              'Reports & Analytics',
              'Low Stock Alerts',
              'Expiry Date Tracking',
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                <Text style={[styles.featureText, { color: theme.text }]}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: theme.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Legal</Text>
          <TouchableOpacity 
            style={styles.link}
            onPress={handlePrivacyPolicy}
          >
            <Text style={[styles.linkText, { color: theme.primary }]}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.link}
            onPress={handleTermsOfService}
          >
            <Text style={[styles.linkText, { color: theme.primary }]}>Terms of Service</Text>
            <Ionicons name="chevron-forward" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.copyright, { color: theme.textSecondary }]}>
          © 2024 Se7ati. All rights reserved.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    padding: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
  },
  link: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkText: {
    fontSize: 16,
  },
  copyright: {
    textAlign: 'center',
    padding: 16,
    fontSize: 14,
  },
}); 
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

type RootStackParamList = {
  Profile: undefined;
  Notifications: undefined;
};

type NotificationsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Notifications'>;
};

type NotificationSetting = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

export default function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const { theme } = useTheme();
  
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      title: 'Push Notifications',
      description: 'Receive push notifications for important updates',
      enabled: true,
    },
    {
      id: '2',
      title: 'Low Stock Alerts',
      description: 'Get notified when products are running low',
      enabled: true,
    },
    {
      id: '3',
      title: 'Order Updates',
      description: 'Receive updates about order status changes',
      enabled: true,
    },
    {
      id: '4',
      title: 'Expiry Alerts',
      description: 'Get notified about products nearing expiry',
      enabled: true,
    },
    {
      id: '5',
      title: 'Sales Reports',
      description: 'Receive daily sales report notifications',
      enabled: false,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(setting => 
      setting.id === id 
        ? { ...setting, enabled: !setting.enabled }
        : setting
    ));
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {settings.map(setting => (
          <View 
            key={setting.id}
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
          >
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: theme.text }]}>
                {setting.title}
              </Text>
              <Text style={[styles.settingDescription, { color: theme.textSecondary }]}>
                {setting.description}
              </Text>
            </View>
            <Switch
              value={setting.enabled}
              onValueChange={() => toggleSetting(setting.id)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="white"
            />
          </View>
        ))}

        <Text style={[styles.note, { color: theme.textSecondary }]}>
          Note: Turning off notifications may cause you to miss important updates about your pharmacy.
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    margin: 16,
    textAlign: 'center',
  },
}); 
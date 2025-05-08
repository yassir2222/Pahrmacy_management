import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

type SettingsScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Settings'>;
};

type SettingItemProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  rightElement?: React.ReactNode;
};

const SettingItem: React.FC<SettingItemProps> = ({ title, icon, onPress, rightElement }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: theme.border }]} 
      onPress={onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: theme.iconBackground }]}>
        <Ionicons name={icon} size={24} color={theme.primary} />
      </View>
      <Text style={[styles.settingText, { color: theme.text }]}>{title}</Text>
      {rightElement || <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />}
    </TouchableOpacity>
  );
};

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { theme, isDarkMode, toggleDarkMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionHeader, { color: theme.text }]}>App Settings</Text>
        <View style={[styles.settingsGroup, { backgroundColor: theme.surface }]}>
          <SettingItem
            title="Notifications"
            icon="notifications-outline"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={notificationsEnabled ? theme.surface : theme.textSecondary}
              />
            }
          />
          <SettingItem
            title="Dark Mode"
            icon="moon-outline"
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={isDarkMode ? theme.surface : theme.textSecondary}
              />
            }
          />
          <SettingItem
            title="Language"
            icon="language-outline"
            onPress={() => {}}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.text }]}>Account</Text>
        <View style={[styles.settingsGroup, { backgroundColor: theme.surface }]}>
          <SettingItem
            title="Privacy Policy"
            icon="shield-outline"
            onPress={() => {}}
          />
          <SettingItem
            title="Terms of Service"
            icon="document-text-outline"
            onPress={() => {}}
          />
          <SettingItem
            title="Help & Support"
            icon="help-circle-outline"
            onPress={() => {}}
          />
          <SettingItem
            title="About"
            icon="information-circle-outline"
            onPress={() => {}}
          />
        </View>

        <Text style={[styles.sectionHeader, { color: theme.text }]}>Data & Storage</Text>
        <View style={[styles.settingsGroup, { backgroundColor: theme.surface }]}>
          <SettingItem
            title="Clear Cache"
            icon="trash-outline"
            onPress={() => {}}
          />
          <SettingItem
            title="Export Data"
            icon="download-outline"
            onPress={() => {}}
          />
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 32,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  settingsGroup: {
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingIcon: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
  },
}); 
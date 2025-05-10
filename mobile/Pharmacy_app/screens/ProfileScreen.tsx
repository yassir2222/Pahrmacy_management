import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

type ProfileActionProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
  ChangePassword: undefined;
  Notifications: undefined;
  HelpSupport: undefined;
  About: undefined;
  Settings: undefined;
  Login: undefined;
};

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

const ProfileAction: React.FC<ProfileActionProps> = ({ title, icon, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity 
      style={[styles.actionButton, { borderBottomColor: theme.surface }]} 
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: theme.surface }]}>
        <Ionicons name={icon} size={24} color={theme.primary} />
      </View>
      <Text style={[styles.actionText, { color: theme.text }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
    </TouchableOpacity>
  );
};

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { theme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const profileActions = [
    { 
      title: 'Edit Profile', 
      icon: 'person-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('EditProfile')
    },
    { 
      title: 'Change Password', 
      icon: 'lock-closed-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('ChangePassword')
    },
    { 
      title: 'Notifications', 
      icon: 'notifications-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('Notifications')
    },
    { 
      title: 'Help & Support', 
      icon: 'help-circle-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('HelpSupport')
    },
    { 
      title: 'About', 
      icon: 'information-circle-outline' as keyof typeof Ionicons.glyphMap,
      onPress: () => navigation.navigate('About')
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { borderBottomColor: theme.surface }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.surface }]}>
            <Image 
              source={require('../assets/profile.png')}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{user?.name || 'User'}</Text>
          <Text style={[styles.role, { color: theme.textSecondary }]}>Pharmacy Manager</Text>
        </View>

        <Text style={[styles.sectionHeaderText, { color: theme.text }]}>Account Settings</Text>
        <View style={[styles.actionsContainer, { backgroundColor: theme.surface }]}>
          {profileActions.map((action, index) => (
            <ProfileAction
              key={index}
              title={action.title}
              icon={action.icon}
              onPress={action.onPress}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: theme.error + '20' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={24} color={theme.error} />
          <Text style={[styles.logoutText, { color: theme.error }]}>Log Out</Text>
        </TouchableOpacity>
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
  settingsButton: {
    padding: 4,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    fontSize: 16,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  actionsContainer: {
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  actionIcon: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
}); 
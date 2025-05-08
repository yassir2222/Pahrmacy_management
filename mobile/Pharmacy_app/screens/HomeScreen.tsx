import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Inventory: undefined;
  Sales: undefined;
  Medicines: undefined;
  Suppliers: undefined;
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

type DashboardCardProps = {
  title: string;
  value: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  subtitle?: string;
};

type QuickActionProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type QuickActionItem = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  screen: keyof RootStackParamList;
};

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color, subtitle }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.card, { borderLeftColor: color, backgroundColor: theme.surface }]}>
      <MaterialCommunityIcons name={icon} size={24} color={color} />
      <Text style={[styles.cardTitle, { color: theme.textSecondary }]}>{title}</Text>
      <Text style={[styles.cardValue, { color: theme.text }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      )}
    </View>
  );
};

const QuickAction: React.FC<QuickActionProps> = ({ title, icon, onPress }) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity 
      style={[styles.quickAction, { backgroundColor: theme.surface }]} 
      onPress={onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: theme.iconBackground }]}>
        <Ionicons name={icon} size={24} color={theme.primary} />
      </View>
      <Text style={[styles.quickActionText, { color: theme.text }]}>{title}</Text>
    </TouchableOpacity>
  );
};

type Activity = {
  id: string;
  type: 'sale' | 'stock' | 'expiry' | 'order' | 'delivery';
  title: string;
  time: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const { theme } = useTheme();
  const warningColor = '#f59e0b';
  const infoColor = '#0ea5e9';
  
  const [recentActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'sale',
      title: 'New sale - DH 450',
      time: '2 mins ago',
      icon: 'cart-outline',
      color: theme.success,
    },
    {
      id: '2',
      type: 'expiry',
      title: 'Paracetamol expiring soon',
      time: '1 hour ago',
      icon: 'warning-outline',
      color: warningColor,
    },
    {
      id: '3',
      type: 'stock',
      title: 'Low stock - Amoxicillin',
      time: '2 hours ago',
      icon: 'alert-circle-outline',
      color: theme.error,
    },
    {
      id: '4',
      type: 'delivery',
      title: 'Supplier delivery received',
      time: '3 hours ago',
      icon: 'cube-outline',
      color: theme.primary,
    },
  ]);

  const quickActions: QuickActionItem[] = [
    { title: 'Inventory', icon: 'cube-outline', screen: 'Inventory' },
    { title: 'Sales', icon: 'cart-outline', screen: 'Sales' },
    { title: 'Medicines', icon: 'medical-outline', screen: 'Medicines' },
    { title: 'Suppliers', icon: 'people-outline', screen: 'Suppliers' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Se7ati</Text>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle-outline" size={32} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.dashboardGrid}>
          <DashboardCard 
            title="Today's Sales"
            value="DH 4,532"
            subtitle="Target: DH 5,000"
            icon="cash"
            color={theme.success}
          />
          <DashboardCard 
            title="Low Stock"
            value="8"
            subtitle="Items need restock"
            icon="alert-circle"
            color={theme.error}
          />
          <DashboardCard 
            title="Expiring Soon"
            value="12"
            subtitle="Within 30 days"
            icon="calendar-alert"
            color={warningColor}
          />
          <DashboardCard 
            title="Out of Stock"
            value="5"
            subtitle="Items to order"
            icon="package-variant-closed"
            color="#9333ea"
          />
          <DashboardCard 
            title="Pending Orders"
            value="3"
            subtitle="From suppliers"
            icon="truck-delivery"
            color={infoColor}
          />
          <DashboardCard 
            title="Total Medicines"
            value="2,534"
            subtitle="In inventory"
            icon="pill"
            color={theme.primary}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <QuickAction
              key={index}
              title={action.title}
              icon={action.icon}
              onPress={() => navigation.navigate(action.screen)}
            />
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activities</Text>
        <View style={[styles.recentActivities, { backgroundColor: theme.surface }]}>
          {recentActivities.map((activity) => (
            <View 
              key={activity.id} 
              style={[styles.activityItem, { borderBottomColor: theme.border }]}
            >
              <View style={[styles.activityIcon, { backgroundColor: `${activity.color}20` }]}>
                <Ionicons name={activity.icon} size={20} color={activity.color} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: theme.text }]}>
                  {activity.title}
                </Text>
                <Text style={[styles.activityTime, { color: theme.textSecondary }]}>
                  {activity.time}
                </Text>
              </View>
            </View>
          ))}
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
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    margin: 8,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
  },
  cardTitle: {
    fontSize: 14,
    marginTop: 8,
  },
  cardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  quickAction: {
    width: '45%',
    borderRadius: 12,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recentActivities: {
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  activityIcon: {
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    marginTop: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
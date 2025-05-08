import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';

type RootStackParamList = {
  Profile: undefined;
  HelpSupport: undefined;
};

type HelpSupportScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'HelpSupport'>;
};

type FAQ = {
  id: string;
  question: string;
  answer: string;
};

type SupportOption = {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  action: () => void;
};

export default function HelpSupportScreen({ navigation }: HelpSupportScreenProps) {
  const { theme } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I add new medicines to inventory?',
      answer: 'Go to the Medicines screen and tap the + button. Fill in the required details about the medicine and save.',
    },
    {
      id: '2',
      question: 'How do I track low stock items?',
      answer: 'The dashboard shows a Low Stock card with the number of items running low. You can also set up notifications for low stock alerts.',
    },
    {
      id: '3',
      question: 'How do I generate sales reports?',
      answer: 'Navigate to the Sales screen and use the Reports feature to generate daily, weekly, or monthly sales reports.',
    },
    {
      id: '4',
      question: 'How do I manage suppliers?',
      answer: 'Use the Suppliers screen to add, edit, or remove suppliers. You can also track their delivery history and contact information.',
    },
  ];

  const supportOptions: SupportOption[] = [
    {
      id: '1',
      title: 'Email Support',
      description: 'Send us an email for detailed assistance',
      icon: 'mail-outline',
      action: () => Linking.openURL('mailto:support@se7ati.com'),
    },
    {
      id: '2',
      title: 'Phone Support',
      description: 'Call us for immediate help',
      icon: 'call-outline',
      action: () => Linking.openURL('tel:+212605197666'),
    },
    {
      id: '3',
      title: 'WhatsApp',
      description: 'Chat with us on WhatsApp',
      icon: 'logo-whatsapp',
      action: () => Linking.openURL('https://wa.me/212604239628'),
    },
    {
      id: '4',
      title: 'Documentation',
      description: 'Read our detailed documentation',
      icon: 'document-text-outline',
      action: () => Linking.openURL('https://docs.se7ati.com'),
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Frequently Asked Questions</Text>
        
        {faqs.map(faq => (
          <TouchableOpacity
            key={faq.id}
            style={[styles.faqItem, { backgroundColor: theme.surface }]}
            onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
          >
            <View style={styles.faqHeader}>
              <Text style={[styles.question, { color: theme.text }]}>{faq.question}</Text>
              <Ionicons 
                name={expandedFaq === faq.id ? "chevron-up" : "chevron-down"} 
                size={24} 
                color={theme.text} 
              />
            </View>
            {expandedFaq === faq.id && (
              <Text style={[styles.answer, { color: theme.textSecondary }]}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Contact Us</Text>
        
        <View style={styles.supportGrid}>
          {supportOptions.map(option => (
            <TouchableOpacity
              key={option.id}
              style={[styles.supportItem, { backgroundColor: theme.surface }]}
              onPress={option.action}
            >
              <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name={option.icon} size={24} color={theme.primary} />
              </View>
              <Text style={[styles.supportTitle, { color: theme.text }]}>{option.title}</Text>
              <Text style={[styles.supportDescription, { color: theme.textSecondary }]}>
                {option.description}
              </Text>
            </TouchableOpacity>
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  faqItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginRight: 16,
  },
  answer: {
    fontSize: 14,
    marginTop: 12,
    lineHeight: 20,
  },
  supportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  supportItem: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 14,
  },
}); 
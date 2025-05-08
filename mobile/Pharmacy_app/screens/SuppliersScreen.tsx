import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  products: number;
  lastOrder: string;
  status: 'active' | 'inactive';
}

type RootStackParamList = {
  Home: undefined;
  Suppliers: undefined;
  // Add other screen names as needed
};

type SuppliersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Suppliers'>;

interface SuppliersScreenProps {
  navigation: SuppliersScreenNavigationProp;
}

const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'PharmaCorp International',
    contact: '+212 6XX-XXXXXX',
    email: 'contact@pharmacorp.com',
    products: 150,
    lastOrder: '2024-03-10',
    status: 'active' as const,
  },
  {
    id: '2',
    name: 'MediSupply Co.',
    contact: '+212 6XX-XXXXXX',
    email: 'orders@medisupply.com',
    products: 85,
    lastOrder: '2024-03-05',
    status: 'active' as const,
  },
  {
    id: '3',
    name: 'Global Health Products',
    contact: '+212 6XX-XXXXXX',
    email: 'info@globalhealth.com',
    products: 200,
    lastOrder: '2024-02-28',
    status: 'inactive' as const,
  },
];

export default function SuppliersScreen({ navigation }: SuppliersScreenProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [newSupplier, setNewSupplier] = useState<Partial<Supplier>>({
    name: '',
    contact: '',
    email: '',
    products: 0,
    status: 'active',
  });

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSupplier = (supplierId: string) => {
    Alert.alert(
      'Delete Supplier',
      'Are you sure you want to delete this supplier?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSuppliers(suppliers.filter(supplier => supplier.id !== supplierId));
          },
        },
      ],
    );
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setNewSupplier(supplier);
    setModalVisible(true);
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.contact || !newSupplier.email) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (editingSupplier) {
      // Update existing supplier
      setSuppliers(suppliers.map(supplier => 
        supplier.id === editingSupplier.id
          ? {
              ...supplier,
              name: newSupplier.name || supplier.name,
              contact: newSupplier.contact || supplier.contact,
              email: newSupplier.email || supplier.email,
              products: newSupplier.products || supplier.products,
              status: newSupplier.status || supplier.status,
            }
          : supplier
      ));
    } else {
      // Add new supplier
      const today = new Date().toISOString().split('T')[0];
      const supplierToAdd: Supplier = {
        id: (suppliers.length + 1).toString(),
        name: newSupplier.name || '',
        contact: newSupplier.contact || '',
        email: newSupplier.email || '',
        products: newSupplier.products || 0,
        lastOrder: today,
        status: newSupplier.status as 'active' | 'inactive',
      };
      setSuppliers([...suppliers, supplierToAdd]);
    }
    
    // Reset form and close modal
    setNewSupplier({
      name: '',
      contact: '',
      email: '',
      products: 0,
      status: 'active',
    });
    setEditingSupplier(null);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Supplier }) => (
    <TouchableOpacity style={[styles.supplierCard, { backgroundColor: theme.surface }]}>
      <View style={styles.supplierHeader}>
        <Text style={[styles.supplierName, { color: theme.text }]}>{item.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'active' ? theme.success + '20' : theme.error + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'active' ? theme.success : theme.error }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactText, { color: theme.textSecondary }]}>
          {item.contact}
        </Text>
        <Text style={[styles.emailText, { color: theme.textSecondary }]}>
          {item.email}
        </Text>
      </View>
      <View style={styles.supplierDetails}>
        <Text style={[styles.productsText, { color: theme.textSecondary }]}>
          Products: {item.products}
        </Text>
        <Text style={[styles.lastOrderText, { color: theme.textSecondary }]}>
          Last Order: {item.lastOrder}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
          onPress={() => handleEditSupplier(item)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
          onPress={() => handleDeleteSupplier(item.id)}
        >
          <MaterialCommunityIcons name="delete" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Suppliers</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="plus-circle" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { 
        backgroundColor: theme.surface,
        borderColor: theme.border
      }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search suppliers..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredSuppliers}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      {/* Add Supplier Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add New Supplier</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Supplier Name *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  placeholder="Enter supplier name"
                  placeholderTextColor={theme.textSecondary}
                  value={newSupplier.name}
                  onChangeText={(text) => setNewSupplier({...newSupplier, name: text})}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Contact Number *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  placeholder="Enter contact number"
                  placeholderTextColor={theme.textSecondary}
                  value={newSupplier.contact}
                  onChangeText={(text) => setNewSupplier({...newSupplier, contact: text})}
                  keyboardType="phone-pad"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Email *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  placeholder="Enter email address"
                  placeholderTextColor={theme.textSecondary}
                  value={newSupplier.email}
                  onChangeText={(text) => setNewSupplier({...newSupplier, email: text})}
                  keyboardType="email-address"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Number of Products</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  placeholder="Enter number of products"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                  value={newSupplier.products?.toString()}
                  onChangeText={(text) => setNewSupplier({...newSupplier, products: parseInt(text) || 0})}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Status</Text>
                <View style={styles.statusToggle}>
                  <TouchableOpacity 
                    style={[
                      styles.statusOption, 
                      { 
                        backgroundColor: newSupplier.status === 'active' ? theme.primary : theme.surface,
                        borderColor: theme.border
                      }
                    ]}
                    onPress={() => setNewSupplier({...newSupplier, status: 'active'})}
                  >
                    <Text style={[
                      styles.statusOptionText, 
                      { color: newSupplier.status === 'active' ? 'white' : theme.text }
                    ]}>
                      Active
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.statusOption, 
                      { 
                        backgroundColor: newSupplier.status === 'inactive' ? theme.primary : theme.surface,
                        borderColor: theme.border
                      }
                    ]}
                    onPress={() => setNewSupplier({...newSupplier, status: 'inactive'})}
                  >
                    <Text style={[
                      styles.statusOptionText, 
                      { color: newSupplier.status === 'inactive' ? 'white' : theme.text }
                    ]}>
                      Inactive
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity 
                style={[styles.cancelButton, { borderColor: theme.border }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: theme.primary }]}
                onPress={handleAddSupplier}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  list: {
    padding: 16,
  },
  supplierCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supplierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactInfo: {
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    marginBottom: 2,
  },
  emailText: {
    fontSize: 14,
  },
  supplierDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productsText: {
    fontSize: 14,
  },
  lastOrderText: {
    fontSize: 14,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 16,
    maxHeight: '70%',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  statusToggle: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
  },
  statusOption: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRightWidth: 1,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
});
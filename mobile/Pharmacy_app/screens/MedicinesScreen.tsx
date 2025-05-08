import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Medicines: undefined;
  Home: undefined;
};

type MedicinesScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Medicines'>;
};

interface Medicine {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  price: number;
  supplier: string;
  expiryDate: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

const mockMedicines: Medicine[] = [
  {
    id: '1',
    name: 'Paracetamol 500mg',
    description: 'Pain reliever and fever reducer',
    quantity: 100,
    price: 25.00,
    category: 'Pain Relief',
    supplier: 'PharmaCorp',
    expiryDate: '2026-03-15',
    status: 'In Stock' as const,
  },
  {
    id: '2',
    name: 'Amoxicillin 250mg',
    description: 'Antibiotic for bacterial infections',
    quantity: 50,
    price: 100.00,
    category: 'Antibiotics',
    supplier: 'MediSupply',
    expiryDate: '2025-12-20',
    status: 'In Stock' as const,
  },
  {
    id: '3',
    name: 'Aspirin 100mg',
    description: 'Blood thinner and pain reliever',
    quantity: 5,
    price: 25.17,
    category: 'Pain Relief',
    supplier: 'HealthPharm',
    expiryDate: '2025-06-30',
    status: 'Low Stock' as const,
  },
];

const MedicinesScreen: React.FC<MedicinesScreenProps> = ({ navigation }) => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>(mockMedicines);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [newMedicine, setNewMedicine] = useState<Partial<Medicine>>({
    name: '',
    description: '',
    quantity: 0,
    price: 0,
    category: '',
    supplier: '',
    expiryDate: '',
    status: 'In Stock',
  });

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteMedicine = (medicineId: string) => {
    Alert.alert(
      'Delete Medicine',
      'Are you sure you want to delete this medicine?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setMedicines(medicines.filter(medicine => medicine.id !== medicineId));
          },
        },
      ],
    );
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setNewMedicine(medicine);
    setModalVisible(true);
  };

  const handleAddMedicine = () => {
    if (!newMedicine.name || !newMedicine.description || !newMedicine.quantity || 
        !newMedicine.price || !newMedicine.category || !newMedicine.supplier || !newMedicine.expiryDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (editingMedicine) {
      // Update existing medicine
      setMedicines(medicines.map(medicine => 
        medicine.id === editingMedicine.id
          ? {
              ...medicine,
              name: newMedicine.name || medicine.name,
              description: newMedicine.description || medicine.description,
              quantity: newMedicine.quantity || medicine.quantity,
              price: newMedicine.price || medicine.price,
              category: newMedicine.category || medicine.category,
              supplier: newMedicine.supplier || medicine.supplier,
              expiryDate: newMedicine.expiryDate || medicine.expiryDate,
              status: newMedicine.status || medicine.status,
            }
          : medicine
      ));
    } else {
      // Add new medicine
      const medicineToAdd: Medicine = {
        id: (medicines.length + 1).toString(),
        name: newMedicine.name,
        description: newMedicine.description,
        quantity: newMedicine.quantity,
        price: newMedicine.price,
        category: newMedicine.category,
        supplier: newMedicine.supplier,
        expiryDate: newMedicine.expiryDate,
        status: newMedicine.status as 'In Stock' | 'Low Stock' | 'Out of Stock',
      };
      setMedicines([...medicines, medicineToAdd]);
    }
    
    // Reset form and close modal
    setNewMedicine({
      name: '',
      description: '',
      quantity: 0,
      price: 0,
      category: '',
      supplier: '',
      expiryDate: '',
      status: 'In Stock',
    });
    setEditingMedicine(null);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Medicine }) => (
    <TouchableOpacity style={[styles.medicineCard, { backgroundColor: theme.surface }]}>
      <View style={styles.medicineHeader}>
        <Text style={[styles.medicineName, { color: theme.text }]}>{item.name}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: 
            item.status === 'In Stock' ? theme.success + '20' : 
            item.status === 'Low Stock' ? theme.error + '20' : 
            theme.error + '20' 
          }
        ]}>
          <Text style={[
            styles.statusText,
            { color: 
              item.status === 'In Stock' ? theme.success : 
              item.status === 'Low Stock' ? theme.error : 
              theme.error 
            }
          ]}>
            {item.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </Text>
        </View>
      </View>
      <Text style={[styles.description, { color: theme.textSecondary }]}>{item.description}</Text>
      <View style={styles.details}>
        <Text style={[styles.detailText, { color: theme.textSecondary }]}>
          Category: {item.category}
        </Text>
        <Text style={[styles.detailText, { color: theme.textSecondary }]}>
          Supplier: {item.supplier}
        </Text>
        <Text style={[styles.detailText, { color: theme.textSecondary }]}>
          Expiry: {item.expiryDate}
        </Text>
      </View>
      <View style={styles.footer}>
        <Text style={[styles.quantity, { color: theme.text }]}>
          Quantity: {item.quantity}
        </Text>
        <Text style={[styles.price, { color: theme.primary }]}>
          ${item.price.toFixed(2)}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
          onPress={() => handleEditMedicine(item)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
          onPress={() => handleDeleteMedicine(item.id)}
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Medicines</Text>
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
          placeholder="Search medicines..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredMedicines}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      {/* Add Medicine Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>New Medicine</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Name *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  placeholder="Enter medicine name"
                  placeholderTextColor={theme.textSecondary}
                  value={newMedicine.name}
                  onChangeText={(text) => setNewMedicine({...newMedicine, name: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  placeholder="Enter medicine description"
                  placeholderTextColor={theme.textSecondary}
                  value={newMedicine.description}
                  onChangeText={(text) => setNewMedicine({...newMedicine, description: text})}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Quantity *</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.surface,
                      color: theme.text,
                      borderColor: theme.border
                    }]}
                    placeholder="Enter quantity"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={newMedicine.quantity?.toString()}
                    onChangeText={(text) => setNewMedicine({...newMedicine, quantity: parseInt(text) || 0})}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Price *</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.surface,
                      color: theme.text,
                      borderColor: theme.border
                    }]}
                    placeholder="Enter price"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={newMedicine.price?.toString()}
                    onChangeText={(text) => setNewMedicine({...newMedicine, price: parseFloat(text) || 0})}
                  />
                </View>
              </View>

              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Category *</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.surface,
                      color: theme.text,
                      borderColor: theme.border
                    }]}
                    placeholder="Enter category"
                    placeholderTextColor={theme.textSecondary}
                    value={newMedicine.category}
                    onChangeText={(text) => setNewMedicine({...newMedicine, category: text})}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>Supplier *</Text>
                  <TextInput
                    style={[styles.input, { 
                      backgroundColor: theme.surface,
                      color: theme.text,
                      borderColor: theme.border
                    }]}
                    placeholder="Enter supplier"
                    placeholderTextColor={theme.textSecondary}
                    value={newMedicine.supplier}
                    onChangeText={(text) => setNewMedicine({...newMedicine, supplier: text})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Expiry Date *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textSecondary}
                  value={newMedicine.expiryDate}
                  onChangeText={(text) => setNewMedicine({...newMedicine, expiryDate: text})}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Status</Text>
                <View style={styles.statusToggle}>
                  <TouchableOpacity 
                    style={[
                      styles.statusOption, 
                      { 
                        backgroundColor: newMedicine.status === 'In Stock' ? theme.primary : theme.surface,
                        borderColor: theme.border
                      }
                    ]}
                    onPress={() => setNewMedicine({...newMedicine, status: 'In Stock'})}
                  >
                    <Text style={[
                      styles.statusOptionText, 
                      { color: newMedicine.status === 'In Stock' ? 'white' : theme.text }
                    ]}>
                      In Stock
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.statusOption, 
                      { 
                        backgroundColor: newMedicine.status === 'Low Stock' ? theme.primary : theme.surface,
                        borderColor: theme.border
                      }
                    ]}
                    onPress={() => setNewMedicine({...newMedicine, status: 'Low Stock'})}
                  >
                    <Text style={[
                      styles.statusOptionText, 
                      { color: newMedicine.status === 'Low Stock' ? 'white' : theme.text }
                    ]}>
                      Low Stock
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.statusOption, 
                      { 
                        backgroundColor: newMedicine.status === 'Out of Stock' ? theme.primary : theme.surface,
                        borderColor: theme.border
                      }
                    ]}
                    onPress={() => setNewMedicine({...newMedicine, status: 'Out of Stock'})}
                  >
                    <Text style={[
                      styles.statusOptionText, 
                      { color: newMedicine.status === 'Out of Stock' ? 'white' : theme.text }
                    ]}>
                      Out of Stock
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
                onPress={handleAddMedicine}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

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
  medicineCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicineName: {
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
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  details: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  quantity: {
    fontSize: 14,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 16,
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

export default MedicinesScreen;
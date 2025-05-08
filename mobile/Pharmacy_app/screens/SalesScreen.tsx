import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface SaleItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Sale {
  id: string;
  date: string;
  customerName: string;
  total: number;
  items: SaleItem[];
  status: 'completed' | 'pending' | 'cancelled';
}

type RootStackParamList = {
  Home: undefined;
  Sales: undefined;
  // Add other screen names as needed
};

type SalesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sales'>;

interface SalesScreenProps {
  navigation: SalesScreenNavigationProp;
}

const mockSales: Sale[] = [
  {
    id: '1',
    date: '2024-03-15',
    customerName: 'Lambrass Yassir',
    total: 150.00,
    items: [
      { id: '1', name: 'Paracetamol 500mg', quantity: 2, price: 25.00 },
      { id: '2', name: 'Amoxicillin 250mg', quantity: 1, price: 100.00 },
    ],
    status: 'completed' as const,
  },
  {
    id: '2',
    date: '2024-03-14',
    customerName: 'Alassri Ghali',
    total: 75.50,
    items: [
      { id: '3', name: 'Aspirin 100mg', quantity: 3, price: 25.17 },
    ],
    status: 'pending' as const,
  },
  {
    id: '3',
    date: '2024-03-13',
    customerName: 'El Houfi Ashraf',
    total: 200.00,
    items: [
      { id: '4', name: 'Ibuprofen 400mg', quantity: 4, price: 50.00 },
    ],
    status: 'cancelled' as const,
  },
];

export default function SalesScreen({ navigation }: SalesScreenProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [newSale, setNewSale] = useState<Partial<Sale>>({
    customerName: '',
    items: [],
    status: 'pending',
  });
  const [newItem, setNewItem] = useState<Partial<SaleItem>>({
    name: '',
    quantity: 1,
    price: 0,
  });

  const filteredSales = sales.filter(sale =>
    sale.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSale = (saleId: string) => {
    Alert.alert(
      'Delete Sale',
      'Are you sure you want to delete this sale?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setSales(sales.filter(sale => sale.id !== saleId));
          },
        },
      ],
    );
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setNewSale(sale);
    setModalVisible(true);
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) {
      Alert.alert('Error', 'Please fill in all item fields');
      return;
    }

    const itemToAdd: SaleItem = {
      id: (newSale.items?.length || 0 + 1).toString(),
      name: newItem.name,
      quantity: newItem.quantity,
      price: newItem.price,
    };

    setNewSale({
      ...newSale,
      items: [...(newSale.items || []), itemToAdd],
    });

    setNewItem({
      name: '',
      quantity: 1,
      price: 0,
    });
  };

  const handleAddSale = () => {
    if (!newSale.customerName || !newSale.items?.length) {
      Alert.alert('Error', 'Please fill in all required fields and add at least one item');
      return;
    }

    if (editingSale) {
      // Update existing sale
      setSales(sales.map(sale => 
        sale.id === editingSale.id
          ? {
              ...sale,
              customerName: newSale.customerName || sale.customerName,
              items: newSale.items || sale.items,
              status: newSale.status || sale.status,
              total: newSale.items?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || sale.total,
            }
          : sale
      ));
    } else {
      // Add new sale
      const today = new Date().toISOString().split('T')[0];
      const total = newSale.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      const saleToAdd: Sale = {
        id: (sales.length + 1).toString(),
        date: today,
        customerName: newSale.customerName,
        total,
        items: newSale.items,
        status: newSale.status as 'completed' | 'pending' | 'cancelled',
      };
      setSales([...sales, saleToAdd]);
    }
    
    setNewSale({
      customerName: '',
      items: [],
      status: 'pending',
    });
    setEditingSale(null);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Sale }) => (
    <TouchableOpacity style={[styles.saleCard, { backgroundColor: theme.surface }]}>
      <View style={styles.saleHeader}>
        <Text style={[styles.customerName, { color: theme.text }]}>{item.customerName}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: 
            item.status === 'completed' ? theme.success + '20' : 
            item.status === 'pending' ? theme.error + '20' : 
            theme.error + '20' 
          }
        ]}>
          <Text style={[
            styles.statusText,
            { color: 
              item.status === 'completed' ? theme.success : 
              item.status === 'pending' ? theme.error : 
              theme.error 
            }
          ]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      <View style={styles.saleDetails}>
        <Text style={[styles.dateText, { color: theme.textSecondary }]}>
          Date: {item.date}
        </Text>
        <Text style={[styles.totalText, { color: theme.text }]}>
          Total: ${item.total.toFixed(2)}
        </Text>
      </View>
      <View style={styles.itemsList}>
        {item.items.map((saleItem) => (
          <Text key={saleItem.id} style={[styles.itemText, { color: theme.textSecondary }]}>
            {saleItem.quantity}x {saleItem.name} - ${(saleItem.price * saleItem.quantity).toFixed(2)}
          </Text>
        ))}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
          onPress={() => handleEditSale(item)}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
          onPress={() => handleDeleteSale(item.id)}
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
        <Text style={[styles.headerTitle, { color: theme.text }]}>Sales</Text>
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
          placeholder="Search sales..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredSales}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      {/* Add Sale Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>New Sale</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Customer Name *</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  placeholder="Enter customer name"
                  placeholderTextColor={theme.textSecondary}
                  value={newSale.customerName}
                  onChangeText={(text) => setNewSale({...newSale, customerName: text})}
                />
              </View>

              <View style={styles.itemsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Items</Text>
                {newSale.items?.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.itemDetails, { color: theme.textSecondary }]}>
                      {item.quantity}x ${item.price.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Add Item</Text>
                <TextInput
                  style={[styles.input, { 
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border
                  }]}
                  placeholder="Item name"
                  placeholderTextColor={theme.textSecondary}
                  value={newItem.name}
                  onChangeText={(text) => setNewItem({...newItem, name: text})}
                />
                <View style={styles.itemInputRow}>
                  <TextInput
                    style={[styles.input, styles.quantityInput, { 
                      backgroundColor: theme.surface,
                      color: theme.text,
                      borderColor: theme.border
                    }]}
                    placeholder="Qty"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={newItem.quantity?.toString()}
                    onChangeText={(text) => setNewItem({...newItem, quantity: parseInt(text) || 1})}
                  />
                  <TextInput
                    style={[styles.input, styles.priceInput, { 
                      backgroundColor: theme.surface,
                      color: theme.text,
                      borderColor: theme.border
                    }]}
                    placeholder="Price"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                    value={newItem.price?.toString()}
                    onChangeText={(text) => setNewItem({...newItem, price: parseFloat(text) || 0})}
                  />
                </View>
                <TouchableOpacity 
                  style={[styles.addItemButton, { backgroundColor: theme.primary }]}
                  onPress={handleAddItem}
                >
                  <Text style={styles.addItemButtonText}>Add Item</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Status</Text>
                <View style={styles.statusToggle}>
                  <TouchableOpacity 
                    style={[
                      styles.statusOption, 
                      { 
                        backgroundColor: newSale.status === 'completed' ? theme.primary : theme.surface,
                        borderColor: theme.border
                      }
                    ]}
                    onPress={() => setNewSale({...newSale, status: 'completed'})}
                  >
                    <Text style={[
                      styles.statusOptionText, 
                      { color: newSale.status === 'completed' ? 'white' : theme.text }
                    ]}>
                      Completed
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.statusOption, 
                      { 
                        backgroundColor: newSale.status === 'pending' ? theme.primary : theme.surface,
                        borderColor: theme.border
                      }
                    ]}
                    onPress={() => setNewSale({...newSale, status: 'pending'})}
                  >
                    <Text style={[
                      styles.statusOptionText, 
                      { color: newSale.status === 'pending' ? 'white' : theme.text }
                    ]}>
                      Pending
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.statusOption, 
                      { 
                        backgroundColor: newSale.status === 'cancelled' ? theme.primary : theme.surface,
                        borderColor: theme.border
                      }
                    ]}
                    onPress={() => setNewSale({...newSale, status: 'cancelled'})}
                  >
                    <Text style={[
                      styles.statusOptionText, 
                      { color: newSale.status === 'cancelled' ? 'white' : theme.text }
                    ]}>
                      Cancelled
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
                onPress={handleAddSale}
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
  saleCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
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
  saleDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  itemText: {
    fontSize: 14,
    marginBottom: 4,
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
  itemsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    fontSize: 14,
    flex: 1,
  },
  itemDetails: {
    fontSize: 14,
    marginLeft: 8,
  },
  itemInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  quantityInput: {
    flex: 1,
  },
  priceInput: {
    flex: 2,
  },
  addItemButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addItemButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
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
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { salesAPI, Sale, SaleItem } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Home: undefined;
  Sales: undefined;
  // Add other screen names as needed
};

type SalesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Sales'>;

interface SalesScreenProps {
  navigation: SalesScreenNavigationProp;
}

export default function SalesScreen({ navigation }: SalesScreenProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [newSale, setNewSale] = useState<Partial<Sale>>({
    clientName: '',
    items: [],
    status: 'pending',
  });
  const [newItem, setNewItem] = useState<Partial<SaleItem>>({
    produit: { id: 0, nomMedicament: '' },
    quantite: 1,
    prixVenteTTC: 0,
  });

  const fetchSales = useCallback(async () => {
    console.log('Fetching sales...');
    setLoading(true);
    try {
      const storedSales = await AsyncStorage.getItem('sales');
      console.log('Retrieved sales from AsyncStorage:', storedSales);
      
      if (storedSales) {
        const parsedSales = JSON.parse(storedSales);
        console.log('Parsed sales:', parsedSales);
        setSales(parsedSales);
      } else {
        console.log('No stored sales found, using initial data');
        // Initialize with mock data if no stored data exists
        const initialSales = [
          {
            id: 1,
            date: '2024-03-20',
            clientName: 'Ghali Elasri',
            total: 150.00,
            items: [
              {
                id: 1,
                produit: {
                  id: 1,
                  nomMedicament: 'Paracetamol'
                },
                quantite: 2,
                prixVenteTTC: 75.00
              }
            ],
            status: 'completed' as const
          },
          {
            id: 2,
            date: '2024-03-19',
            clientName: 'Yassir Lambrass',
            total: 200.00,
            items: [
              {
                id: 1,
                produit: {
                  id: 2,
                  nomMedicament: 'Ibuprofen'
                },
                quantite: 1,
                prixVenteTTC: 200.00
              }
            ],
            status: 'pending' as const
          }
        ];
        setSales(initialSales);
        await AsyncStorage.setItem('sales', JSON.stringify(initialSales));
        console.log('Initial sales saved to AsyncStorage');
      }
    } catch (error) {
      console.error('Error in fetchSales:', error);
      Alert.alert('Error', 'Failed to fetch sales: ' + (error as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  const saveSales = async (updatedSales: Sale[]) => {
    try {
      await AsyncStorage.setItem('sales', JSON.stringify(updatedSales));
    } catch (error) {
      console.error('Error saving sales:', error);
      Alert.alert('Error', 'Failed to save sales: ' + (error as Error).message);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSales();
  }, [fetchSales]);

  const filteredSales = sales.filter(sale =>
    sale.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteSale = (saleId: number) => {
    console.log('Delete button clicked for sale ID:', saleId);
    console.log('Current sales:', sales);
    
    // Direct deletion without confirmation for testing
    try {
      const updatedSales = sales.filter(sale => sale.id !== saleId);
      console.log('Filtered sales:', updatedSales);
      
      // Update state immediately
      setSales(updatedSales);
      console.log('State updated');
      
      // Save to storage
      AsyncStorage.setItem('sales', JSON.stringify(updatedSales))
        .then(() => {
          console.log('Saved to storage');
          Alert.alert('Success', 'Sale deleted');
        })
        .catch(err => {
          console.error('Storage error:', err);
          Alert.alert('Error', 'Failed to save');
        });
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete');
    }
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setNewSale(sale);
    setModalVisible(true);
  };

  const handleAddItem = () => {
    if (!newItem.produit?.nomMedicament || !newItem.quantite || !newItem.prixVenteTTC) {
      Alert.alert('Error', 'Please fill in all item fields');
      return;
    }

    const itemToAdd: SaleItem = {
      id: (newSale.items?.length || 0) + 1,
      produit: {
        id: newItem.produit.id || 0,
        nomMedicament: newItem.produit.nomMedicament
      },
      quantite: newItem.quantite,
      prixVenteTTC: newItem.prixVenteTTC,
    };

    setNewSale(prevSale => ({
      ...prevSale,
      items: [...(prevSale.items || []), itemToAdd],
    }));

    setNewItem({
      produit: { id: 0, nomMedicament: '' },
      quantite: 1,
      prixVenteTTC: 0,
    });
  };

  const handleAddSale = async () => {
    if (!newSale.clientName || !newSale.items?.length) {
      Alert.alert('Error', 'Please fill in all required fields and add at least one item');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const total = newSale.items.reduce((sum, item) => sum + (item.prixVenteTTC * item.quantite), 0);

    const saleToAdd: Sale = {
      id: Math.max(...sales.map(s => s.id)) + 1,
      date: today,
      clientName: newSale.clientName,
      total,
      items: newSale.items,
      status: 'pending',
    };

    const updatedSales = [...sales, saleToAdd];
    setSales(updatedSales);
    await saveSales(updatedSales);
    
    setNewSale({
      clientName: '',
      items: [],
      status: 'pending',
    });
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: Sale }) => (
    <TouchableOpacity 
      style={[styles.saleCard, { backgroundColor: theme.surface }]}
      onPress={() => console.log('Card pressed:', item.id)}
    >
      <View style={styles.saleHeader}>
        <Text style={[styles.customerName, { color: theme.text }]}>{item.clientName}</Text>
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
            {saleItem.quantite}x {saleItem.produit.nomMedicament} - ${(saleItem.prixVenteTTC * saleItem.quantite).toFixed(2)}
          </Text>
        ))}
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
          onPress={() => {
            console.log('Edit button pressed for sale:', item.id);
            handleEditSale(item);
          }}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
          onPress={() => {
            console.log('Delete button pressed for sale:', item.id);
            handleDeleteSale(item.id);
          }}
        >
          <MaterialCommunityIcons name="delete" size={20} color={theme.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Loading sales...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Sales</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <MaterialCommunityIcons name="plus-circle" size={24} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} />
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
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
          />
        }
      />

      {/* Add Sale Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingSale ? 'Edit Sale' : 'Add New Sale'}
            </Text>
            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.text }]}>Client Name *</Text>
                <TextInput
                  style={[styles.input, { 
                    color: theme.text,
                    backgroundColor: theme.background
                  }]}
                  placeholder="Enter client name"
                  placeholderTextColor={theme.textSecondary}
                  value={newSale.clientName}
                  onChangeText={(text) => setNewSale({...newSale, clientName: text})}
                />
              </View>

              <View style={styles.itemsSection}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Items</Text>
                {newSale.items?.map((item) => (
                  <View key={item.id} style={styles.itemRow}>
                    <Text style={[styles.itemName, { color: theme.text }]}>{item.produit.nomMedicament}</Text>
                    <Text style={[styles.itemDetails, { color: theme.textSecondary }]}>
                      {item.quantite}x ${item.prixVenteTTC.toFixed(2)}
                    </Text>
                  </View>
                ))}
                <View style={styles.addItemSection}>
                  <TextInput
                    style={[styles.input, { 
                      color: theme.text,
                      backgroundColor: theme.background
                    }]}
                    placeholder="Item name"
                    placeholderTextColor={theme.textSecondary}
                    value={newItem.produit?.nomMedicament}
                    onChangeText={(text) => setNewItem({
                      ...newItem,
                      produit: { ...newItem.produit, nomMedicament: text }
                    })}
                  />
                  <View style={styles.itemInputRow}>
                    <TextInput
                      style={[styles.input, { 
                        color: theme.text,
                        backgroundColor: theme.background
                      }]}
                      placeholder="Quantity"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={newItem.quantite?.toString()}
                      onChangeText={(text) => setNewItem({...newItem, quantite: parseInt(text) || 1})}
                    />
                    <TextInput
                      style={[styles.input, { 
                        color: theme.text,
                        backgroundColor: theme.background
                      }]}
                      placeholder="Price"
                      placeholderTextColor={theme.textSecondary}
                      keyboardType="numeric"
                      value={newItem.prixVenteTTC?.toString()}
                      onChangeText={(text) => setNewItem({...newItem, prixVenteTTC: parseFloat(text) || 0})}
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.addItemButton, { backgroundColor: theme.primary }]}
                    onPress={handleAddItem}
                  >
                    <Text style={styles.addItemButtonText}>Add Item</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.error }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={handleAddSale}
              >
                <Text style={styles.modalButtonText}>Save</Text>
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
  addItemSection: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
});
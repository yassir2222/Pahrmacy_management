import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { productAPI, Product, stockAPI } from '../services/api';
import { Picker } from '@react-native-picker/picker';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Home: undefined;
  Inventory: undefined;
};

type InventoryScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Inventory'>;

interface InventoryScreenProps {
  navigation: InventoryScreenNavigationProp;
}

const FORME_OPTIONS = [
  'TABLET',
  'CAPSULE',
  'SYRUP',
  'INJECTION',
  'CREAM',
  'POWDER',
  'SACHET'
] as const;

type FormeType = typeof FORME_OPTIONS[number];

export default function InventoryScreen({ navigation }: InventoryScreenProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);
  const [newItem, setNewItem] = useState<Partial<Product>>({
    nomMedicament: '',
    codeEAN: '',
    prixVenteTTC: 0,
    prixAchatHT: 0,
    seuilStock: 0,
    forme: 'TABLET' as FormeType,
    dosage: '',
    quantiteTotaleEnStock: 0,
  });

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const data = await productAPI.getAll();
      console.log('Products received:', data);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to fetch products: ' + (error as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(item =>
    item.nomMedicament.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.forme.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteItem = async (itemId: number) => {
    console.log('Delete button clicked for item ID:', itemId);
    console.log('Current inventory:', products);
    
    try {
      // First delete from database
      console.log('Deleting from database...');
      await productAPI.delete(itemId);
      console.log('Successfully deleted from database');

      // Then update local state
      const updatedProducts = products.filter(item => item.id !== itemId);
      console.log('Filtered inventory:', updatedProducts);
      
      // Update state immediately
      setProducts(updatedProducts);
      console.log('State updated');
      
      // Save to storage
      await AsyncStorage.setItem('inventory', JSON.stringify(updatedProducts));
      console.log('Saved to storage');
      
      Alert.alert('Success', 'Item deleted successfully');
    } catch (error) {
      console.error('Delete error:', error);
      if (error instanceof Error) {
        if (error.message === 'Cannot delete product with remaining stock') {
          Alert.alert(
            'Cannot Delete',
            'This product cannot be deleted because it still has stock available. Please remove all stock first.'
          );
        } else {
          Alert.alert('Error', 'Failed to delete: ' + error.message);
        }
      } else {
        Alert.alert('Error', 'Failed to delete item');
      }
    }
  };

  const handleEditItem = (item: Product) => {
    setEditingItem(item);
    setNewItem({
      ...item,
      forme: item.forme as FormeType
    });
    setModalVisible(true);
  };

  const handleAddItem = async () => {
    console.log('Starting handleAddItem...');
    console.log('New item data:', newItem);
    
    if (!newItem.nomMedicament || !newItem.codeEAN || !newItem.prixVenteTTC || 
        !newItem.prixAchatHT || !newItem.seuilStock || !newItem.forme || !newItem.dosage) {
      console.log('Validation failed. Missing required fields:', {
        nomMedicament: !newItem.nomMedicament,
        codeEAN: !newItem.codeEAN,
        prixVenteTTC: !newItem.prixVenteTTC,
        prixAchatHT: !newItem.prixAchatHT,
        seuilStock: !newItem.seuilStock,
        forme: !newItem.forme,
        dosage: !newItem.dosage
      });
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const productData = {
        ...newItem,
        prixVenteTTC: Number(newItem.prixVenteTTC),
        prixAchatHT: Number(newItem.prixAchatHT),
        seuilStock: Number(newItem.seuilStock),
        quantiteTotaleEnStock: 0
      };

      if (editingItem) {
        console.log('Updating existing item:', editingItem.id);
        const updatedItem = await productAPI.update(editingItem.id, productData);
        console.log('Update response:', updatedItem);
        setProducts(products.map(item => 
          item.id === editingItem.id ? updatedItem : item
        ));
      } else {
        console.log('Creating new item...');
        const createdItem = await productAPI.create(productData as Omit<Product, 'id'>);
        console.log('Create response:', createdItem);
        setProducts([...products, createdItem]);
      }
      
      setNewItem({
        nomMedicament: '',
        codeEAN: '',
        prixVenteTTC: 0,
        prixAchatHT: 0,
        seuilStock: 0,
        forme: 'TABLET' as FormeType,
        dosage: '',
        quantiteTotaleEnStock: 0,
      });
      setEditingItem(null);
      setModalVisible(false);
    } catch (error) {
      console.error('Error in handleAddItem:', error);
      Alert.alert('Error', 'Failed to save product: ' + (error as Error).message);
    }
  };

  const handleRemoveStock = async (itemId: number) => {
    Alert.alert(
      'Remove Stock',
      'Are you sure you want to remove all stock for this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Removing stock for product ID:', itemId);
              
              // First, get all stock lots for this product
              const stockLots = await stockAPI.getAll();
              const productStockLots = stockLots.filter(lot => lot.produit.id === itemId);
              
              // Remove all quantity from each stock lot
              for (const lot of productStockLots) {
                await stockAPI.removeStock(lot.id, lot.quantite);
              }
              
              // Update the product's total stock to 0
              const updatedProduct = await productAPI.update(itemId, {
                quantiteTotaleEnStock: 0
              });
              
              console.log('Stock removed successfully');
              // Update the local state
              setProducts(products.map(item => 
                item.id === itemId ? updatedProduct : item
              ));
              Alert.alert('Success', 'Stock removed successfully');
            } catch (error: any) {
              console.error('Error removing stock:', error);
              Alert.alert(
                'Error',
                'Failed to remove stock: ' + (error.response?.data || error.message)
              );
            }
          },
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity 
      style={[styles.itemCard, { backgroundColor: theme.surface }]}
      onPress={() => console.log('Card pressed:', item.id)}
    >
      <View style={styles.itemHeader}>
        <Text style={[styles.itemName, { color: theme.text }]}>{item.nomMedicament}</Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.quantiteTotaleEnStock > item.seuilStock ? theme.success + '20' : theme.error + '20' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.quantiteTotaleEnStock > item.seuilStock ? theme.success : theme.error }
          ]}>
            {item.quantiteTotaleEnStock > item.seuilStock ? 'In Stock' : 'Low Stock'}
          </Text>
        </View>
      </View>
      <View style={styles.itemDetails}>
        <Text style={[styles.detailText, { color: theme.textSecondary }]}>
          Form: {item.forme}
        </Text>
        <Text style={[styles.detailText, { color: theme.textSecondary }]}>
          Dosage: {item.dosage}
        </Text>
        <Text style={[styles.detailText, { color: theme.textSecondary }]}>
          EAN: {item.codeEAN}
        </Text>
      </View>
      <View style={styles.itemFooter}>
        <Text style={[styles.quantity, { color: theme.text }]}>
          Quantity: {item.quantiteTotaleEnStock} (Min: {item.seuilStock})
        </Text>
        <Text style={[styles.price, { color: theme.primary }]}>
          ${item.prixVenteTTC.toFixed(2)}
        </Text>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.primary + '20' }]}
          onPress={() => {
            console.log('Edit button pressed for item:', item.id);
            handleEditItem(item);
          }}
        >
          <MaterialCommunityIcons name="pencil" size={20} color={theme.primary} />
        </TouchableOpacity>
        {item.quantiteTotaleEnStock > 0 && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.warning + '20' }]}
            onPress={() => handleRemoveStock(item.id)}
          >
            <MaterialCommunityIcons name="delete-sweep" size={20} color={theme.warning} />
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.error + '20' }]}
          onPress={() => {
            console.log('Delete button pressed for item:', item.id);
            handleDeleteItem(item.id);
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
        <Text style={{ color: theme.text }}>Loading products...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Inventory</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => {
            setEditingItem(null);
            setNewItem({
              nomMedicament: '',
              codeEAN: '',
              prixVenteTTC: 0,
              prixAchatHT: 0,
              seuilStock: 0,
              forme: 'TABLET' as FormeType,
              dosage: '',
              quantiteTotaleEnStock: 0,
            });
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <Ionicons name="search" size={20} color={theme.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search products..."
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredProducts}
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingItem ? 'Edit Product' : 'Add New Product'}
            </Text>
            <ScrollView>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="Medicine Name"
                placeholderTextColor={theme.textSecondary}
                value={newItem.nomMedicament}
                onChangeText={(text) => {
                  console.log('Setting nomMedicament:', text);
                  setNewItem({ ...newItem, nomMedicament: text });
                }}
              />
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="EAN Code"
                placeholderTextColor={theme.textSecondary}
                value={newItem.codeEAN}
                onChangeText={(text) => {
                  console.log('Setting codeEAN:', text);
                  setNewItem({ ...newItem, codeEAN: text });
                }}
              />
              <View style={[styles.input, { backgroundColor: theme.background }]}>
                <Picker
                  selectedValue={newItem.forme as FormeType}
                  onValueChange={(value: FormeType) => {
                    console.log('Setting forme:', value);
                    setNewItem({ ...newItem, forme: value });
                  }}
                  style={{ color: theme.text }}
                >
                  {FORME_OPTIONS.map((forme) => (
                    <Picker.Item key={forme} label={forme} value={forme} />
                  ))}
                </Picker>
              </View>
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="Dosage"
                placeholderTextColor={theme.textSecondary}
                value={newItem.dosage}
                onChangeText={(text) => {
                  console.log('Setting dosage:', text);
                  setNewItem({ ...newItem, dosage: text });
                }}
              />
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="Selling Price (TTC)"
                placeholderTextColor={theme.textSecondary}
                value={newItem.prixVenteTTC?.toString()}
                onChangeText={(text) => {
                  const value = parseFloat(text) || 0;
                  console.log('Setting prixVenteTTC:', value);
                  setNewItem({ ...newItem, prixVenteTTC: value });
                }}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="Purchase Price (HT)"
                placeholderTextColor={theme.textSecondary}
                value={newItem.prixAchatHT?.toString()}
                onChangeText={(text) => {
                  const value = parseFloat(text) || 0;
                  console.log('Setting prixAchatHT:', value);
                  setNewItem({ ...newItem, prixAchatHT: value });
                }}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, { color: theme.text, backgroundColor: theme.background }]}
                placeholder="Stock Threshold"
                placeholderTextColor={theme.textSecondary}
                value={newItem.seuilStock?.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  console.log('Setting seuilStock:', value);
                  setNewItem({ ...newItem, seuilStock: value });
                }}
                keyboardType="numeric"
              />
            </ScrollView>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.error }]}
                onPress={() => {
                  console.log('Cancel button pressed');
                  setModalVisible(false);
                }}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: theme.primary }]}
                onPress={() => {
                  console.log('Save button pressed');
                  console.log('Current newItem state:', newItem);
                  handleAddItem();
                }}
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
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
  itemCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
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
  itemDetails: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemFooter: {
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
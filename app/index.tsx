import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { supabase } from '../lib/supabase';

interface Producto {
  id: string | number;
  nombre?: string;
  precio?: number | string;
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. Cargar datos con manejo de errores (QA)
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('productos').select('*');

      if (error) throw error;

      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error: any) {
      Alert.alert('Error QA', 'No se pudieron cargar los productos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 2. Funcionalidad del Buscador
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((item) =>
        item.nombre?.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const renderItem = ({ item }: { item: Producto }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <Text style={styles.productName}>{item.nombre || 'Producto'}</Text>
        <Text style={styles.productPrice}>${item.precio || '0.00'}</Text>
      </View>
      <TouchableOpacity 
        style={styles.button}
        onPress={() => Alert.alert('Éxito', `${item.nombre} agregado`)}
      >
        <Text style={styles.buttonText}>Agregar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>El Rincón del Pan 🥖</Text>

      {/* Buscador */}
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar productos..."
        placeholderTextColor="#888"
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Indicador de Carga / Lista de productos */}
      {loading ? (
        <ActivityIndicator size="large" color="#d35400" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No se encontraron productos.</Text>
          }
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  searchInput: {
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  productPrice: {
    fontSize: 14,
    color: '#e67e22',
    fontWeight: 'bold',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#d35400',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    color: '#7f8c8d',
    marginTop: 30,
    fontSize: 16,
  },
});
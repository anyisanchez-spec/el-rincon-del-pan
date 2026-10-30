import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { supabase } from '../lib/supabase';

interface Producto {
  id: string | number;
  nombre?: string;
  precio?: number | string;
  descripcion?: string;
  imagen_url?: string;
}

export default function HomeScreen() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Cargar productos desde Supabase
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('productos').select('*');

      if (error) throw error;

      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error: any) {
      Alert.alert('Error', 'No se pudieron cargar los productos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Buscador en tiempo real
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

  // Imagen por defecto en caso de que no haya imagen registrada en Supabase
  const defaultImage = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=300&auto=format&fit=crop';

  const renderItem = ({ item }: { item: Producto }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.imagen_url || defaultImage }}
        style={styles.productImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View>
          <Text style={styles.productName} numberOfLines={1}>
            {item.nombre || 'Producto'}
          </Text>
          {item.descripcion ? (
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.descripcion}
            </Text>
          ) : null}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.productPrice}>${item.precio || '0.00'}</Text>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => Alert.alert('¡Añadido!', `${item.nombre} fue agregado a tu orden.`)}
          >
            <Text style={styles.buttonText}>+ Agregar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Título de la app */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>El Rincón del Pan 🥖</Text>
        <Text style={styles.subtitle}>Panadería & Pastelería Artesanal</Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Buscar pan, rosquillas, postres..."
          placeholderTextColor="#94A3B8"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Estado de Carga / Lista de Productos */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D35400" />
          <Text style={styles.loadingText}>Cargando delicias...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No se encontraron productos.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  searchInput: {
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  productImage: {
    width: 100,
    height: 105,
    backgroundColor: '#E2E8F0',
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  productDescription: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: '#D35400',
  },
  button: {
    backgroundColor: '#D35400',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 15,
  },
});
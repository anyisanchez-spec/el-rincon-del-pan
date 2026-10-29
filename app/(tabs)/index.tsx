import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

const COLORS = {
  background: '#FFF7EB',
  primary: '#5B321B',
  accent: '#D9764A',
  secondary: '#E8B565',
  cardBg: '#FFFFFF',
  textDark: '#332219',
  textLight: '#8C7365',
};

export default function ProductosScreen() {
  const [productos, setProductos] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // Consulta los productos de Supabase
  const cargarProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*');

      if (error) {
        console.error('Error al cargar productos:', error.message);
      } else if (data) {
        setProductos(data);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  // Filtro de búsqueda en tiempo real
  const productosFiltrados = productos.filter((item) =>
    (item.nombre || item.title || '').toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Menú Recién Horneado</Text>
        <Text style={styles.headerSubtitle}>El Rincón del Pan</Text>
      </View>

      {/* Buscador (Visual -> Buscador) */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pan, semita, rosquillas..."
          placeholderTextColor={COLORS.textLight}
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* Listado de Productos */}
      {cargando ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : productosFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No se encontraron productos.</Text>
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardInfo}>
                <Text style={styles.productName}>{item.nombre || item.title}</Text>
                <Text style={styles.productDesc}>{item.descripcion || 'Fresco y artesanal'}</Text>
                <Text style={styles.productPrice}>L. {parseFloat(item.precio || 0).toFixed(2)}</Text>
              </View>

              {/* Botón Agregar (Visual -> Botones) */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => Alert.alert('Éxito', `${item.nombre || 'Producto'} agregado al carrito`)}
              >
                <Ionicons name="add" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 16, paddingBottom: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.secondary },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  headerSubtitle: { fontSize: 13, color: COLORS.accent },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, margin: 16, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: COLORS.secondary },
  searchInput: { flex: 1, marginLeft: 8, color: COLORS.textDark, fontSize: 14 },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 14, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#EFEFEF', elevation: 2 },
  cardInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
  productDesc: { fontSize: 12, color: COLORS.textLight, marginVertical: 4 },
  productPrice: { fontSize: 14, fontWeight: 'bold', color: COLORS.accent },
  addButton: { backgroundColor: COLORS.accent, borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: COLORS.textLight, fontSize: 14 }
});
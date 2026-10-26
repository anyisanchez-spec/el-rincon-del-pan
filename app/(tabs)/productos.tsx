import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  SafeAreaView
} from 'react-native';
import { supabase } from '../../supabase';

// Paleta de colores de El Rincón del Pan
const COLORS = {
  background: '#FFF7EB', // Crema
  primary: '#5B321B',    // Café principal
  accent: '#D9764A',     // Terracota
  secondary: '#E8B565',  // Trigo
  cardBg: '#FFFFFF',     // Blanco
  textDark: '#332219',   // Café oscuro
  textLight: '#8C7365',  // Café claro
};

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
}

export default function ProductosScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [cargando, setCargando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Formulario para nuevo producto
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

  const categorias = ['Todos', 'Pan Casero', 'Pan Dulce', 'Repostería'];

  const obtenerUriSegura = (url?: string) => {
    if (!url || url.trim() === '') {
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500';
    }
    return url;
  };

  // Cargar productos desde Supabase
  const obtenerProductos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('productos')
        .select('*')
        .order('id', { ascending: false });

      if (error || !data || data.length === 0) {
        setProductos([
          {
            id: 1,
            nombre: 'Semita Casera',
            descripcion: 'Tradicional semita de yema recién horneada.',
            precio: 15.00,
            imagen_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500',
          },
          {
            id: 2,
            nombre: 'Rosquillas de Queso',
            descripcion: 'Crujientes y tostadas con receta artesanal.',
            precio: 10.00,
            imagen_url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500',
          },
          {
            id: 3,
            nombre: 'Torta de Queso',
            descripcion: 'Suave y cremosa, horneada al día.',
            precio: 120.00,
            imagen_url: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500',
          },
        ]);
      } else {
        setProductos(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    obtenerProductos();
  }, []);

  const agregarProducto = async () => {
    if (!nombre.trim() || !precio.trim()) {
      Alert.alert('Campos requeridos', 'Ingresa al menos el nombre y el precio.');
      return;
    }

    try {
      setCargando(true);
      const { error } = await supabase.from('productos').insert([
        {
          nombre,
          descripcion,
          precio: parseFloat(precio),
          imagen_url: imagenUrl.trim() || null,
        },
      ]);

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Éxito', 'Producto guardado correctamente');
        setNombre('');
        setDescripcion('');
        setPrecio('');
        setImagenUrl('');
        setModalVisible(false);
        obtenerProductos();
      }
    } catch (error) {
      Alert.alert('Error', 'Ocurrió un error al guardar');
    } finally {
      setCargando(false);
    }
  };

  const productosFiltrados = productos.filter((prod) =>
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    prod.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Encabezado */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Productos</Text>
          <Text style={styles.brandSubtitle}>Explora nuestras delicias horneadas</Text>
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar semitas, rosquillas, tortas..."
            placeholderTextColor={COLORS.textLight}
            value={busqueda}
            onChangeText={setBusqueda}
          />
        </View>

        {/* Chips de Categorías */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categorias.map((cat, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.categoryChip,
                  categoriaSeleccionada === cat && styles.categoryChipActive,
                ]}
                onPress={() => setCategoriaSeleccionada(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    categoriaSeleccionada === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Encabezado de la lista y Botón Agregar */}
        <View style={styles.actionRow}>
          <Text style={styles.sectionTitle}>Catálogo</Text>
          <TouchableOpacity
            style={styles.addNavButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addNavButtonText}>+ Agregar</Text>
          </TouchableOpacity>
        </View>

        {/* Grid de Productos */}
        {cargando && productos.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : productosFiltrados.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay productos en esta categoría.</Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {productosFiltrados.map((prod) => (
              <View key={prod.id} style={styles.card}>
                <Image
                  source={{ uri: obtenerUriSegura(prod.imagen_url) }}
                  style={styles.cardImage}
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{prod.nombre}</Text>
                  <Text style={styles.cardDescription} numberOfLines={2}>
                    {prod.descripcion || 'Sin descripción'}
                  </Text>
                  <Text style={styles.cardPrice}>L. {prod.precio.toFixed(2)}</Text>
                  <TouchableOpacity style={styles.buyButton}>
                    <Text style={styles.buyButtonText}>+ Carrito</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Modal para Agregar Producto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuevo Producto</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre del producto"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción"
              value={descripcion}
              onChangeText={setDescripcion}
            />
            <TextInput
              style={styles.input}
              placeholder="Precio (L.)"
              keyboardType="numeric"
              value={precio}
              onChangeText={setPrecio}
            />
            <TextInput
              style={styles.input}
              placeholder="URL de Imagen (opcional)"
              value={imagenUrl}
              onChangeText={setImagenUrl}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#ccc' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ fontWeight: 'bold' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.primary }]}
                onPress={agregarProducto}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Guardar</Text>
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
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 8,
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  brandSubtitle: {
    fontSize: 13,
    color: COLORS.accent,
    marginTop: 2,
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  searchInput: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    color: COLORS.textDark,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  categoryChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  categoryText: {
    color: COLORS.textDark,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  addNavButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addNavButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    width: '48%',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardImage: {
    width: '100%',
    height: 110,
    backgroundColor: COLORS.secondary,
  },
  cardContent: {
    padding: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  cardDescription: {
    fontSize: 11,
    color: COLORS.textLight,
    marginVertical: 4,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 6,
  },
  buyButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
});
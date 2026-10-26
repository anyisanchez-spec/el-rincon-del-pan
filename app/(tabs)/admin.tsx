import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../supabase';

const COLORS = {
  background: '#FFF7EB', // Crema
  primary: '#5B321B',    // Café principal
  accent: '#D9764A',     // Terracota
  secondary: '#E8B565',  // Trigo
  cardBg: '#FFFFFF',     // Blanco
  textDark: '#332219',   // Café oscuro
  textLight: '#8C7365',  // Café claro
  danger: '#E53935',     // Rojo
};

interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url?: string;
}

export default function AdminScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Formulario de Producto
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');

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
        Alert.alert('Éxito', 'Producto registrado en el inventario');
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

  const eliminarProducto = async (id: number) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de eliminar este producto del inventario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.from('productos').delete().eq('id', id);
              if (error) {
                Alert.alert('Error', error.message);
              } else {
                Alert.alert('Eliminado', 'El producto ha sido removido.');
                obtenerProductos();
              }
            } catch (err) {
              console.error(err);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Administración</Text>
        <Text style={styles.headerSubtitle}>Gestión de panadería El Rincón del Pan</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Métricas rápidas */}
        <Text style={styles.sectionTitle}>Resumen del Día</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="cash-outline" size={24} color={COLORS.primary} />
            <Text style={styles.metricValue}>L. 1,420.00</Text>
            <Text style={styles.metricLabel}>Ventas del día</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="cube-outline" size={24} color={COLORS.accent} />
            <Text style={styles.metricValue}>{productos.length}</Text>
            <Text style={styles.metricLabel}>Productos activos</Text>
          </View>
        </View>

        {/* Sección de Gestión de Inventario */}
        <View style={styles.actionRow}>
          <Text style={styles.sectionTitle}>Inventario</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={18} color="#FFF" />
            <Text style={styles.addButtonText}>Nuevo Producto</Text>
          </TouchableOpacity>
        </View>

        {cargando && productos.length === 0 ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
        ) : (
          productos.map((item) => (
            <View key={item.id} style={styles.inventoryCard}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemTitle}>{item.nombre}</Text>
                <Text style={styles.itemPrice}>L. {item.precio.toFixed(2)}</Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => eliminarProducto(item.id)}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para Crear Producto */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar al Inventario</Text>

            <TextInput
              style={styles.input}
              placeholder="Nombre del pan o repostería"
              value={nombre}
              onChangeText={setNombre}
            />
            <TextInput
              style={styles.input}
              placeholder="Descripción corta"
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
              placeholder="URL de Imagen (Unsplash u otra)"
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
    paddingBottom: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.accent,
    marginTop: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: COLORS.cardBg,
    width: '48%',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  inventoryCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  itemPrice: {
    fontSize: 13,
    color: COLORS.accent,
    fontWeight: 'bold',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
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
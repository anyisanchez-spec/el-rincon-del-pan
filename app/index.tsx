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
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Modal,
  Platform
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

// Permite cerrar la ventana del navegador al completar la autenticación en web/móvil
WebBrowser.maybeCompleteAuthSession();

interface Producto {
  id: string | number;
  nombre?: string;
  precio?: number | string;
  categoria?: string;
  imagen_url?: string;
}

// Enlaces de imágenes estables en HTTPS
const DEFAULT_BREAD = 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=400';
const DEFAULT_PASTRY = 'https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=400';
const DEFAULT_ROSQUILLA = 'https://images.pexels.com/photos/3338681/pexels-photo-3338681.jpeg?auto=compress&cs=tinysrgb&w=400';

const getCategoryFallback = (cat?: string) => {
  const c = cat?.toLowerCase() || '';
  if (c.includes('reposter')) return DEFAULT_PASTRY;
  if (c.includes('rosquilla')) return DEFAULT_ROSQUILLA;
  return DEFAULT_BREAD;
};

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const maxContentWidth = Math.min(width, 540);
  const cardWidth = (maxContentWidth - 48) / 2;

  const [userRole, setUserRole] = useState<'none' | 'cliente' | 'admin'>('none');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [products, setProducts] = useState<Producto[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [loading, setLoading] = useState(true);

  const categories = ['Todos', 'Pan', 'Repostería', 'Rosquillas'];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('productos').select('*');

      if (error) console.log('Aviso Supabase:', error.message);

      if (data && data.length > 0) {
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (e) {
      console.log('Error al obtener productos', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'Todos') {
      result = result.filter(
        (item) => item.categoria?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery.trim() !== '') {
      result = result.filter((item) =>
        item.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

  const handleAdminLogin = () => {
    if (adminUser.trim() === 'admin' && adminPassword === '1234') {
      setShowLoginModal(false);
      setUserRole('admin');
      Alert.alert('¡Bienvenido!', 'Has ingresado como Administrador');
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos (admin / 1234)');
    }
  };

  // Función multiplataforma (detecta automáticamente si es Web o Móvil)
  const handleGoogleLogin = async () => {
    try {
      const redirectUrl = Linking.createURL('/');

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: Platform.OS !== 'web',
        },
      });

      if (error) throw error;

      if (Platform.OS !== 'web' && data?.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
        if (result.type === 'success' && result.url) {
          const { queryParams } = Linking.parse(result.url);
          if (queryParams?.access_token && queryParams?.refresh_token) {
            await supabase.auth.setSession({
              access_token: queryParams.access_token as string,
              refresh_token: queryParams.refresh_token as string,
            });
          }
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'Error al iniciar sesión con Google: ' + (error.message || error));
    }
  };

  const RenderProductCard = ({ item }: { item: Producto }) => {
    const numPrice = typeof item.precio === 'number' ? item.precio : parseFloat(item.precio as string) || 0;
    
    // Auto-corrección de URLs HTTP a HTTPS y fallback si la URL de Supabase está vacía
    const rawUrl = item.imagen_url?.trim() || '';
    const initialUri = (rawUrl.startsWith('https://') || rawUrl.startsWith('http://'))
      ? rawUrl.replace('http://', 'https://')
      : getCategoryFallback(item.categoria);
      
    const [imgUri, setImgUri] = useState(initialUri);

    return (
      <TouchableOpacity
        style={[styles.card, { width: cardWidth }]}
        activeOpacity={0.85}
        onPress={() => Alert.alert('Producto', `${item.nombre}\nPrecio: L. ${numPrice.toFixed(2)}`)}
      >
        <Image
          source={{ uri: imgUri }}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => setImgUri(getCategoryFallback(item.categoria))}
        />
        <View style={styles.cardContent}>
          <Text style={styles.productName} numberOfLines={1}>
            {item.nombre || 'Producto'}
          </Text>
          <Text style={styles.productPrice}>L. {numPrice.toFixed(2)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (userRole === 'none') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.mainWrapper, styles.welcomeCenter]}>
          <View style={styles.welcomeBox}>
            <Text style={styles.welcomeTitle}>El Rincón del Pan 🥖</Text>
            <Text style={styles.welcomeSubtitle}>Pan fresco, sabor casero</Text>

            <TouchableOpacity
              style={styles.clientButton}
              onPress={() => setUserRole('cliente')}
            >
              <Text style={styles.clientButtonText}>🛒 Entrar como Cliente</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => setShowLoginModal(true)}
            >
              <Text style={styles.adminButtonText}>🔐 Acceso Administrador</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleLogin}
            >
              <Text style={styles.googleButtonText}>🌐 Continuar con Google</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal visible={showLoginModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Iniciar Sesión - Admin</Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Usuario (ej. admin)"
                placeholderTextColor="#A08C7D"
                value={adminUser}
                onChangeText={setAdminUser}
                autoCapitalize="none"
              />

              <TextInput
                style={styles.modalInput}
                placeholder="Contraseña (ej. 1234)"
                placeholderTextColor="#A08C7D"
                secureTextEntry
                value={adminPassword}
                onChangeText={setAdminPassword}
              />

              <TouchableOpacity style={styles.loginSubmitButton} onPress={handleAdminLogin}>
                <Text style={styles.loginSubmitText}>Ingresar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowLoginModal(false)}
              >
                <Text style={styles.modalCloseText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.mainWrapper}>
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Catálogo de Productos</Text>
            <Text style={styles.roleTag}>
              {userRole === 'admin' ? 'Modo: Administrador' : 'Modo: Cliente'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.switchRoleButton}
            onPress={() => setUserRole('none')}
          >
            <Text style={styles.switchRoleText}>Cambiar Rol</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Buscar productos..."
            placeholderTextColor="#A08C7D"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.categoriesWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryChip,
                  selectedCategory === cat && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === cat && styles.categoryTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5B321B" />
            <Text style={styles.loadingText}>Cargando delicias...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={({ item }) => <RenderProductCard item={item} />}
            numColumns={2}
            columnWrapperStyle={styles.rowWrapper}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No hay productos disponibles.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFF7EB', // Crema oficial
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    backgroundColor: '#FFF7EB',
  },
  welcomeCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    padding: 28,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#5B321B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E8D2C1',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#5B321B', // Café principal
    marginBottom: 6,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: '#D9764A', // Terracota
    fontWeight: '600',
    marginBottom: 24,
  },
  clientButton: {
    width: '100%',
    backgroundColor: '#5B321B', // Café principal
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  clientButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  adminButton: {
    width: '100%',
    backgroundColor: '#FFF7EB',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5B321B',
  },
  adminButtonText: {
    color: '#5B321B',
    fontSize: 16,
    fontWeight: '700',
  },
  googleButton: {
    width: '100%',
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 12,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5B321B',
  },
  roleTag: {
    fontSize: 12,
    color: '#D9764A',
    fontWeight: '600',
  },
  switchRoleButton: {
    backgroundColor: '#E8D2C1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  switchRoleText: {
    fontSize: 12,
    color: '#5B321B',
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInput: {
    height: 46,
    backgroundColor: '#FFFFFF',
    borderRadius: 23,
    paddingHorizontal: 18,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E8D2C1',
    color: '#5B321B',
  },
  categoriesWrapper: {
    marginBottom: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8D2C1',
  },
  categoryChipActive: {
    backgroundColor: '#5B321B',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B321B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  rowWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E8D2C1',
    shadowColor: '#5B321B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 135, // Tamaño fijo asegurado para renderizado web y móvil
    backgroundColor: '#F5ECE5',
  },
  cardContent: {
    padding: 10,
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B321B',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D9764A', // Terracota para destacar precio
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#5B321B',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#A08C7D',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D2C1',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5B321B',
    marginBottom: 16,
  },
  modalInput: {
    width: '100%',
    height: 46,
    backgroundColor: '#FFF7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E8D2C1',
    color: '#5B321B',
    marginBottom: 12,
  },
  loginSubmitButton: {
    width: '100%',
    backgroundColor: '#5B321B',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  loginSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
  modalCloseButton: {
    marginTop: 12,
  },
  modalCloseText: {
    color: '#D9764A',
    fontSize: 14,
  },
});
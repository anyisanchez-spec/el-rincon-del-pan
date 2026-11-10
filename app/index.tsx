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
  Platform,
  ImageBackground
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();

interface Producto {
  id: string | number;
  nombre?: string;
  precio?: number | string;
  categoria?: string;
  imagen_url?: string;
}

const HERO_BANNER_IMG = 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800';
const WELCOME_HEADER_IMG = 'https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=800';

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
  const [activeTab, setActiveTab] = useState<'inicio' | 'productos' | 'carrito' | 'perfil'>('inicio');
  const [cartCount, setCartCount] = useState(0);

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

  const addToCart = (product: Producto) => {
    setCartCount(prev => prev + 1);
    Alert.alert('¡Añadido!', `${product.nombre} se agregó al carrito`);
  };

  const RenderProductCard = ({ item }: { item: Producto }) => {
    const numPrice = typeof item.precio === 'number' ? item.precio : parseFloat(item.precio as string) || 0;
    const rawUrl = item.imagen_url?.trim() || '';
    const initialUri = (rawUrl.startsWith('https://') || rawUrl.startsWith('http://'))
      ? rawUrl.replace('http://', 'https://')
      : getCategoryFallback(item.categoria);
      
    const [imgUri, setImgUri] = useState(initialUri);

    return (
      <View style={[styles.card, { width: cardWidth }]}>
        <Image
          source={{ uri: imgUri }}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => setImgUri(getCategoryFallback(item.categoria))}
        />
        <View style={styles.cardContent}>
          <Text style={styles.productCategory}>{item.categoria || 'Panadería'}</Text>
          <Text style={styles.productName} numberOfLines={1}>
            {item.nombre || 'Producto'}
          </Text>
          <View style={styles.cardFooter}>
            <Text style={styles.productPrice}>L. {numPrice.toFixed(2)}</Text>
            <TouchableOpacity 
              style={styles.addButton} 
              onPress={() => addToCart(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // 1. PANTALLA DE BIENVENIDA (Fiel a la Pantalla 1 del PDF)
  if (userRole === 'none') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.mainWrapper, styles.welcomeCenter]}>
          <View style={styles.welcomeCard}>
            <ImageBackground
              source={{ uri: WELCOME_HEADER_IMG }}
              style={styles.welcomeBannerImage}
              imageStyle={{ borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
            >
              <View style={styles.welcomeBannerOverlay} />
            </ImageBackground>

            <View style={styles.welcomeContentContainer}>
              <Text style={styles.welcomeTitle}>El Rincón del Pan 🌾</Text>
              <Text style={styles.welcomeSlogan}>Pan fresco, sabor casero ♡</Text>
              <Text style={styles.welcomeDescription}>
                Tradición, calidad y sabor en la palma de tu mano
              </Text>

              <TouchableOpacity
                style={styles.clientButton}
                onPress={() => setUserRole('cliente')}
                activeOpacity={0.85}
              >
                <Text style={styles.clientButtonText}>🛒 Entrar como Cliente</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminButton}
                onPress={() => setShowLoginModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.adminButtonText}>🔐 Acceso Administrador</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
                activeOpacity={0.85}
              >
                <Text style={styles.googleButtonText}>🌐 Continuar con Google</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Modal Login Admin */}
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

  // 2. PANTALLA PRINCIPAL CON HERO BANNER Y BARRA INFERIOR (Fiel a la Pantalla 2 y 3 del PDF)
  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.mainWrapper}>

        {/* Header Superior */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>El Rincón del Pan</Text>
            <Text style={styles.roleTag}>
              {userRole === 'admin' ? '⚙️ Panel Administrador' : '🥖 Sabor Artesanal'}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.cartIconBadge} onPress={() => Alert.alert('Carrito', `Tienes ${cartCount} productos`)}>
              <Text style={styles.cartIconText}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.switchRoleButton}
              onPress={() => setUserRole('none')}
            >
              <Text style={styles.switchRoleText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5B321B" />
            <Text style={styles.loadingText}>Cargando delicias recién horneadas...</Text>
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
            ListHeaderComponent={
              <>
                {/* Hero Banner ("Pan recién horneado todos los días") */}
                <ImageBackground
                  source={{ uri: HERO_BANNER_IMG }}
                  style={styles.heroBanner}
                  imageStyle={{ borderRadius: 18 }}
                >
                  <View style={styles.heroOverlay}>
                    <Text style={styles.heroBadge}>PAN ARTESANAL</Text>
                    <Text style={styles.heroTitle}>Pan recién horneado{"\n"}todos los días</Text>
                  </View>
                </ImageBackground>

                {/* Buscador */}
                <View style={styles.searchContainer}>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="🔍 Buscar semitas, rosquillas, pan dulce..."
                    placeholderTextColor="#A08C7D"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {/* Chips de Categorías */}
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
                          {cat === 'Pan' ? '🥖 Pan' : cat === 'Repostería' ? '🍰 Repostería' : cat === 'Rosquillas' ? '🍩 Rosquillas' : '✨ Todos'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </>
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No se encontraron productos en esta categoría.</Text>
              </View>
            }
          />
        )}

        {/* NAVEGACIÓN INFERIOR (Barra Movil de la Propuesta Visual) */}
        <View style={styles.bottomTabBar}>
          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setActiveTab('inicio')}
          >
            <Text style={[styles.tabIcon, activeTab === 'inicio' && styles.tabIconActive]}>🏠</Text>
            <Text style={[styles.tabLabel, activeTab === 'inicio' && styles.tabLabelActive]}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setActiveTab('productos')}
          >
            <Text style={[styles.tabIcon, activeTab === 'productos' && styles.tabIconActive]}>🥖</Text>
            <Text style={[styles.tabLabel, activeTab === 'productos' && styles.tabLabelActive]}>Productos</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setActiveTab('carrito')}
          >
            <Text style={[styles.tabIcon, activeTab === 'carrito' && styles.tabIconActive]}>🛒</Text>
            <Text style={[styles.tabLabel, activeTab === 'carrito' && styles.tabLabelActive]}>Carrito</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.tabItem} 
            onPress={() => setActiveTab('perfil')}
          >
            <Text style={[styles.tabIcon, activeTab === 'perfil' && styles.tabIconActive]}>👤</Text>
            <Text style={[styles.tabLabel, activeTab === 'perfil' && styles.tabLabelActive]}>Perfil</Text>
          </TouchableOpacity>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#FFF7EB', // Fondo Crema
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    backgroundColor: '#FFF7EB',
  },
  
  // BIENVENIDA
  welcomeCenter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    elevation: 5,
    shadowColor: '#5B321B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#E8D2C1',
    overflow: 'hidden',
  },
  welcomeBannerImage: {
    width: '100%',
    height: 160,
    justifyContent: 'flex-end',
  },
  welcomeBannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(91, 50, 27, 0.25)',
  },
  welcomeContentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#5B321B',
    textAlign: 'center',
  },
  welcomeSlogan: {
    fontSize: 15,
    color: '#D9764A',
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 8,
  },
  welcomeDescription: {
    fontSize: 13,
    color: '#7A5C47',
    textAlign: 'center',
    marginBottom: 24,
  },
  clientButton: {
    width: '100%',
    backgroundColor: '#5B321B',
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

  // HEADER DE APP
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF7EB',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5B321B',
  },
  roleTag: {
    fontSize: 12,
    color: '#D9764A',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartIconBadge: {
    position: 'relative',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8D2C1',
  },
  cartIconText: {
    fontSize: 18,
  },
  badgeCount: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#D9764A',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
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

  // HERO BANNER ("Pan recién horneado todos los días")
  heroBanner: {
    width: '100%',
    height: 130,
    marginBottom: 16,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  heroOverlay: {
    backgroundColor: 'rgba(91, 50, 27, 0.65)',
    padding: 14,
    borderRadius: 18,
    height: '100%',
    justifyContent: 'center',
  },
  heroBadge: {
    color: '#E8B565', // Trigo
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },

  // BUSCADOR Y CATEGORÍAS
  searchContainer: {
    marginBottom: 14,
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
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#E8D2C1',
  },
  categoryChipActive: {
    backgroundColor: '#5B321B',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B321B',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },

  // GRILLA DE PRODUCTOS
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90, // Espacio para la barra inferior
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  productImage: {
    width: '100%',
    height: 125,
    backgroundColor: '#F5ECE5',
  },
  cardContent: {
    padding: 10,
  },
  productCategory: {
    fontSize: 10,
    color: '#D9764A',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B321B',
    marginTop: 2,
    marginBottom: 6,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#5B321B',
  },
  addButton: {
    backgroundColor: '#5B321B',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: -2,
  },

  // BARRA DE NAVEGACIÓN INFERIOR (MAPA DE NAVEGACIÓN)
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8D2C1',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    maxWidth: 540,
    alignSelf: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 11,
    color: '#7A5C47',
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#5B321B',
    fontWeight: '800',
  },

  // ESTADOS Y MODALES
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#5B321B',
    fontSize: 14,
    fontWeight: '600',
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
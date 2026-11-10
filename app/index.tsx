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

interface CartItem {
  product: Producto;
  quantity: number;
}

// Enlaces de imágenes estables en HTTPS
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

  // Control de Flujo de Pantallas
  // 1: Bienvenida, 2/3/4: Main App (Tab Navegación), 5: Pago, 6: Confirmación, 9: Admin Productos, 10: Admin Ventas
  const [screenView, setScreenView] = useState<'bienvenida' | 'main' | 'pago' | 'confirmacion' | 'admin_productos' | 'admin_ventas'>('bienvenida');
  const [activeTab, setActiveTab] = useState<'inicio' | 'productos' | 'carrito' | 'perfil'>('inicio');

  // Carrito de compras
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: { id: 'c1', nombre: 'Pan Casero', precio: 15.00, categoria: 'Pan', imagen_url: DEFAULT_BREAD },
      quantity: 1
    },
    {
      product: { id: 'c2', nombre: 'Semita de Yema', precio: 20.00, categoria: 'Pan', imagen_url: DEFAULT_PASTRY },
      quantity: 1
    }
  ]);

  // Formulario de Pago y Entrega
  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [deliveryAddress, setDeliveryAddress] = useState('Col. Los Pinos, Casa 123, San Pedro Sula');
  const [lastOrderNum, setLastOrderNum] = useState('#000123');

  // Modal Login Admin
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminUser, setAdminUser] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Productos desde Supabase
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
      } else {
        // Productos por defecto alineados a la propuesta visual si la BD está vacía
        const initialMock: Producto[] = [
          { id: 1, nombre: 'Pan Casero', precio: 15.00, categoria: 'Pan', imagen_url: DEFAULT_BREAD },
          { id: 2, nombre: 'Semita de Yema', precio: 15.00, categoria: 'Pan', imagen_url: DEFAULT_PASTRY },
          { id: 3, nombre: 'Rosquillas', precio: 25.00, categoria: 'Rosquillas', imagen_url: DEFAULT_ROSQUILLA },
          { id: 4, nombre: 'Torta de queso', precio: 30.00, categoria: 'Repostería', imagen_url: DEFAULT_PASTRY }
        ];
        setProducts(initialMock);
        setFilteredProducts(initialMock);
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

  // Funciones de Gestión del Carrito
  const addToCart = (product: Producto) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    Alert.alert('¡Añadido!', `${product.nombre} se agregó al carrito`);
  };

  const increaseQuantity = (productId: string | number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (productId: string | number) => {
    setCartItems(prev =>
      prev
        .map(item =>
          item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string | number) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = typeof item.product.precio === 'number'
      ? item.product.precio
      : parseFloat(item.product.precio as string) || 0;
    return sum + price * item.quantity;
  }, 0);

  const shippingFee = cartItems.length > 0 ? 15.00 : 0.00;
  const grandTotal = subtotal + shippingFee;

  // Login de Administrador
  const handleAdminLogin = () => {
    if (adminUser.trim() === 'admin' && adminPassword === '1234') {
      setShowLoginModal(false);
      setScreenView('admin_productos');
      Alert.alert('¡Bienvenido!', 'Has ingresado al Panel de Administración');
    } else {
      Alert.alert('Error', 'Usuario o contraseña incorrectos (admin / 1234)');
    }
  };

  // Google OAuth Login
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
      setScreenView('main');
    } catch (error: any) {
      Alert.alert('Error', 'Error al iniciar sesión con Google: ' + (error.message || error));
    }
  };

  // Confirmar Pedido
  const handleConfirmOrder = () => {
    const randomOrder = `#000${Math.floor(100 + Math.random() * 900)}`;
    setLastOrderNum(randomOrder);
    setScreenView('confirmacion');
  };

  // Componente Tarjeta de Producto
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
          <Text style={styles.productCategory}>{item.categoria || 'Pan'}</Text>
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

  // -------------------------------------------------------------
  // INCISO 1: PANTALLA DE BIENVENIDA
  // -------------------------------------------------------------
  if (screenView === 'bienvenida') {
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
              <Text style={styles.welcomeTitle}>El Rincón del Pan 🥖</Text>
              <Text style={styles.welcomeSlogan}>Pan fresco, sabor casero ♡</Text>
              <Text style={styles.welcomeDescription}>
                Tradición, calidad y sabor en la palma de tu mano
              </Text>

              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => { setScreenView('main'); setActiveTab('inicio'); }}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionButtonText}>Comenzar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={() => setShowLoginModal(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.secondaryActionButtonText}>🔐 Acceso Administrador</Text>
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

  // -------------------------------------------------------------
  // INCISO 5: PANTALLA DE PAGO Y ENTREGA
  // -------------------------------------------------------------
  if (screenView === 'pago') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.mainWrapper}>
          <View style={styles.simpleHeader}>
            <TouchableOpacity onPress={() => { setScreenView('main'); setActiveTab('carrito'); }}>
              <Text style={styles.backButtonText}>‹ Volver al Carrito</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitleCenter}>Método de pago</Text>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Opciones de pago */}
            <TouchableOpacity 
              style={[styles.payOptionBox, paymentMethod === 'efectivo' && styles.payOptionBoxActive]}
              onPress={() => setPaymentMethod('efectivo')}
            >
              <Text style={styles.payOptionIcon}>💵</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.payOptionTitle}>Efectivo al recibir</Text>
                <Text style={styles.payOptionSub}>Paga cuando recibas tu pedido.</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.payOptionBox, paymentMethod === 'transferencia' && styles.payOptionBoxActive]}
              onPress={() => setPaymentMethod('transferencia')}
            >
              <Text style={styles.payOptionIcon}>🏦</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.payOptionTitle}>Transferencia bancaria</Text>
                <Text style={styles.payOptionSub}>Realiza el pago desde tu banco.</Text>
              </View>
            </TouchableOpacity>

            {/* Dirección de entrega */}
            <View style={styles.deliveryCard}>
              <Text style={styles.deliveryTitle}>Dirección de entrega</Text>
              <TextInput
                style={styles.deliveryInput}
                value={deliveryAddress}
                onChangeText={setDeliveryAddress}
                multiline
              />
            </View>

            {/* Resumen final */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>L. {subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Envío</Text>
                <Text style={styles.summaryValue}>L. {shippingFee.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>L. {grandTotal.toFixed(2)}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.confirmOrderButton} onPress={handleConfirmOrder}>
              <Text style={styles.confirmOrderButtonText}>Confirmar pedido</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // INCISO 6: PANTALLA DE CONFIRMACIÓN
  // -------------------------------------------------------------
  if (screenView === 'confirmacion') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={[styles.mainWrapper, styles.centerContainer]}>
          <View style={styles.confirmationBox}>
            <View style={styles.checkCircle}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>

            <Text style={styles.confirmTitle}>¡Pedido confirmado!</Text>
            <Text style={styles.confirmSub}>Tu pedido ha sido recibido con éxito.</Text>

            <View style={styles.orderNumberCard}>
              <Text style={styles.orderNumberLabel}>Número de pedido</Text>
              <Text style={styles.orderNumberValue}>{lastOrderNum}</Text>
            </View>

            <TouchableOpacity 
              style={styles.primaryActionButton}
              onPress={() => {
                setCartItems([]);
                setScreenView('main');
                setActiveTab('inicio');
              }}
            >
              <Text style={styles.primaryActionButtonText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // INCISO 9: PANEL ADMIN - PRODUCTOS
  // -------------------------------------------------------------
  if (screenView === 'admin_productos') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.mainWrapper}>
          <View style={styles.adminHeader}>
            <Text style={styles.adminHeaderTitle}>🏠 Admin</Text>
            <TouchableOpacity onPress={() => setScreenView('bienvenida')}>
              <Text style={styles.logoutAdminText}>Salir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.adminTabToggle}>
            <TouchableOpacity style={[styles.adminTabBtn, styles.adminTabBtnActive]}>
              <Text style={styles.adminTabBtnTextActive}>Productos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.adminTabBtn} onPress={() => setScreenView('admin_ventas')}>
              <Text style={styles.adminTabBtnText}>Ventas</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
            <Text style={styles.sectionTitle}>Gestión de Productos</Text>
            {products.map(p => (
              <View key={p.id} style={styles.adminItemRow}>
                <Image source={{ uri: p.imagen_url || DEFAULT_BREAD }} style={styles.adminItemImage} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.adminItemName}>{p.nombre}</Text>
                  <Text style={styles.adminItemPrice}>L. {typeof p.precio === 'number' ? p.precio.toFixed(2) : p.precio}</Text>
                </View>
                <TouchableOpacity style={styles.editBtn}>
                  <Text style={styles.editBtnText}>Editar</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // INCISO 10: PANEL ADMIN - VENTAS
  // -------------------------------------------------------------
  if (screenView === 'admin_ventas') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.mainWrapper}>
          <View style={styles.adminHeader}>
            <Text style={styles.adminHeaderTitle}>📊 Ventas</Text>
            <TouchableOpacity onPress={() => setScreenView('bienvenida')}>
              <Text style={styles.logoutAdminText}>Salir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.adminTabToggle}>
            <TouchableOpacity style={styles.adminTabBtn} onPress={() => setScreenView('admin_productos')}>
              <Text style={styles.adminTabBtnText}>Productos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.adminTabBtn, styles.adminTabBtnActive]}>
              <Text style={styles.adminTabBtnTextActive}>Ventas</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
            <View style={styles.statsCard}>
              <Text style={styles.statsLabel}>Total de ventas</Text>
              <Text style={styles.statsValue}>L. 4,650.00</Text>
              <Text style={styles.statsSub}>Pedidos: 48</Text>
            </View>

            <Text style={styles.sectionTitle}>Estadísticas semanales</Text>
            
            {/* Gráfico de barras conceptual */}
            <View style={styles.chartContainer}>
              <View style={styles.chartBarsRow}>
                <View style={[styles.bar, { height: 40 }]} />
                <View style={[styles.bar, { height: 70 }]} />
                <View style={[styles.bar, { height: 50 }]} />
                <View style={[styles.bar, { height: 90 }]} />
                <View style={[styles.bar, { height: 110 }]} />
                <View style={[styles.bar, { height: 140 }]} />
                <View style={[styles.bar, { height: 95 }]} />
              </View>
              <View style={styles.chartLabelsRow}>
                <Text style={styles.chartLabel}>Lun</Text>
                <Text style={styles.chartLabel}>Mar</Text>
                <Text style={styles.chartLabel}>Mié</Text>
                <Text style={styles.chartLabel}>Jue</Text>
                <Text style={styles.chartLabel}>Vie</Text>
                <Text style={styles.chartLabel}>Sáb</Text>
                <Text style={styles.chartLabel}>Dom</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // INCISOS 2, 3 Y 4: PANTALLA PRINCIPAL CON PESTAÑAS (INICIO / PRODUCTOS / CARRITO)
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.mainWrapper}>

        {/* Header Superior */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>El Rincón del Pan</Text>
            <Text style={styles.roleTag}>🥖 Sabor Artesanal</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.cartIconBadge} onPress={() => setActiveTab('carrito')}>
              <Text style={styles.cartIconText}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.switchRoleButton}
              onPress={() => setScreenView('bienvenida')}
            >
              <Text style={styles.switchRoleText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* INCISO 4: VISTA DE CARRITO */}
        {activeTab === 'carrito' ? (
          <ScrollView style={styles.cartScreenContainer} contentContainerStyle={{ paddingBottom: 100 }}>
            <Text style={styles.sectionTitle}>🛒 Carrito</Text>

            {cartItems.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                <Text style={styles.emptyCartIcon}>🍞</Text>
                <Text style={styles.emptyCartTitle}>Tu carrito está vacío</Text>
                <Text style={styles.emptyCartSubtitle}>Agrega delicias desde el catálogo para hacer tu pedido.</Text>
                <TouchableOpacity style={styles.primaryActionButton} onPress={() => setActiveTab('productos')}>
                  <Text style={styles.primaryActionButtonText}>Ver Catálogo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {cartItems.map((item) => {
                  const itemPrice = typeof item.product.precio === 'number'
                    ? item.product.precio
                    : parseFloat(item.product.precio as string) || 0;
                  const itemImg = item.product.imagen_url || getCategoryFallback(item.product.categoria);

                  return (
                    <View key={item.product.id} style={styles.cartItemRow}>
                      <Image source={{ uri: itemImg }} style={styles.cartItemImage} />
                      <View style={styles.cartItemDetails}>
                        <Text style={styles.cartItemName}>{item.product.nombre || 'Producto'}</Text>
                        <Text style={styles.cartItemUnitPrice}>L. {itemPrice.toFixed(2)}</Text>
                      </View>
                      <View style={styles.cartQuantityControls}>
                        <TouchableOpacity style={styles.qtyButton} onPress={() => decreaseQuantity(item.product.id)}>
                          <Text style={styles.qtyButtonText}>-</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyButton} onPress={() => increaseQuantity(item.product.id)}>
                          <Text style={styles.qtyButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}

                {/* Resumen de Total del Carrito */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>L. {subtotal.toFixed(2)}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Envío</Text>
                    <Text style={styles.summaryValue}>L. {shippingFee.toFixed(2)}</Text>
                  </View>
                  <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>L. {grandTotal.toFixed(2)}</Text>
                  </View>

                  <TouchableOpacity style={styles.confirmOrderButton} onPress={() => setScreenView('pago')}>
                    <Text style={styles.confirmOrderButtonText}>Continuar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        ) : activeTab === 'perfil' ? (
          /* VISTA DE PERFIL */
          <View style={styles.profileContainer}>
            <Text style={styles.sectionTitle}>👤 Perfil de Usuario</Text>
            <View style={styles.profileCard}>
              <Text style={styles.profileName}>Cliente Activo</Text>
              <Text style={styles.profileSub}>El Rincón del Pan</Text>
              <TouchableOpacity style={styles.logoutButton} onPress={() => setScreenView('bienvenida')}>
                <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* INCISOS 2 Y 3: VISTA DE INICIO / PRODUCTOS CON HERO BANNER Y GRILLA */
          loading ? (
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
              ListHeaderComponent={
                <>
                  {/* INCISO 2: Banner Hero ("Pan recién horneado todos los días") */}
                  {activeTab === 'inicio' && (
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
                  )}

                  {/* INCISO 3: Buscador de productos */}
                  <View style={styles.searchContainer}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="🔍 Buscar productos..."
                      placeholderTextColor="#A08C7D"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                  </View>

                  {/* Filtro de Categorías */}
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
                </>
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay productos disponibles.</Text>
                </View>
              }
            />
          )
        )}

        {/* BARRA INFERIOR DE NAVEGACIÓN */}
        <View style={styles.bottomTabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('inicio')}>
            <Text style={[styles.tabIcon, activeTab === 'inicio' && styles.tabIconActive]}>🏠</Text>
            <Text style={[styles.tabLabel, activeTab === 'inicio' && styles.tabLabelActive]}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('productos')}>
            <Text style={[styles.tabIcon, activeTab === 'productos' && styles.tabIconActive]}>🥖</Text>
            <Text style={[styles.tabLabel, activeTab === 'productos' && styles.tabLabelActive]}>Productos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('carrito')}>
            <Text style={[styles.tabIcon, activeTab === 'carrito' && styles.tabIconActive]}>🛒</Text>
            <Text style={[styles.tabLabel, activeTab === 'carrito' && styles.tabLabelActive]}>Carrito</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('perfil')}>
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
    backgroundColor: '#FFF7EB',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 540,
    alignSelf: 'center',
    backgroundColor: '#FFF7EB',
  },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // ESTILOS BIENVENIDA (INCISO 1)
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
  primaryActionButton: {
    width: '100%',
    backgroundColor: '#5B321B',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryActionButton: {
    width: '100%',
    backgroundColor: '#FFF7EB',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5B321B',
  },
  secondaryActionButtonText: {
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

  // HEADER DE LA APLICACIÓN
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

  // HERO BANNER (INCISO 2)
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
    color: '#E8B565',
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

  // BUSCADOR Y CATEGORÍAS (INCISO 3)
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
    paddingBottom: 90,
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

  // CARRITO (INCISO 4)
  cartScreenContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5B321B',
    marginVertical: 14,
  },
  emptyCartContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyCartIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5B321B',
  },
  emptyCartSubtitle: {
    fontSize: 13,
    color: '#7A5C47',
    textAlign: 'center',
    marginVertical: 8,
  },
  cartItemRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8D2C1',
  },
  cartItemImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  cartItemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B321B',
  },
  cartItemUnitPrice: {
    fontSize: 12,
    color: '#7A5C47',
    marginTop: 2,
  },
  cartQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyButton: {
    backgroundColor: '#E8D2C1',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    color: '#5B321B',
    fontWeight: '800',
    fontSize: 16,
  },
  qtyText: {
    fontWeight: '700',
    fontSize: 14,
    color: '#5B321B',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E8D2C1',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#7A5C47',
    fontSize: 14,
  },
  summaryValue: {
    color: '#5B321B',
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E8D2C1',
    paddingTop: 10,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5B321B',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5B321B',
  },

  // PAGO Y ENTREGA (INCISO 5)
  simpleHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#D9764A',
    fontWeight: '700',
    fontSize: 14,
  },
  headerTitleCenter: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: '#5B321B',
    marginRight: 60,
  },
  payOptionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E8D2C1',
    marginBottom: 12,
  },
  payOptionBoxActive: {
    borderColor: '#5B321B',
    backgroundColor: '#FFF9F5',
  },
  payOptionIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  payOptionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5B321B',
  },
  payOptionSub: {
    fontSize: 12,
    color: '#7A5C47',
    marginTop: 2,
  },
  deliveryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8D2C1',
    marginTop: 10,
  },
  deliveryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B321B',
    marginBottom: 8,
  },
  deliveryInput: {
    backgroundColor: '#FFF7EB',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    color: '#5B321B',
    borderWidth: 1,
    borderColor: '#E8D2C1',
  },
  confirmOrderButton: {
    backgroundColor: '#5B321B',
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmOrderButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // CONFIRMACIÓN (INCISO 6)
  confirmationBox: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D2C1',
  },
  checkCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D9764A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
  },
  confirmTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5B321B',
    marginBottom: 6,
  },
  confirmSub: {
    fontSize: 13,
    color: '#7A5C47',
    textAlign: 'center',
    marginBottom: 20,
  },
  orderNumberCard: {
    backgroundColor: '#FFF7EB',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E8D2C1',
    width: '100%',
  },
  orderNumberLabel: {
    fontSize: 12,
    color: '#7A5C47',
  },
  orderNumberValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5B321B',
    marginTop: 2,
  },

  // PANEL ADMIN (INCISOS 9 Y 10)
  adminHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#5B321B',
  },
  adminHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  logoutAdminText: {
    color: '#E8B565',
    fontWeight: '700',
    fontSize: 13,
  },
  adminTabToggle: {
    flexDirection: 'row',
    backgroundColor: '#5B321B',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  adminTabBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  adminTabBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  adminTabBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  adminTabBtnTextActive: {
    color: '#5B321B',
    fontWeight: '800',
    fontSize: 13,
  },
  adminItemRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E8D2C1',
  },
  adminItemImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  adminItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B321B',
  },
  adminItemPrice: {
    fontSize: 12,
    color: '#D9764A',
    fontWeight: '700',
  },
  editBtn: {
    backgroundColor: '#E8D2C1',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  editBtnText: {
    color: '#5B321B',
    fontWeight: '700',
    fontSize: 12,
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: '#E8D2C1',
    alignItems: 'center',
  },
  statsLabel: {
    fontSize: 13,
    color: '#7A5C47',
  },
  statsValue: {
    fontSize: 26,
    fontWeight: '800',
    color: '#5B321B',
    marginVertical: 4,
  },
  statsSub: {
    fontSize: 13,
    color: '#D9764A',
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E8D2C1',
    marginBottom: 30,
  },
  chartBarsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E8D2C1',
  },
  bar: {
    width: 24,
    backgroundColor: '#D9764A',
    borderRadius: 6,
  },
  chartLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  chartLabel: {
    fontSize: 11,
    color: '#7A5C47',
    width: 24,
    textAlign: 'center',
    fontWeight: '600',
  },

  // PERFIL
  profileContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D2C1',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5B321B',
  },
  profileSub: {
    fontSize: 13,
    color: '#7A5C47',
    marginTop: 4,
    marginBottom: 16,
  },
  logoutButton: {
    backgroundColor: '#D9764A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // BARRA DE NAVEGACIÓN INFERIOR
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

  // ESTADOS DE CARGA
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
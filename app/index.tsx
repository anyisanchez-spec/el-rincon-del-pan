import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  StatusBar,
  ScrollView,
  useWindowDimensions,
  Modal,
  Platform,
  ImageBackground,
  Switch
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
  imagen_local?: ImageSourcePropType;
}

interface CartItem {
  product: Producto;
  quantity: number;
}

interface Trabajador {
  id: number;
  nombre: string;
  rol: string;
  horario: string;
  estado: 'Activo' | 'Inactivo';
}

const normalizeText = (text?: string): string => {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

const matchesCategory = (itemCat?: string, targetCat?: string): boolean => {
  if (!targetCat || targetCat === 'Todos') return true;
  const c1 = normalizeText(itemCat);
  const c2 = normalizeText(targetCat);

  if (c1 === c2) return true;
  if (c2 === 'bebidas' && (c1.includes('bebida') || c1.includes('jugo') || c1.includes('cafe') || c1.includes('chocolate') || c1.includes('trago') || c1.includes('coctel') || c1.includes('licuado') || c1.includes('cerveza') || c1.includes('te'))) return true;
  if (c2 === 'despensa' && (c1.includes('despensa') || c1.includes('grano') || c1.includes('miel') || c1.includes('curcuma') || c1.includes('pinol') || c1.includes('polvo') || c1.includes('dulce') || c1.includes('tamarindo'))) return true;
  if (c2 === 'pan' && (c1.includes('pan') || c1.includes('semita') || c1.includes('croissant'))) return true;
  if (c2 === 'reposteria' && (c1.includes('reposter') || c1.includes('empanada') || c1.includes('dona') || c1.includes('pastel') || c1.includes('torta') || c1.includes('quesadilla'))) return true;

  return c1.includes(c2) || c2.includes(c1);
};

// ============================================================================
// DICCIONARIO DE IMÁGENES
// Para usar tus propias fotos guardadas en assets/images/, cambia { uri: '...' }
// por: require('../assets/images/tu-foto.jpg')
// ============================================================================
const PRODUCT_IMAGES: Record<string, ImageSourcePropType> = {
  // Panes
  'pan casero': { uri: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'semita de yema': { uri: 'https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'semita': { uri: 'https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'panes / croissants': { uri: 'https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'croissants': { uri: 'https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'pan de molde artesanal': { uri: 'https://images.pexels.com/photos/1586947/pexels-photo-1586947.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'pan integral': { uri: 'https://images.pexels.com/photos/1756062/pexels-photo-1756062.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'pan de ajo': { uri: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // Repostería
  'quesadilla hondurena': { uri: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'quesadilla': { uri: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'pastel de chocolate': { uri: 'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'empanada de pina': { uri: 'https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'empanada': { uri: 'https://images.pexels.com/photos/2955819/pexels-photo-2955819.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'dona glaseada': { uri: 'https://images.pexels.com/photos/3338681/pexels-photo-3338681.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'dona': { uri: 'https://images.pexels.com/photos/3338681/pexels-photo-3338681.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'torta de minimo (banano)': { uri: 'https://images.pexels.com/photos/830894/pexels-photo-830894.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'torta de minimo': { uri: 'https://images.pexels.com/photos/830894/pexels-photo-830894.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'torta de queso': { uri: 'https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'torta de zanahoria': { uri: 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'torta de elote': { uri: 'https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'torta de mantequilla': { uri: 'https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'torta de levadura': { uri: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // Bebidas & Tragos
  'cafe capuchino caliente': { uri: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'chocolate caliente': { uri: 'https://images.pexels.com/photos/373639/pexels-photo-373639.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'cafe helado (iced latte)': { uri: 'https://images.pexels.com/photos/2615323/pexels-photo-2615323.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'jugo natural de naranja': { uri: 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'horchata hondurena': { uri: 'https://images.pexels.com/photos/1233319/pexels-photo-1233319.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'granita de cafe espresso': { uri: 'https://images.pexels.com/photos/1193335/pexels-photo-1193335.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'licuado de banano con leche': { uri: 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'te helado de durazno': { uri: 'https://images.pexels.com/photos/792613/pexels-photo-792613.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'mojito artesanal con menta': { uri: 'https://images.pexels.com/photos/409635/pexels-photo-409635.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'margarita de la casa': { uri: 'https://images.pexels.com/photos/1189257/pexels-photo-1189257.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'cerveza artesanal de trigo': { uri: 'https://images.pexels.com/photos/1552630/pexels-photo-1552630.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'ron con cola (cuba libre)': { uri: 'https://images.pexels.com/photos/605408/pexels-photo-605408.jpeg?auto=compress&cs=tinysrgb&w=600' },

  // Despensa
  'cafe en grano (1 lb)': { uri: 'https://images.pexels.com/photos/1695052/pexels-photo-1695052.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'cafe molido gourmet (1 lb)': { uri: 'https://images.pexels.com/photos/373888/pexels-photo-373888.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'miel de abeja pura': { uri: 'https://images.pexels.com/photos/33260/honey-sweet-syrup-organic.jpg?auto=compress&cs=tinysrgb&w=600' },
  'curcuma organica molida': { uri: 'https://images.pexels.com/photos/1340116/pexels-photo-1340116.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'cacao & chocolate artesanal': { uri: 'https://images.pexels.com/photos/65882/chocolate-dark-coffee-confiserie-65882.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'pinol de maiz (1 lb)': { uri: 'https://images.pexels.com/photos/691114/pexels-photo-691114.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'chocolate de cacao en polvo (1 lb)': { uri: 'https://images.pexels.com/photos/918327/pexels-photo-918327.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'dulces de tamarindo con chile': { uri: 'https://images.pexels.com/photos/4016579/pexels-photo-4016579.jpeg?auto=compress&cs=tinysrgb&w=600' },
  'atado de dulce de rapadura': { uri: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=600' },
};

const FALLBACK_BAKERY_IMAGE: ImageSourcePropType = {
  uri: 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=600',
};

const HERO_BANNER_IMG = 'https://images.pexels.com/photos/1775043/pexels-photo-1775043.jpeg?auto=compress&cs=tinysrgb&w=800';
const WELCOME_HEADER_IMG = 'https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?auto=compress&cs=tinysrgb&w=800';

const isDirectImageUrl = (url?: string): boolean => {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  if (!clean.startsWith('http')) return false;
  if (clean.includes('instagram.com/p/') || clean.includes('facebook.com/')) return false;
  return true;
};

const getProductImageSource = (item: Producto): ImageSourcePropType => {
  if (item.imagen_local) {
    return item.imagen_local;
  }

  if (isDirectImageUrl(item.imagen_url)) {
    return { uri: item.imagen_url!.trim() };
  }

  const normName = normalizeText(item.nombre);
  if (PRODUCT_IMAGES[normName]) {
    return PRODUCT_IMAGES[normName];
  }

  for (const key of Object.keys(PRODUCT_IMAGES)) {
    if (normName.includes(key)) {
      return PRODUCT_IMAGES[key];
    }
  }

  const normCat = normalizeText(item.categoria);
  if (normCat.includes('bebida')) return PRODUCT_IMAGES['cafe capuchino caliente'];
  if (normCat.includes('despensa')) return PRODUCT_IMAGES['cafe molido gourmet (1 lb)'];
  if (normCat.includes('reposter')) return PRODUCT_IMAGES['quesadilla hondurena'];

  return FALLBACK_BAKERY_IMAGE;
};

const SafeProductImage = ({
  item,
  style,
}: {
  item: Producto;
  style: any;
}) => {
  const [failed, setFailed] = useState(false);
  const source = failed ? FALLBACK_BAKERY_IMAGE : getProductImageSource(item);

  return (
    <Image
      source={source}
      style={style}
      resizeMode="cover"
      onError={() => {
        if (!failed) setFailed(true);
      }}
    />
  );
};

const FULL_PRODUCTS_CATALOG: Producto[] = [
  // Pan
  { id: 'p1', nombre: 'Pan Casero', precio: 15.00, categoria: 'Pan' },
  { id: 'p2', nombre: 'Semita de Yema', precio: 15.00, categoria: 'Pan' },
  { id: 'p3', nombre: 'Panes / Croissants', precio: 12.00, categoria: 'Pan' },
  { id: 'p4', nombre: 'Pan de Molde Artesanal', precio: 50.00, categoria: 'Pan' },
  { id: 'p5', nombre: 'Pan Integral', precio: 22.00, categoria: 'Pan' },
  { id: 'p6', nombre: 'Pan de Ajo', precio: 25.00, categoria: 'Pan' },

  // Repostería
  { id: 'p7', nombre: 'Quesadilla Hondureña', precio: 25.00, categoria: 'Repostería' },
  { id: 'p8', nombre: 'Pastel de Chocolate', precio: 45.00, categoria: 'Repostería' },
  { id: 'p9', nombre: 'Empanada de Piña', precio: 18.00, categoria: 'Repostería' },
  { id: 'p10', nombre: 'Dona Glaseada', precio: 20.00, categoria: 'Repostería' },
  { id: 'p11', nombre: 'Torta de Mínimo (Banano)', precio: 30.00, categoria: 'Repostería' },
  { id: 'p12', nombre: 'Torta de Queso', precio: 35.00, categoria: 'Repostería' },
  { id: 'p13', nombre: 'Torta de Zanahoria', precio: 35.00, categoria: 'Repostería' },
  { id: 'p14', nombre: 'Torta de Elote', precio: 30.00, categoria: 'Repostería' },
  { id: 'p15', nombre: 'Torta de Mantequilla', precio: 28.00, categoria: 'Repostería' },
  { id: 'p16', nombre: 'Torta de Levadura', precio: 25.00, categoria: 'Repostería' },

  // Bebidas & Tragos
  { id: 'p20', nombre: 'Café Capuchino Caliente', precio: 35.00, categoria: 'Bebidas' },
  { id: 'p21', nombre: 'Chocolate Caliente', precio: 30.00, categoria: 'Bebidas' },
  { id: 'p22', nombre: 'Café Helado (Iced Latte)', precio: 40.00, categoria: 'Bebidas' },
  { id: 'p23', nombre: 'Jugo Natural de Naranja', precio: 25.00, categoria: 'Bebidas' },
  { id: 'p30', nombre: 'Horchata Hondureña', precio: 30.00, categoria: 'Bebidas' },
  { id: 'p31', nombre: 'Granita de Café Espresso', precio: 45.00, categoria: 'Bebidas' },
  { id: 'p32', nombre: 'Licuado de Banano con Leche', precio: 35.00, categoria: 'Bebidas' },
  { id: 'p33', nombre: 'Té Helado de Durazno', precio: 28.00, categoria: 'Bebidas' },
  { id: 'p34', nombre: 'Mojito Artesanal con Menta', precio: 80.00, categoria: 'Bebidas' },
  { id: 'p35', nombre: 'Margarita de la Casa', precio: 75.00, categoria: 'Bebidas' },
  { id: 'p36', nombre: 'Cerveza Artesanal de Trigo', precio: 55.00, categoria: 'Bebidas' },
  { id: 'p37', nombre: 'Ron con Cola (Cuba Libre)', precio: 70.00, categoria: 'Bebidas' },

  // Despensa
  { id: 'p24', nombre: 'Café en Grano (1 lb)', precio: 120.00, categoria: 'Despensa' },
  { id: 'p25', nombre: 'Café Molido Gourmet (1 lb)', precio: 110.00, categoria: 'Despensa' },
  { id: 'p26', nombre: 'Miel de Abeja Pura', precio: 90.00, categoria: 'Despensa' },
  { id: 'p27', nombre: 'Cúrcuma Orgánica Molida', precio: 65.00, categoria: 'Despensa' },
  { id: 'p28', nombre: 'Cacao & Chocolate Artesanal', precio: 75.00, categoria: 'Despensa' },
  { id: 'p40', nombre: 'Pinol de Maíz (1 lb)', precio: 40.00, categoria: 'Despensa' },
  { id: 'p41', nombre: 'Chocolate de Cacao en Polvo (1 lb)', precio: 65.00, categoria: 'Despensa' },
  { id: 'p42', nombre: 'Dulces de Tamarindo con Chile', precio: 35.00, categoria: 'Despensa' },
  { id: 'p43', nombre: 'Atado de Dulce de Rapadura', precio: 30.00, categoria: 'Despensa' },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const maxContentWidth = Math.min(width, 540);
  const cardWidth = (maxContentWidth - 48) / 2;

  const [currentScreen, setCurrentScreen] = useState<
    'bienvenida' | 'inicio' | 'productos' | 'carrito' | 'pago' | 'confirmacion' | 'admin_menu' | 'admin_ventas' | 'admin_pedidos' | 'admin_reportes' | 'admin_config'
  >('bienvenida');

  const [adminSubTab, setAdminSubTab] = useState<'directo' | 'trabajadores'>('directo');

  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: { id: 'c1', nombre: 'Pan Casero', precio: 15.00, categoria: 'Pan' },
      quantity: 1
    },
    {
      product: { id: 'c2', nombre: 'Semita de Yema', precio: 15.00, categoria: 'Pan' },
      quantity: 1
    }
  ]);

  const [shippingFeeInput, setShippingFeeInput] = useState('15.00');
  const [openingHours, setOpeningHours] = useState('06:00 AM - 07:00 PM');
  const [cashEnabled, setCashEnabled] = useState(true);
  const [transferEnabled, setTransferEnabled] = useState(true);

  const [trabajadores] = useState<Trabajador[]>([
    { id: 1, nombre: 'Carlos López', rol: 'Maestro Panadero', horario: '05:00 AM - 01:00 PM', estado: 'Activo' },
    { id: 2, nombre: 'Ana Martínez', rol: 'Cajera', horario: '07:00 AM - 03:00 PM', estado: 'Activo' },
    { id: 3, nombre: 'Pedro Ramos', rol: 'Repartidor', horario: '08:00 AM - 04:00 PM', estado: 'Activo' }
  ]);

  const [paymentMethod, setPaymentMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
  const [deliveryAddress, setDeliveryAddress] = useState('Col. Los Pinos, Casa 123, San Pedro Sula, Cortés');
  const [lastOrderNum, setLastOrderNum] = useState('#000123');

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('1234');

  const [products, setProducts] = useState<Producto[]>(FULL_PRODUCTS_CATALOG);
  const [filteredProducts, setFilteredProducts] = useState<Producto[]>(FULL_PRODUCTS_CATALOG);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = ['Todos', 'Pan', 'Repostería', 'Bebidas', 'Despensa'];

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase.from('productos').select('*');
      if (error) console.log('Aviso Supabase:', error.message);

      if (data && data.length > 0) {
        const filteredSupabase = data.filter(p => normalizeText(p.categoria) !== 'rosquillas');
        const merged = [...FULL_PRODUCTS_CATALOG];

        filteredSupabase.forEach(sp => {
          const existingIndex = merged.findIndex(m => normalizeText(m.nombre) === normalizeText(sp.nombre));
          if (existingIndex >= 0) {
            if (isDirectImageUrl(sp.imagen_url)) {
              merged[existingIndex] = { ...merged[existingIndex], imagen_url: sp.imagen_url };
            }
          } else {
            merged.push(sp);
          }
        });
        setProducts(merged);
      } else {
        setProducts(FULL_PRODUCTS_CATALOG);
      }
    } catch (e) {
      console.log('Error al obtener productos', e);
      setProducts(FULL_PRODUCTS_CATALOG);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let result = products.filter(item => normalizeText(item.categoria) !== 'rosquillas');

    if (selectedCategory !== 'Todos') {
      result = result.filter((item) => matchesCategory(item.categoria, selectedCategory));
    }

    if (searchQuery.trim() !== '') {
      result = result.filter((item) =>
        normalizeText(item.nombre).includes(normalizeText(searchQuery))
      );
    }

    setFilteredProducts(result);
  }, [searchQuery, selectedCategory, products]);

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

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cartItems.reduce((sum, item) => {
    const price = typeof item.product.precio === 'number'
      ? item.product.precio
      : parseFloat(item.product.precio as string || '0') || 0;
    return sum + price * item.quantity;
  }, 0);

  const parsedShipping = parseFloat(shippingFeeInput) || 15.00;
  const shippingFee = cartItems.length > 0 ? parsedShipping : 0.00;
  const grandTotal = subtotal + shippingFee;

  const handleAdminLogin = () => {
    setShowLoginModal(false);
    setCurrentScreen('admin_menu');
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
      setCurrentScreen('inicio');
    } catch (error: any) {
      Alert.alert('Error', 'Error al iniciar sesión con Google: ' + (error.message || error));
    }
  };

  const handleConfirmOrder = () => {
    const randomOrder = `#000${Math.floor(100 + Math.random() * 900)}`;
    setLastOrderNum(randomOrder);
    setCurrentScreen('confirmacion');
  };

  if (currentScreen === 'bienvenida') {
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
                style={styles.primaryActionButton}
                onPress={() => setCurrentScreen('inicio')}
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

        <Modal visible={showLoginModal} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Iniciar Sesión - Admin</Text>
              <Text style={styles.modalHintText}>Presiona Ingresar para acceder al Panel Admin</Text>

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

  if (currentScreen === 'pago') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.mainWrapper}>
          <View style={styles.simpleHeader}>
            <TouchableOpacity onPress={() => setCurrentScreen('carrito')}>
              <Text style={styles.backButtonText}>‹ Método de pago</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
            <TouchableOpacity
              style={[styles.payOptionBox, paymentMethod === 'efectivo' && styles.payOptionBoxActive]}
              onPress={() => setPaymentMethod('efectivo')}
            >
              <Text style={styles.payOptionIcon}>🏠</Text>
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

            <View style={styles.deliveryCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.deliveryTitle}>Dirección de entrega</Text>
                <Text style={{ color: '#D9764A', fontSize: 12, fontWeight: '700' }}>Editar</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                <Text style={{ fontSize: 16, marginRight: 8 }}>📍</Text>
                <TextInput
                  style={styles.deliveryInput}
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  multiline
                />
              </View>
            </View>

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

  if (currentScreen === 'confirmacion') {
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
                setCurrentScreen('inicio');
              }}
            >
              <Text style={styles.primaryActionButtonText}>Ver detalles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'admin_menu') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.mainWrapper}>
          <View style={styles.adminMainHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 24, marginRight: 8 }}>🏠</Text>
              <Text style={styles.adminMainTitle}>Admin</Text>
            </View>
            <TouchableOpacity onPress={() => setCurrentScreen('bienvenida')}>
              <Text style={styles.logoutAdminLink}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.adminSubTabsBar}>
            <TouchableOpacity
              style={adminSubTab === 'directo' ? styles.adminSubTabActive : styles.adminSubTabInactive}
              onPress={() => setAdminSubTab('directo')}
            >
              <Text style={adminSubTab === 'directo' ? styles.adminSubTabTextActive : styles.adminSubTabTextInactive}>Directo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={adminSubTab === 'trabajadores' ? styles.adminSubTabActive : styles.adminSubTabInactive}
              onPress={() => setAdminSubTab('trabajadores')}
            >
              <Text style={adminSubTab === 'trabajadores' ? styles.adminSubTabTextActive : styles.adminSubTabTextInactive}>Trabajadores</Text>
            </TouchableOpacity>
          </View>

          {adminSubTab === 'directo' ? (
            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
              <TouchableOpacity
                style={styles.adminMenuCard}
                onPress={() => setCurrentScreen('admin_pedidos')}
                activeOpacity={0.85}
              >
                <Text style={styles.adminMenuCardIcon}>📦</Text>
                <Text style={styles.adminMenuCardText}>Pedidos</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminMenuCard}
                onPress={() => setCurrentScreen('admin_ventas')}
                activeOpacity={0.85}
              >
                <Text style={styles.adminMenuCardIcon}>📈</Text>
                <Text style={styles.adminMenuCardText}>Ventas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminMenuCard}
                onPress={() => setCurrentScreen('admin_reportes')}
                activeOpacity={0.85}
              >
                <Text style={styles.adminMenuCardIcon}>📊</Text>
                <Text style={styles.adminMenuCardText}>Reportes</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.adminMenuCard}
                onPress={() => setCurrentScreen('admin_config')}
                activeOpacity={0.85}
              >
                <Text style={styles.adminMenuCardIcon}>⚙️</Text>
                <Text style={styles.adminMenuCardText}>Configuración</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Text style={styles.sectionTitle}>Personal de la Panadería</Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#5B321B', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 }}
                  onPress={() => Alert.alert('Nuevo Trabajador', 'Formulario para registrar personal')}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>+ Agregar</Text>
                </TouchableOpacity>
              </View>

              {trabajadores.map((t) => (
                <View key={t.id} style={styles.staffCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.staffName}>{t.nombre}</Text>
                    <Text style={styles.staffRole}>{t.rol}</Text>
                    <Text style={styles.staffHours}>⏰ {t.horario}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{t.estado}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'admin_reportes') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.mainWrapper}>
          <View style={styles.simpleHeader}>
            <TouchableOpacity onPress={() => setCurrentScreen('admin_menu')}>
              <Text style={styles.backButtonText}>‹ Volver al Menú Admin</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitleCenter}>Reportes</Text>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.sectionTitle}>Productos Más Vendidos</Text>

            <View style={styles.reportItemCard}>
              <Text style={styles.reportItemName}>1. Semita de Yema</Text>
              <Text style={styles.reportItemStat}>120 unidades vendidas</Text>
            </View>

            <View style={styles.reportItemCard}>
              <Text style={styles.reportItemName}>2. Pan Casero</Text>
              <Text style={styles.reportItemStat}>95 unidades vendidas</Text>
            </View>

            <View style={styles.reportItemCard}>
              <Text style={styles.reportItemName}>3. Quesadilla Hondureña</Text>
              <Text style={styles.reportItemStat}>80 unidades vendidas</Text>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Resumen de Insumos</Text>
            <View style={styles.reportSummaryBox}>
              <Text style={styles.reportSummaryText}>• Harina de Trigo: 85% de stock</Text>
              <Text style={styles.reportSummaryText}>• Café en Grano: 90% de stock</Text>
              <Text style={styles.reportSummaryText}>• Miel & Manteca: Reabastecido</Text>
            </View>

            <TouchableOpacity
              style={styles.confirmOrderButton}
              onPress={() => Alert.alert('Descarga exitosa', 'El reporte general en PDF ha sido exportado.')}
            >
              <Text style={styles.confirmOrderButtonText}>📥 Descargar Reporte Completo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'admin_config') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.mainWrapper}>
          <View style={styles.simpleHeader}>
            <TouchableOpacity onPress={() => setCurrentScreen('admin_menu')}>
              <Text style={styles.backButtonText}>‹ Volver al Menú Admin</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitleCenter}>Configuración</Text>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
            <Text style={styles.sectionTitle}>Parámetros del Negocio</Text>

            <View style={styles.configCard}>
              <Text style={styles.configLabel}>Costo de Envío por Defecto (L.)</Text>
              <TextInput
                style={styles.configInput}
                value={shippingFeeInput}
                onChangeText={setShippingFeeInput}
                keyboardType="numeric"
              />

              <Text style={styles.configLabel}>Horario de Atención</Text>
              <TextInput
                style={styles.configInput}
                value={openingHours}
                onChangeText={setOpeningHours}
              />
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Métodos de Pago Activos</Text>
            <View style={styles.configCard}>
              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>💵 Efectivo al recibir</Text>
                <Switch
                  value={cashEnabled}
                  onValueChange={setCashEnabled}
                  trackColor={{ false: '#E8D2C1', true: '#5B321B' }}
                />
              </View>

              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.toggleLabel}>🏦 Transferencia bancaria</Text>
                <Switch
                  value={transferEnabled}
                  onValueChange={setTransferEnabled}
                  trackColor={{ false: '#E8D2C1', true: '#5B321B' }}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.confirmOrderButton}
              onPress={() => Alert.alert('Configuración Guardada', 'Se han actualizado los parámetros de la tienda.')}
            >
              <Text style={styles.confirmOrderButtonText}>Guardar Cambios</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </SafeAreaView>
    );
  }

  if (currentScreen === 'admin_pedidos') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.mainWrapper}>
          <View style={styles.adminMainHeader}>
            <TouchableOpacity onPress={() => setCurrentScreen('admin_menu')}>
              <Text style={styles.logoutAdminLink}>‹ Volver al Menú Admin</Text>
            </TouchableOpacity>
            <Text style={styles.adminMainTitle}>Gestión de Productos</Text>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20, paddingTop: 16 }}>
            {products.map(p => (
              <View key={p.id?.toString() || Math.random().toString()} style={styles.adminItemRow}>
                <SafeProductImage item={p} style={styles.adminItemImage} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.adminItemName}>{p.nombre}</Text>
                  <Text style={styles.adminItemPrice}>
                    L. {typeof p.precio === 'number' ? p.precio.toFixed(2) : parseFloat(p.precio as string || '0').toFixed(2)}
                  </Text>
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

  if (currentScreen === 'admin_ventas') {
    return (
      <SafeAreaView style={styles.outerContainer}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.mainWrapper}>
          <View style={styles.ventasHeader}>
            <TouchableOpacity onPress={() => setCurrentScreen('admin_menu')}>
              <Text style={styles.backButtonText}>‹ Volver</Text>
            </TouchableOpacity>
            <Text style={styles.ventasTitle}>Ventas</Text>
            <View style={styles.dropdownFilter}>
              <Text style={styles.dropdownFilterText}>Este mes ▾</Text>
            </View>
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingBottom: 40 }}>
            <View style={styles.ventasMetricsCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ventasMetricsLabel}>Total de ventas</Text>
                <Text style={styles.ventasMetricsTotal}>L. 4,650.00</Text>
              </View>
              <View style={{ borderLeftWidth: 1, borderLeftColor: '#E8D2C1', paddingLeft: 16 }}>
                <Text style={styles.ventasMetricsLabel}>Pedidos</Text>
                <Text style={styles.ventasMetricsCount}>48</Text>
              </View>
            </View>

            <View style={styles.promedioBox}>
              <Text style={styles.promedioLabel}>Promedio / día</Text>
              <Text style={styles.promedioValue}>L. 155.00</Text>
            </View>

            <View style={styles.chartContainer}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#5B321B', marginBottom: 14 }}>
                Rendimiento semanal
              </Text>
              <View style={styles.chartBarsRow}>
                <View style={[styles.bar, { height: 45 }]} />
                <View style={[styles.bar, { height: 75 }]} />
                <View style={[styles.bar, { height: 55 }]} />
                <View style={[styles.bar, { height: 95 }]} />
                <View style={[styles.bar, { height: 115 }]} />
                <View style={[styles.bar, { height: 145 }]} />
                <View style={[styles.bar, { height: 100 }]} />
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

  return (
    <SafeAreaView style={styles.outerContainer}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.mainWrapper}>

        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>El Rincón del Pan</Text>
            <Text style={styles.roleTag}>🥖 Sabor Artesanal</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.cartIconBadge} onPress={() => setCurrentScreen('carrito')}>
              <Text style={styles.cartIconText}>🛒</Text>
              {cartCount > 0 && (
                <View style={styles.badgeCount}>
                  <Text style={styles.badgeCountText}>{cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.switchRoleButton}
              onPress={() => setCurrentScreen('bienvenida')}
            >
              <Text style={styles.switchRoleText}>Salir</Text>
            </TouchableOpacity>
          </View>
        </View>

        {currentScreen === 'carrito' ? (
          <ScrollView style={styles.cartScreenContainer} contentContainerStyle={{ paddingBottom: 80 }}>
            <Text style={styles.sectionTitle}>Carrito</Text>

            {cartItems.length === 0 ? (
              <View style={styles.emptyCartContainer}>
                <Text style={styles.emptyCartIcon}>🍞</Text>
                <Text style={styles.emptyCartTitle}>Tu carrito está vacío</Text>
                <Text style={styles.emptyCartSubtitle}>Agrega delicias desde el catálogo para hacer tu pedido.</Text>
                <TouchableOpacity style={styles.primaryActionButton} onPress={() => setCurrentScreen('productos')}>
                  <Text style={styles.primaryActionButtonText}>Ver Catálogo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {cartItems.map((item) => {
                  const itemPrice = typeof item.product.precio === 'number'
                    ? item.product.precio
                    : parseFloat(item.product.precio as string || '0') || 0;

                  return (
                    <View key={item.product.id?.toString() || Math.random().toString()} style={styles.cartItemRow}>
                      <SafeProductImage item={item.product} style={styles.cartItemImage} />
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

                  <TouchableOpacity style={styles.confirmOrderButton} onPress={() => setCurrentScreen('pago')}>
                    <Text style={styles.confirmOrderButtonText}>Continuar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              data={filteredProducts}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={({ item }) => {
                const numPrice = typeof item.precio === 'number' ? item.precio : parseFloat(item.precio as string || '0') || 0;

                return (
                  <View style={[styles.card, { width: cardWidth }]}>
                    <SafeProductImage item={item} style={styles.productImage} />
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
              }}
              numColumns={2}
              columnWrapperStyle={styles.rowWrapper}
              contentContainerStyle={styles.gridContainer}
              showsVerticalScrollIndicator={true}
              ListHeaderComponent={
                <>
                  {currentScreen === 'inicio' && (
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
                </>
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No hay productos disponibles en esta categoría.</Text>
                </View>
              }
            />
          </View>
        )}

        <View style={styles.bottomTabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentScreen('inicio')}>
            <Text style={[styles.tabIcon, currentScreen === 'inicio' && styles.tabIconActive]}>🏠</Text>
            <Text style={[styles.tabLabel, currentScreen === 'inicio' && styles.tabLabelActive]}>Inicio</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentScreen('productos')}>
            <Text style={[styles.tabIcon, currentScreen === 'productos' && styles.tabIconActive]}>🥖</Text>
            <Text style={[styles.tabLabel, currentScreen === 'productos' && styles.tabLabelActive]}>Productos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => setCurrentScreen('carrito')}>
            <Text style={[styles.tabIcon, currentScreen === 'carrito' && styles.tabIconActive]}>🛒</Text>
            <Text style={[styles.tabLabel, currentScreen === 'carrito' && styles.tabLabelActive]}>Carrito</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => Alert.alert('Perfil', 'Sesión de cliente activa')}>
            <Text style={styles.tabIcon}>👤</Text>
            <Text style={styles.tabLabel}>Perfil</Text>
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
  gridContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  },
  deliveryInput: {
    flex: 1,
    backgroundColor: '#FFF7EB',
    borderRadius: 12,
    padding: 10,
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
  adminMainHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#5B321B',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminMainTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  logoutAdminLink: {
    color: '#E8B565',
    fontWeight: '700',
    fontSize: 13,
  },
  adminSubTabsBar: {
    flexDirection: 'row',
    backgroundColor: '#5B321B',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 12,
  },
  adminSubTabActive: {
    backgroundColor: '#D9764A',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  adminSubTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  adminSubTabInactive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 20,
    borderRadius: 16,
  },
  adminSubTabTextInactive: {
    color: '#E8D2C1',
    fontWeight: '600',
    fontSize: 13,
  },
  adminMenuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D2C1',
    shadowColor: '#5B321B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },
  adminMenuCardIcon: {
    fontSize: 28,
    marginRight: 18,
  },
  adminMenuCardText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5B321B',
  },
  staffCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8D2C1',
    flexDirection: 'row',
    alignItems: 'center',
  },
  staffName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5B321B',
  },
  staffRole: {
    fontSize: 13,
    color: '#D9764A',
    fontWeight: '700',
    marginTop: 2,
  },
  staffHours: {
    fontSize: 12,
    color: '#7A5C47',
    marginTop: 4,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#2E7D32',
    fontSize: 11,
    fontWeight: '800',
  },
  reportItemCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8D2C1',
    marginBottom: 10,
  },
  reportItemName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5B321B',
  },
  reportItemStat: {
    fontSize: 13,
    color: '#D9764A',
    fontWeight: '700',
    marginTop: 2,
  },
  reportSummaryBox: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8D2C1',
    marginBottom: 16,
  },
  reportSummaryText: {
    fontSize: 13,
    color: '#5B321B',
    marginBottom: 6,
    fontWeight: '600',
  },
  configCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8D2C1',
    marginBottom: 12,
  },
  configLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B321B',
    marginBottom: 6,
    marginTop: 4,
  },
  configInput: {
    backgroundColor: '#FFF7EB',
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
    color: '#5B321B',
    borderWidth: 1,
    borderColor: '#E8D2C1',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFF7EB',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5B321B',
  },
  ventasHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ventasTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#5B321B',
  },
  dropdownFilter: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8D2C1',
  },
  dropdownFilterText: {
    fontSize: 12,
    color: '#7A5C47',
    fontWeight: '600',
  },
  ventasMetricsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E8D2C1',
    marginTop: 10,
    marginBottom: 10,
  },
  ventasMetricsLabel: {
    fontSize: 12,
    color: '#7A5C47',
  },
  ventasMetricsTotal: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5B321B',
    marginTop: 4,
  },
  ventasMetricsCount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D9764A',
    marginTop: 4,
  },
  promedioBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8D2C1',
    marginBottom: 16,
  },
  promedioLabel: {
    fontSize: 13,
    color: '#7A5C47',
    fontWeight: '600',
  },
  promedioValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5B321B',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 20,
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
  bottomTabBar: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E8D2C1',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
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
    marginBottom: 4,
  },
  modalHintText: {
    fontSize: 12,
    color: '#D9764A',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
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
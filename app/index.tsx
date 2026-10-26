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
import { router } from 'expo-router'; // <-- 1. Importación para la navegación
import { supabase } from '../supabase';

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

export default function WelcomeScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);

  // Validación de imagen
  const obtenerUriSegura = (url?: string) => {
    if (!url || url.trim() === '') {
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500';
    }
    return url;
  };

  return (
    <SafeAreaView style={styles.welcomeSafeArea}>
      <View style={styles.welcomeContainer}>
        {/* Encabezado con marca */}
        <View style={styles.welcomeHeader}>
          <Text style={styles.welcomeTitle}>El Rincón del Pan</Text>
          <Text style={styles.welcomeSubtitle}>Pan fresco, sabor casero ♡</Text>
        </View>

        {/* Imagen central artesanal */}
        <View style={styles.welcomeImageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800' }}
            style={styles.welcomeImage}
            resizeMode="cover"
          />
        </View>

        {/* Botón Comenzar -> Redirige a las Pestañas (Tabs) */}
        <View style={styles.welcomeFooter}>
          <TouchableOpacity
            style={styles.comenzarButton}
            onPress={() => router.replace('/(tabs)')} // <-- 2. Navega directamente al menú inferior
          >
            <Text style={styles.comenzarButtonText}>Comenzar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  welcomeSafeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  welcomeHeader: {
    alignItems: 'center',
    marginTop: 20,
  },
  welcomeTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: COLORS.accent,
    marginTop: 6,
  },
  welcomeImageContainer: {
    width: '100%',
    height: 340,
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 20,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  welcomeImage: {
    width: '100%',
    height: '100%',
  },
  welcomeFooter: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  comenzarButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  comenzarButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { useCart } from '../context/CartContext';

const COLORS = {
  background: '#FFF7EB', // Crema
  primary: '#5B321B',    // Café principal
  accent: '#D9764A',     // Terracota
  secondary: '#E8B565',  // Trigo
  cardBg: '#FFFFFF',     // Blanco
  textDark: '#332219',   // Café oscuro
  textLight: '#8C7365',  // Café claro
};

export default function CarritoScreen() {
  const { cart, updateQuantity, subtotal, envio, total, clearCart } = useCart();

  const obtenerUriSegura = (url?: string) => {
    if (!url || url.trim() === '') {
      return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500';
    }
    return url;
  };

  const handleContinuarPago = () => {
    if (cart.length === 0) {
      Alert.alert('Carrito vacío', 'Agrega algunos productos antes de continuar.');
      return;
    }
    Alert.alert('Pedido Confirmado', '¡Tu pedido de pan artesanal ha sido registrado con éxito!');
    clearCart();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Carrito</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Tu carrito está vacío 🥐</Text>
          <Text style={styles.emptySubtitle}>Ve a la pestaña de productos y agrega tus panes favoritos.</Text>
        </View>
      ) : (
        <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
          {cart.map((item) => (
            <View key={item.id} style={styles.cartCard}>
              <Image
                source={{ uri: obtenerUriSegura(item.imagen_url) }}
                style={styles.cardImage}
              />
              <View style={styles.cardDetails}>
                <Text style={styles.itemTitle}>{item.nombre}</Text>
                <Text style={styles.itemPrice}>L. {item.precio.toFixed(2)}</Text>
              </View>

              {/* Control de cantidad */}
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.id, -1)}
                >
                  <Text style={styles.qtyButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.cantidad}</Text>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => updateQuantity(item.id, 1)}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Resumen de Pago (Pantalla 4 del diseño) */}
      {cart.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>L. {subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Envío</Text>
            <Text style={styles.summaryValue}>L. {envio.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>L. {total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity style={styles.continuarButton} onPress={handleContinuarPago}>
            <Text style={styles.continuarButtonText}>Continuar</Text>
          </TouchableOpacity>
        </View>
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  cartList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  cartCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: COLORS.secondary,
  },
  cardDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.accent,
    marginTop: 2,
    fontWeight: 'bold',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  qtyButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginHorizontal: 10,
  },
  summaryContainer: {
    backgroundColor: COLORS.cardBg,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textDark,
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  continuarButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  continuarButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
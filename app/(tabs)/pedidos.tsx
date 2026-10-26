import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  background: '#FFF7EB', // Crema
  primary: '#5B321B',    // Café principal
  accent: '#D9764A',     // Terracota
  secondary: '#E8B565',  // Trigo
  cardBg: '#FFFFFF',     // Blanco
  textDark: '#332219',   // Café oscuro
  textLight: '#8C7365',  // Café claro
  success: '#4CAF50',    // Verde
  warning: '#FF9800',    // Naranja
};

export default function PedidosScreen() {
  const pedidosEjemplo = [
    {
      id: '#1024',
      fecha: '26 de Octubre, 2026',
      items: '2x Semita Casera, 1x Torta de Queso',
      total: 150.00,
      estado: 'En preparación',
      colorEstado: COLORS.warning,
      icon: 'time-outline',
    },
    {
      id: '#1019',
      fecha: '24 de Octubre, 2026',
      items: '5x Rosquillas de Queso',
      total: 65.00,
      estado: 'Entregado',
      colorEstado: COLORS.success,
      icon: 'checkmark-circle-outline',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Pedidos</Text>
        <Text style={styles.headerSubtitle}>Sigue el estado de tu pan recién horneado</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Historial y Estado</Text>

        {pedidosEjemplo.map((pedido) => (
          <View key={pedido.id} style={styles.orderCard}>
            <View style={styles.cardHeader}>
              <View style={styles.idRow}>
                <Ionicons name="receipt-outline" size={20} color={COLORS.primary} />
                <Text style={styles.orderId}>Pedido {pedido.id}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: pedido.colorEstado }]}>
                <Text style={styles.statusText}>{pedido.estado}</Text>
              </View>
            </View>

            <Text style={styles.orderDate}>{pedido.fecha}</Text>
            <Text style={styles.orderItems}>{pedido.items}</Text>

            <View style={styles.cardFooter}>
              <Text style={styles.totalLabel}>Total pagado:</Text>
              <Text style={styles.totalValue}>L. {pedido.total.toFixed(2)}</Text>
            </View>

            <TouchableOpacity style={styles.detailButton}>
              <Text style={styles.detailButtonText}>Ver detalle del pedido</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
  orderCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 8,
  },
  orderItems: {
    fontSize: 14,
    color: COLORS.textDark,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 8,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  detailButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
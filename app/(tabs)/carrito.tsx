import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
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
  success: '#4CAF50',
};

export default function CarritoScreen() {
  const [enviando, setEnviando] = useState(false);

  // Datos simulados del carrito actual
  const resumenPedido = {
    items: '2x Semita Casera, 1x Pan de Yema',
    total: 120.00,
  };

  const confirmarPedido = async () => {
    try {
      setEnviando(true);

      // Inserción en la base de datos Supabase
      const { data, error } = await supabase.from('pedidos').insert([
        {
          items: resumenPedido.items,
          total: resumenPedido.total,
          estado: 'En preparación',
          fecha: new Date().toLocaleDateString('es-HN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }),
        },
      ]);

      if (error) {
        Alert.alert('Error', 'No se pudo registrar el pedido: ' + error.message);
      } else {
        Alert.alert('¡Pedido Confirmado!', 'Tu orden fue enviada a la panadería.', [
          { text: 'Ok' }
        ]);
      }
    } catch (err) {
      Alert.alert('Error', 'Ocurrió un problema inesperado.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Resumen de la orden</Text>
          <Text style={styles.itemsText}>{resumenPedido.items}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total a pagar:</Text>
            <Text style={styles.totalValue}>L. {resumenPedido.total.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={confirmarPedido}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={22} color="#FFF" style={{ marginRight: 8 }} />
              <Text style={styles.confirmButtonText}>Confirmar y Enviar Pedido</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 16, paddingBottom: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: COLORS.secondary },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.primary },
  content: { padding: 16, flex: 1, justifyContent: 'space-between' },
  card: { backgroundColor: COLORS.cardBg, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#EFEFEF' },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary, marginBottom: 8 },
  itemsText: { fontSize: 14, color: COLORS.textDark, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: COLORS.textLight },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.accent },
  confirmButton: { backgroundColor: COLORS.accent, paddingVertical: 14, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  confirmButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
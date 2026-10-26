import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  estrellas: string;
};

type CarritoItem = Producto & {
  cantidad: number;
};

const productos: Producto[] = [
  {
    id: 1,
    nombre: "Pan Casero",
    descripcion: "Pan recién horneado, suave y delicioso.",
    precio: 15,
    imagen:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
    estrellas: "★★★★★",
  },
  {
    id: 2,
    nombre: "Semita",
    descripcion: "Deliciosa semita tradicional.",
    precio: 20,
    imagen:
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600",
    estrellas: "★★★★★",
  },
  {
    id: 3,
    nombre: "Rosquillas",
    descripcion: "Rosquillas caseras crujientes y deliciosas.",
    precio: 25,
    imagen:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600",
    estrellas: "★★★★☆",
  },
];

export default function Inicio() {
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  // AGREGAR PRODUCTO
  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((carritoActual) => {
      const existe = carritoActual.find(
        (item) => item.id === producto.id
      );

      if (existe) {
        return carritoActual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...carritoActual, { ...producto, cantidad: 1 }];
    });
  };

  // AUMENTAR CANTIDAD
  const aumentarCantidad = (id: number) => {
    setCarrito((carritoActual) =>
      carritoActual.map((item) =>
        item.id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

  // DISMINUIR CANTIDAD
  const disminuirCantidad = (id: number) => {
    setCarrito((carritoActual) =>
      carritoActual
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  // ELIMINAR PRODUCTO
  const eliminarProducto = (id: number) => {
    setCarrito((carritoActual) =>
      carritoActual.filter((item) => item.id !== id)
    );
  };

  // CANTIDAD TOTAL
  const cantidadTotal = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  // TOTAL DE LA COMPRA
  const totalCompra = carrito.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  // FILTRAR PRODUCTOS
  const productosFiltrados = productos.filter((producto) =>
    producto.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>🥖 El Rincón</Text>
            <Text style={styles.logoSub}>del Pan</Text>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => setMostrarCarrito(true)}
          >
            <Text style={styles.cartIcon}>🛒</Text>

            {cantidadTotal > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cantidadTotal}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* BIENVENIDA */}
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>
            ¡Bienvenido a El Rincón del Pan! 👋
          </Text>

          <Text style={styles.welcomeText}>
            El sabor de lo hecho en casa, directamente hasta tu hogar.
          </Text>
        </View>

        {/* BUSCADOR */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔎</Text>

          <TextInput
            placeholder="Buscar productos..."
            placeholderTextColor="#999"
            value={busqueda}
            onChangeText={setBusqueda}
            style={styles.searchInput}
          />
        </View>

        {/* CATEGORÍAS */}
        <Text style={styles.sectionTitle}>Categorías</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
        >
          <TouchableOpacity style={styles.categoryActive}>
            <Text style={styles.categoryTextActive}>
              🥖 Pan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.category}>
            <Text style={styles.categoryText}>
              🥐 Repostería
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.category}>
            <Text style={styles.categoryText}>
              🍪 Galletas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.category}>
            <Text style={styles.categoryText}>
              🎂 Pasteles
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* PRODUCTOS */}
        <View style={styles.productsHeader}>
          <Text style={styles.sectionTitle}>
            Nuestros productos
          </Text>

          <TouchableOpacity>
            <Text style={styles.viewAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {productosFiltrados.map((producto) => (
          <View style={styles.productCard} key={producto.id}>
            <Image
              source={{ uri: producto.imagen }}
              style={styles.productImage}
            />

            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {producto.nombre}
              </Text>

              <Text style={styles.stars}>
                {producto.estrellas}
              </Text>

              <Text style={styles.productDescription}>
                {producto.descripcion}
              </Text>

              <View style={styles.productBottom}>
                <Text style={styles.price}>
                  L. {producto.precio.toFixed(2)}
                </Text>

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => agregarAlCarrito(producto)}
                >
                  <Text style={styles.addButtonText}>
                    + Agregar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}

        {/* MISIÓN Y VISIÓN */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>
            🏠 Sobre nosotros
          </Text>

          <Text style={styles.infoSubtitle}>
            Nuestra misión
          </Text>

          <Text style={styles.infoText}>
            Ofrecer productos de panadería frescos y de calidad,
            elaborados con dedicación y sabor casero, brindando
            un excelente servicio a nuestros clientes.
          </Text>

          <Text style={styles.infoSubtitle}>
            Nuestra visión
          </Text>

          <Text style={styles.infoText}>
            Ser una microempresa reconocida por la calidad de
            nuestros productos, el buen servicio y la confianza
            de nuestros clientes.
          </Text>
        </View>

        {/* CONTACTO */}
        <View style={styles.contact}>
          <Text style={styles.contactTitle}>
            📞 Contáctanos
          </Text>

          <Text style={styles.phone}>
            +504 XXXX-XXXX
          </Text>

          <Text style={styles.contactText}>
            Estamos para servirte.
          </Text>
        </View>

        {/* PIE DE PÁGINA */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            🥖 El Rincón del Pan
          </Text>

          <Text style={styles.footerText}>
            © 2026 Todos los derechos reservados
          </Text>
        </View>
      </ScrollView>

      {/* ========================= */}
      {/* VENTANA DEL CARRITO */}
      {/* ========================= */}

      <Modal
        visible={mostrarCarrito}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setMostrarCarrito(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.cartModal}>
            
            {/* ENCABEZADO DEL CARRITO */}
            <View style={styles.cartHeader}>
              <Text style={styles.cartTitle}>
                🛒 Mi carrito
              </Text>

              <TouchableOpacity
                onPress={() => setMostrarCarrito(false)}
              >
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {carrito.length === 0 ? (
              <View style={styles.emptyCart}>
                <Text style={styles.emptyCartIcon}>
                  🛒
                </Text>

                <Text style={styles.emptyCartTitle}>
                  Tu carrito está vacío
                </Text>

                <Text style={styles.emptyCartText}>
                  Agrega algunos productos deliciosos.
                </Text>
              </View>
            ) : (
              <>
                <ScrollView
                  style={styles.cartItems}
                  showsVerticalScrollIndicator={false}
                >
                  {carrito.map((item) => (
                    <View
                      key={item.id}
                      style={styles.cartItem}
                    >
                      <Image
                        source={{ uri: item.imagen }}
                        style={styles.cartItemImage}
                      />

                      <View style={styles.cartItemInfo}>
                        <Text style={styles.cartItemName}>
                          {item.nombre}
                        </Text>

                        <Text style={styles.cartItemPrice}>
                          L. {item.precio.toFixed(2)}
                        </Text>

                        <View style={styles.quantityRow}>
                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              disminuirCantidad(item.id)
                            }
                          >
                            <Text style={styles.quantityText}>
                              −
                            </Text>
                          </TouchableOpacity>

                          <Text style={styles.quantity}>
                            {item.cantidad}
                          </Text>

                          <TouchableOpacity
                            style={styles.quantityButton}
                            onPress={() =>
                              aumentarCantidad(item.id)
                            }
                          >
                            <Text style={styles.quantityText}>
                              +
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={() =>
                              eliminarProducto(item.id)
                            }
                          >
                            <Text style={styles.deleteText}>
                              🗑️
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text style={styles.itemSubtotal}>
                        L.{" "}
                        {(item.precio * item.cantidad).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </ScrollView>

                {/* TOTAL */}
                <View style={styles.totalSection}>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      Subtotal
                    </Text>

                    <Text style={styles.totalValue}>
                      L. {totalCompra.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      Envío
                    </Text>

                    <Text style={styles.totalValue}>
                      Se calculará
                    </Text>
                  </View>

                  <View style={styles.separator} />

                  <View style={styles.totalRow}>
                    <Text style={styles.grandTotalLabel}>
                      TOTAL
                    </Text>

                    <Text style={styles.grandTotal}>
                      L. {totalCompra.toFixed(2)}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.checkoutButton}
                    onPress={() => {
                      setMostrarCarrito(false);
                    }}
                  >
                    <Text style={styles.checkoutText}>
                      Continuar con la compra
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },

  container: {
    flex: 1,
    backgroundColor: "#FFF8F0",
  },

  header: {
    backgroundColor: "#8B4513",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logo: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
  },

  logoSub: {
    color: "#FFE4C4",
    fontSize: 17,
    marginLeft: 35,
  },

  cartButton: {
    backgroundColor: "#FFFFFF",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  cartIcon: {
    fontSize: 24,
  },

  cartBadge: {
    position: "absolute",
    right: -3,
    top: -5,
    backgroundColor: "#D32F2F",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },

  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  welcome: {
    backgroundColor: "#F4D7B5",
    padding: 20,
  },

  welcomeTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#5A2E14",
  },

  welcomeText: {
    fontSize: 14,
    color: "#704214",
    marginTop: 7,
    lineHeight: 20,
  },

  searchBox: {
    backgroundColor: "#FFFFFF",
    margin: 18,
    borderRadius: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E5D5C5",
  },

  searchIcon: {
    fontSize: 18,
  },

  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#3B2415",
  },

  categories: {
    paddingLeft: 18,
    marginTop: 12,
    marginBottom: 20,
  },

  category: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E5D5C5",
  },

  categoryActive: {
    backgroundColor: "#8B4513",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 20,
    marginRight: 10,
  },

  categoryText: {
    color: "#5A2E14",
  },

  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  productsHeader: {
    marginHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  viewAll: {
    color: "#8B4513",
    fontWeight: "bold",
  },

  productCard: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 18,
    marginTop: 15,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 3,
  },

  productImage: {
    width: "100%",
    height: 180,
  },

  productInfo: {
    padding: 15,
  },

  productName: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#3B2415",
  },

  stars: {
    color: "#D99000",
    marginTop: 4,
    fontSize: 15,
  },

  productDescription: {
    color: "#777777",
    marginTop: 7,
    lineHeight: 19,
  },

  productBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },

  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#8B4513",
  },

  addButton: {
    backgroundColor: "#8B4513",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },

  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  infoSection: {
    backgroundColor: "#FFFFFF",
    margin: 18,
    padding: 20,
    borderRadius: 16,
  },

  infoTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#3B2415",
    marginBottom: 15,
  },

  infoSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#8B4513",
    marginTop: 10,
  },

  infoText: {
    fontSize: 14,
    color: "#555555",
    lineHeight: 21,
    marginTop: 5,
  },

  contact: {
    backgroundColor: "#8B4513",
    marginTop: 5,
    padding: 25,
    alignItems: "center",
  },

  contactTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },

  phone: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 10,
  },

  contactText: {
    color: "#FBE7D0",
    marginTop: 5,
  },

  footer: {
    backgroundColor: "#5A2E14",
    alignItems: "center",
    padding: 25,
  },

  footerTitle: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
  },

  footerText: {
    color: "#D9C2AD",
    fontSize: 11,
    marginTop: 8,
  },

  /* CARRITO */

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  cartModal: {
    backgroundColor: "#FFF8F0",
    height: "88%",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 20,
  },

  cartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5D5C5",
  },

  cartTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3B2415",
  },

  closeButton: {
    fontSize: 25,
    color: "#8B4513",
    fontWeight: "bold",
  },

  emptyCart: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  emptyCartIcon: {
    fontSize: 60,
  },

  emptyCartTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#3B2415",
    marginTop: 15,
  },

  emptyCartText: {
    color: "#777",
    marginTop: 8,
  },

  cartItems: {
    paddingHorizontal: 15,
  },

  cartItem: {
    backgroundColor: "#FFFFFF",
    marginTop: 12,
    borderRadius: 14,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
  },

  cartItemImage: {
    width: 75,
    height: 75,
    borderRadius: 10,
  },

  cartItemInfo: {
    flex: 1,
    marginLeft: 10,
  },

  cartItemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#3B2415",
  },

  cartItemPrice: {
    color: "#8B4513",
    marginTop: 3,
    fontWeight: "bold",
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F4D7B5",
    justifyContent: "center",
    alignItems: "center",
  },

  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
  },

  quantity: {
    fontSize: 16,
    fontWeight: "bold",
    marginHorizontal: 10,
    color: "#3B2415",
  },

  deleteButton: {
    marginLeft: 12,
  },

  deleteText: {
    fontSize: 18,
  },

  itemSubtotal: {
    fontWeight: "bold",
    color: "#8B4513",
    fontSize: 14,
  },

  totalSection: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 8,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  totalLabel: {
    color: "#666",
    fontSize: 15,
  },

  totalValue: {
    color: "#555",
    fontWeight: "bold",
  },

  separator: {
    height: 1,
    backgroundColor: "#E5D5C5",
    marginVertical: 8,
  },

  grandTotalLabel: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#3B2415",
  },

  grandTotal: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#8B4513",
  },

  checkoutButton: {
    backgroundColor: "#8B4513",
    marginTop: 15,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  checkoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
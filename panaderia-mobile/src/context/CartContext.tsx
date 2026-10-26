import React, { createContext, useContext, useState } from "react";

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  estrellas: string;
};

export type ProductoCarrito = Producto & {
  cantidad: number;
};

type CartContextType = {
  carrito: ProductoCarrito[];
  agregarAlCarrito: (producto: Producto) => void;
  aumentarCantidad: (id: number) => void;
  disminuirCantidad: (id: number) => void;
  eliminarDelCarrito: (id: number) => void;
  cantidadTotal: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [carrito, setCarrito] = useState<ProductoCarrito[]>([]);

  const agregarAlCarrito = (producto: Producto) => {
    setCarrito((actual) => {
      const existe = actual.find((item) => item.id === producto.id);

      if (existe) {
        return actual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }

      return [...actual, { ...producto, cantidad: 1 }];
    });
  };

  const aumentarCantidad = (id: number) => {
    setCarrito((actual) =>
      actual.map((item) =>
        item.id === id
          ? { ...item, cantidad: item.cantidad + 1 }
          : item
      )
    );
  };

  const disminuirCantidad = (id: number) => {
    setCarrito((actual) =>
      actual
        .map((item) =>
          item.id === id
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const eliminarDelCarrito = (id: number) => {
    setCarrito((actual) =>
      actual.filter((item) => item.id !== id)
    );
  };

  const cantidadTotal = carrito.reduce(
    (total, item) => total + item.cantidad,
    0
  );

  const subtotal = carrito.reduce(
    (total, item) => total + item.precio * item.cantidad,
    0
  );

  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        aumentarCantidad,
        disminuirCantidad,
        eliminarDelCarrito,
        cantidadTotal,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart debe utilizarse dentro de CartProvider"
    );
  }

  return context;
}
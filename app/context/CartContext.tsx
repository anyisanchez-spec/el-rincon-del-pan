import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  imagen_url?: string;
  cantidad: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (producto: any) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  envio: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const envio = 15.00; // Costo fijo de envío en Lempiras

  const addToCart = (producto: any) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === producto.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [
        ...prevCart,
        {
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          imagen_url: producto.imagen_url,
          cantidad: 1,
        },
      ];
    });
  };

  const removeFromCart = (id: number) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const total = subtotal > 0 ? subtotal + envio : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        envio,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useMemo } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]); // {product, qty}

  const addToCart = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) => (i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (productId, qty) => {
    setItems((prev) =>
      qty <= 0 ? prev.filter((i) => i.product.id !== productId) : prev.map((i) => (i.product.id === productId ? { ...i, qty } : i))
    );
  };

  const removeFromCart = (productId) => setItems((prev) => prev.filter((i) => i.product.id !== productId));

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.product.price * i.qty, 0), [items]);
  const serviceFee = items.length > 0 ? 2000 : 0;
  const total = subtotal + serviceFee;

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, removeFromCart, subtotal, serviceFee, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

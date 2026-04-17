import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nm_cart')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('nm_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, unit: product.unit, emoji: product.emoji, quantity }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(i => i.product_id === productId ? { ...i, quantity } : i));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQuantity, removeFromCart, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { products } from '../content.js';
import { validateOrder } from '../utils/catalog.js';
import { addItem, cartCount, removeItem, resolveCart, sanitizeLines, setQuantity } from '../utils/cartLogic.js';

const STORAGE_KEY = 'kttv-cart-v1';
const CartContext = createContext(null);

// localStorage can be missing/blocked (private mode, cleared data): the cart must still work in memory.
function readStored() {
  try { return sanitizeLines(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return []; }
}
function writeStored(lines) {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* ignore */ }
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState(readStored);
  const [notice, setNotice] = useState(null);

  useEffect(() => { writeStored(lines); }, [lines]);
  useEffect(() => {
    const sync = (e) => { if (e.key === STORAGE_KEY) setLines(readStored()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const resolved = useMemo(() => resolveCart(lines, products), [lines]);

  const addToCart = useCallback((product, { size = '', colour = '', quantity = 1 } = {}) => {
    const check = validateOrder(product, { size, colour, quantity });
    if (!check.ok) return check;
    setLines((current) => addItem(current, { slug: product.slug, size, colour, quantity: Number(quantity) }));
    setNotice({ id: Date.now(), product, size, colour, quantity: Number(quantity) });
    return check;
  }, []);

  const value = useMemo(() => ({
    lines, resolved, count: cartCount(resolved.items.map((i) => ({ quantity: i.quantity }))), notice,
    addToCart,
    updateQuantity: (key, quantity) => setLines((c) => setQuantity(c, key, quantity)),
    removeLine: (key) => setLines((c) => removeItem(c, key)),
    clearCart: () => setLines([]),
    dismissNotice: () => setNotice(null)
  }), [lines, resolved, notice, addToCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>.');
  return ctx;
}

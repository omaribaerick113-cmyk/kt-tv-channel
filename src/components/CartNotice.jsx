import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import SmartImage from './SmartImage.jsx';

/** "Product was successfully added to your cart!" with Continue / View Cart (same flow as the reference shop). */
export default function CartNotice() {
  const { notice, dismissNotice } = useCart();
  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(dismissNotice, 10000);
    return () => clearTimeout(t);
  }, [notice, dismissNotice]);
  if (!notice) return null;
  const { product, size, colour, quantity } = notice;
  const options = [size && `Size ${size}`, colour].filter(Boolean).join(' · ');
  return (
    <div className="cart-notice" role="status" aria-live="polite">
      <button type="button" className="cart-notice-close" aria-label="Close" onClick={dismissNotice}><X size={18} aria-hidden="true" /></button>
      <p className="cart-notice-title"><Check size={18} aria-hidden="true" /> Product was successfully added to your cart!</p>
      <div className="cart-notice-item">
        <SmartImage src={product.images[0]?.src} alt={product.images[0]?.alt || product.name} width="56" height="70" label="" />
        <div><strong>{product.name}</strong><small>{[options, `Qty ${quantity}`].filter(Boolean).join(' · ')}</small></div>
      </div>
      <div className="cart-notice-actions">
        <button type="button" className="btn btn-outline" onClick={dismissNotice}>Continue</button>
        <Link className="btn btn-primary" to="/cart" onClick={dismissNotice}>View Cart</Link>
      </div>
    </div>
  );
}

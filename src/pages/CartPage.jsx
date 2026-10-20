import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { PageIntro, EmptyState } from '../components/common.jsx';
import SmartImage from '../components/SmartImage.jsx';
import QuantityInput from '../components/QuantityInput.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { cartOrderMessage } from '../utils/whatsapp.js';
import { formatKES } from '../utils/format.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function CartPage() {
  usePageMeta('Your cart', 'Review your KT TV cart and send your order on WhatsApp.');
  const { resolved, updateQuantity, removeLine, clearCart } = useCart();
  const [blocked, setBlocked] = useState('');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const { items } = resolved;

  if (!items.length) {
    return (
      <>
        <PageIntro eyebrow="YOUR CART" title="Your cart is empty" />
        <section className="container content-section">
          <EmptyState icon={ShoppingCart} title="Nothing here yet" text="Browse the collection, choose your size and colour, and add your favourites."><Link className="btn btn-primary" to="/shop">Continue shopping</Link></EmptyState>
        </section>
      </>
    );
  }

  const blockedReason = resolved.hasProblems ? 'Some items are no longer available. Please remove them to continue.' : '';
  const message = blockedReason ? '' : cartOrderMessage(resolved, { origin });

  return (
    <>
      <PageIntro eyebrow="YOUR CART" title="Review your order" text="Check your items, then send the whole order to KT TV on WhatsApp. We’ll confirm availability, delivery charges and payment before anything is charged." />
      <section className="container content-section cart-layout">
        <ul className="cart-list" aria-label="Cart items">
          {items.map((item) => {
            const { product } = item; const image = product.images[0];
            const options = [item.size && `Size: ${item.size}`, item.colour && `Colour: ${item.colour}`].filter(Boolean).join(' · ');
            return (
              <li key={item.key} className={`cart-item ${item.problem ? 'has-problem' : ''}`}>
                <Link to={`/shop/${product.slug}`} className="cart-thumb" tabIndex={-1} aria-hidden="true"><SmartImage src={image?.src} alt="" width="96" height="120" label="" /></Link>
                <div className="cart-info">
                  <h2><Link to={`/shop/${product.slug}`}>{product.name}</Link></h2>
                  {options ? <p className="muted">{options}</p> : null}
                  <p className="muted">{formatKES(item.unitPrice)} each</p>
                  {item.problem ? <p className="field-error" role="alert">{item.problem}</p> : null}
                  <div className="cart-controls">
                    <QuantityInput compact id={`q-${item.key}`} value={String(item.quantity)} onChange={(v) => { const n = Number(v); if (Number.isFinite(n) && n >= 1) updateQuantity(item.key, n); }} />
                    <button type="button" className="link-button danger" onClick={() => removeLine(item.key)} aria-label={`Remove ${product.name} from cart`}><Trash2 size={15} aria-hidden="true" /> Remove</button>
                  </div>
                </div>
                <p className="cart-line-total">{formatKES(item.lineTotal)}</p>
              </li>
            );
          })}
        </ul>
        <aside className="cart-summary" aria-label="Order summary">
          <h2>Order summary</h2>
          <dl>
            <div><dt>Items ({resolved.count})</dt><dd>{formatKES(resolved.subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>Confirmed on WhatsApp</dd></div>
          </dl>
          <p className="cart-total"><span>Items total</span><strong>{formatKES(resolved.subtotal)}</strong></p>
          <WhatsAppButton className="btn-block btn-lg" label="ORDER CART VIA WHATSAPP" message={message} blockedReason={blockedReason} onBlocked={setBlocked} onSent={() => setBlocked('')} />
          {blocked ? <p className="field-error" role="alert">{blocked}</p> : null}
          <p className="help">This opens WhatsApp with every item, option and quantity pre-filled. No payment is taken on this site.</p>
          <div className="cart-footer-links"><Link to="/shop" className="text-link">Continue shopping</Link><button type="button" className="link-button danger" onClick={clearCart}>Clear cart</button></div>
        </aside>
      </section>
    </>
  );
}

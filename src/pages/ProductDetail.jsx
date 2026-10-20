import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShoppingCart, Truck, RotateCcw } from 'lucide-react';
import { products, settings } from '../content.js';
import { EmptyState, DemoBadge, PriceTag, ProductLabels } from '../components/common.jsx';
import SmartImage from '../components/SmartImage.jsx';
import OptionPicker from '../components/OptionPicker.jsx';
import QuantityInput from '../components/QuantityInput.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import ProductCard from '../components/ProductCard.jsx';
import RichText from '../components/RichText.jsx';
import { useCart } from '../context/CartContext.jsx';
import { STOCK, STOCK_LABELS, isOptionAvailable, productStock, relatedProducts, stockFor, validateOrder } from '../utils/catalog.js';
import { productOrderMessage } from '../utils/whatsapp.js';
import { formatKES } from '../utils/format.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

function Gallery({ images, name }) {
  const [index, setIndex] = useState(0);
  const list = images.length ? images : [{ src: '', alt: name }];
  const current = list[Math.min(index, list.length - 1)];
  const go = (d) => setIndex((i) => (i + d + list.length) % list.length);
  return (
    <div className="gallery">
      <div className="gallery-main">
        <SmartImage src={current.src} alt={current.alt || name} width="800" height="1000" eager />
        {list.length > 1 ? (
          <>
            <button type="button" className="gallery-nav prev" aria-label="Previous image" onClick={() => go(-1)}><ChevronLeft size={22} aria-hidden="true" /></button>
            <button type="button" className="gallery-nav next" aria-label="Next image" onClick={() => go(1)}><ChevronRight size={22} aria-hidden="true" /></button>
          </>
        ) : null}
      </div>
      {list.length > 1 ? (
        <div className="gallery-thumbs">
          {list.map((img, i) => (
            <button key={img.src + i} type="button" className={i === index ? 'active' : ''} aria-label={`Show image ${i + 1} of ${list.length}`} aria-current={i === index} onClick={() => setIndex(i)}>
              <SmartImage src={img.src} alt="" width="120" height="150" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProductView({ product }) {
  const { addToCart } = useCart();
  const only = (list) => (list.length === 1 ? list[0] : '');
  const [size, setSize] = useState(only(product.sizes));
  const [colour, setColour] = useState(only(product.colours));
  const [qty, setQty] = useState('1');
  const [errors, setErrors] = useState({});
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  const check = validateOrder(product, { size, colour, quantity: qty });
  const overall = productStock(product);
  const selectionComplete = (!product.sizes.length || size) && (!product.colours.length || colour);
  const current = selectionComplete ? stockFor(product, { size, colour }) : overall;
  const soldOut = overall === STOCK.OUT;
  const qtyNumber = Number(qty);
  const total = Number.isInteger(qtyNumber) && qtyNumber >= 1 ? product.price * qtyNumber : null;
  const message = check.ok ? productOrderMessage(product, { size, colour, quantity: qty, origin }) : '';
  const blockedReason = check.ok ? '' : Object.values(check.errors)[0];

  const pick = (setter) => (value) => { setter(value); setErrors({}); };
  const add = () => { const res = addToCart(product, { size, colour, quantity: qty }); setErrors(res.ok ? {} : res.errors); };

  return (
    <>
      <nav className="breadcrumb container" aria-label="Breadcrumb">
        <Link to="/shop">Shop</Link><span aria-hidden="true">/</span>
        {product.collection ? <><Link to={`/shop?collection=${product.collection}`}>{product.collection}</Link><span aria-hidden="true">/</span></> : null}
        <span aria-current="page">{product.name}</span>
      </nav>
      <section className="container product-detail">
        <Gallery images={product.images} name={product.name} />
        <div className="product-summary">
          <div className="badge-row inline">{product.demo ? <DemoBadge>Sample product</DemoBadge> : null}<ProductLabels product={product} /><span className="eyebrow">{[product.collection, product.category].filter(Boolean).join(' · ')}</span></div>
          <h1>{product.name}</h1>
          <PriceTag product={product} className="detail-price" />
          <p className={`stock-line stock-${current}`}>{soldOut ? 'Out of stock' : STOCK_LABELS[current]}{selectionComplete && !soldOut && current === STOCK.LIMITED ? ' — only a few left' : ''}</p>
          {product.description ? <p className="detail-lead">{product.description}</p> : null}

          {product.sizes.length > 0 ? (
            <OptionPicker idPrefix={product.slug} kind="size" label="Size" options={product.sizes} value={size} onChange={pick(setSize)} error={errors.size}
              isAvailable={(s) => isOptionAvailable(product, 'size', s, { colour })} />
          ) : null}
          {product.colours.length > 0 ? (
            <OptionPicker idPrefix={product.slug} kind="colour" label="Colour" options={product.colours} value={colour} onChange={pick(setColour)} error={errors.colour}
              isAvailable={(c) => isOptionAvailable(product, 'colour', c, { size })} />
          ) : null}
          {product.variants.length > 0 ? <p className="help">Crossed-out options are unavailable{size || colour ? ' for your current selection' : ''}.</p> : null}

          <div className="qty-row">
            <label htmlFor="qty" className="qty-label">Quantity</label>
            <QuantityInput id="qty" value={qty} onChange={pick(setQty)} />
            {total !== null ? <p className="line-total">Total: <strong>{formatKES(total)}</strong></p> : null}
          </div>
          {errors.quantity ? <p className="field-error" role="alert">{errors.quantity}</p> : null}
          {errors.stock ? <p className="field-error" role="alert">{errors.stock}</p> : null}

          <div className="purchase-actions">
            {soldOut ? (
              <button type="button" className="btn btn-primary btn-lg" disabled>OUT OF STOCK</button>
            ) : (
              <>
                <button type="button" className="btn btn-primary btn-lg" onClick={add}><ShoppingCart size={18} aria-hidden="true" /> ADD TO CART</button>
                <WhatsAppButton className="btn-lg" message={message} blockedReason={blockedReason} onBlocked={() => setErrors(check.errors)} />
              </>
            )}
          </div>
          <p className="help">Order via WhatsApp sends this product only. Your message includes a link to the product photo — you can also attach a picture in WhatsApp yourself. Nothing is charged until we confirm with you.</p>

          <div className="info-blocks">
            {product.body ? <details open><summary>Product details</summary><RichText text={product.body} className="prose" /></details> : null}
            <details><summary><Truck size={16} aria-hidden="true" /> Delivery</summary><p>{settings.delivery_info}</p></details>
            <details><summary><RotateCcw size={16} aria-hidden="true" /> Returns &amp; exchanges</summary><p>{settings.returns_info}</p></details>
            {product.sku ? <p className="sku">Product ID: {product.sku}</p> : null}
          </div>
        </div>
      </section>
      <Related product={product} />
    </>
  );
}

function Related({ product }) {
  const related = relatedProducts(products, product, 4);
  if (!related.length) return null;
  return (
    <section className="section container" aria-labelledby="related-title">
      <div className="section-heading"><div><h2 id="related-title">You may also like</h2></div><Link className="text-link" to="/shop">Shop all</Link></div>
      <div className="product-grid">{related.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
    </section>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  usePageMeta(product ? product.name : 'Product not found', product?.description || 'KT TV merchandise');
  if (!product) {
    return (
      <section className="container content-section">
        <EmptyState title="We couldn’t find that product" text="It may have been unpublished or the link may be wrong."><Link className="btn btn-primary" to="/shop">Back to the shop</Link></EmptyState>
      </section>
    );
  }
  return <ProductView key={product.slug} product={product} />;
}

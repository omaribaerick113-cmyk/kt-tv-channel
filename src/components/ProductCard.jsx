import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import SmartImage from './SmartImage.jsx';
import { DemoBadge, PriceTag, ProductLabels } from './common.jsx';
import { useCart } from '../context/CartContext.jsx';
import { productStock, STOCK } from '../utils/catalog.js';

/** Image-first card (big photo, name, price). Products with sizes/colours go to the detail page to choose options. */
export default function ProductCard({ product, priority = false }) {
  const { addToCart } = useCart();
  const stock = productStock(product);
  const out = stock === STOCK.OUT;
  const needsOptions = product.sizes.length > 0 || product.colours.length > 0;
  const to = `/shop/${product.slug}`;
  const image = product.images[0];
  const meta = [product.sizes.length ? `${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}` : '', product.colours.length > 1 ? `${product.colours.length} colours` : product.colours[0] || ''].filter(Boolean).join(' · ');
  return (
    <article className="product-card">
      <Link to={to} className="product-media" aria-label={`View details: ${product.name}`} tabIndex={-1}>
        <SmartImage src={image?.src} alt={image?.alt || product.name} width="800" height="1000" eager={priority} />
        <span className="badge-row">
          {product.demo ? <DemoBadge /> : null}
          <ProductLabels product={product} />
          {out ? <span className="badge badge-out">Sold out</span> : stock === STOCK.LIMITED ? <span className="badge badge-limited">Limited</span> : null}
        </span>
      </Link>
      <div className="product-body">
        <h3 className="product-name"><Link to={to}>{product.name}</Link></h3>
        <PriceTag product={product} />
        {meta ? <p className="product-meta">{meta}</p> : null}
        {out ? (
          <Link className="btn btn-outline btn-block" to={to}>View Details</Link>
        ) : needsOptions ? (
          <Link className="btn btn-primary btn-block" to={to}>Select Options</Link>
        ) : (
          <button type="button" className="btn btn-primary btn-block" onClick={() => addToCart(product, { quantity: 1 })}><ShoppingCart size={16} aria-hidden="true" /> Add to Cart</button>
        )}
      </div>
    </article>
  );
}

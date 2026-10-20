import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Info, Instagram, Facebook, Youtube, Music2, MessageCircle } from 'lucide-react';
import { social, whatsappChatUrl } from '../content.js';
import { formatKES } from '../utils/format.js';

export function SectionHeading({ eyebrow, title, text, action, to }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2>{title}</h2>
        {text ? <p>{text}</p> : null}
      </div>
      {action ? <Link className="text-link" to={to}>{action}<ArrowUpRight size={16} aria-hidden="true" /></Link> : null}
    </div>
  );
}

export function PageIntro({ eyebrow, title, text }) {
  return (
    <section className="page-intro container">
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h1>{title}</h1>
      {text ? <p>{text}</p> : null}
    </section>
  );
}

export function EmptyState({ title, text, icon: Icon = Info, children }) {
  return (
    <div className="empty-state">
      <span><Icon size={28} aria-hidden="true" /></span>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
      {children}
    </div>
  );
}

/** Price the customer pays; with a sale price the regular price is shown crossed out. */
export function PriceTag({ product, className = 'product-price' }) {
  return (
    <p className={className}>
      {product.onSale ? <><span className="sr-only">Regular price </span><s className="price-was">{formatKES(product.regularPrice)}</s> <span className="sr-only">Sale price </span></> : null}
      <span className={product.onSale ? 'price-now' : undefined}>{formatKES(product.price)}</span>
    </p>
  );
}

/** NEW / SALE labels, driven by the CMS "New" and "Sale price" fields. */
export function ProductLabels({ product }) {
  return (
    <>
      {product.isNew ? <span className="badge badge-new">New</span> : null}
      {product.onSale ? <span className="badge badge-sale">Sale</span> : null}
    </>
  );
}

export const DemoBadge = ({ children = 'Sample' }) => <span className="badge badge-demo">{children}</span>;

const socialItems = [
  ['facebook', 'Facebook', Facebook], ['youtube', 'YouTube', Youtube], ['instagram', 'Instagram', Instagram], ['tiktok', 'TikTok', Music2],
  ['whatsapp', 'WhatsApp', MessageCircle], ['x', 'X', ArrowUpRight], ['telegram', 'Telegram', MessageCircle],
  ['spotify', 'Spotify', Music2], ['audiomack', 'Audiomack', Music2], ['soundcloud', 'SoundCloud', Music2]
];
/** Social links from the CMS. The WhatsApp link always comes from the one whatsapp_number setting. */
export const socialLinkList = socialItems
  .map(([key, label, Icon]) => [key, label, Icon, key === 'whatsapp' ? whatsappChatUrl : (typeof social[key] === 'string' ? social[key].trim() : '')])
  .filter(([, , , url]) => url);

export function SocialLinks({ compact = false }) {
  return (
    <div className={`social-links ${compact ? 'compact' : ''}`}>
      {socialLinkList.map(([key, label, Icon, url]) => (
        <a key={key} href={url} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
          <Icon size={18} aria-hidden="true" />{compact ? null : <span>{label}</span>}
        </a>
      ))}
    </div>
  );
}

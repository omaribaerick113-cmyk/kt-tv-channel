import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import { settings, whatsappChatUrl } from '../content.js';
import { SocialLinks } from './common.jsx';
import { COLLECTIONS } from '../utils/catalog.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <Link className="brand footer-brand" to="/" aria-label="KT TV home"><img className="brand-logo" src="/images/kt-tv-logo-small.png" alt="KT TV" width="360" height="204" /></Link>
          <p className="muted">Culture, creativity and entertainment inspired by modern Kenyan expression.</p>
          <SocialLinks compact />
        </div>
        <nav aria-label="Shop links">
          <h4>Shop</h4>
          <Link to="/shop">All products</Link>
          {COLLECTIONS.map((c) => <Link key={c} to={`/shop?collection=${c}`}>{c}</Link>)}
          <Link to="/cart">Cart</Link>
        </nav>
        <nav aria-label="Explore links">
          <h4>Explore</h4>
          <Link to="/events">Events</Link><Link to="/tickets">Tickets</Link><Link to="/videos">Shows &amp; videos</Link><Link to="/music">Music</Link><Link to="/social-media">Social media</Link>
        </nav>
        <nav aria-label="Information links">
          <h4>Information</h4>
          <Link to="/about">About KT TV</Link><Link to="/contact">Contact</Link><Link to="/privacy-policy">Privacy policy</Link><Link to="/terms-and-conditions">Terms &amp; conditions</Link><a href="/admin/">CMS login ↗</a>
        </nav>
        <div>
          <h4>Get in touch</h4>
          {settings.email ? <a className="footer-contact" href={`mailto:${settings.email}`}><Mail size={15} aria-hidden="true" /> {settings.email}</a> : null}
          {whatsappChatUrl ? <a className="footer-contact" href={whatsappChatUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} aria-hidden="true" /> WhatsApp enquiries</a> : null}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} KT TV — Kenyan Trapper.</span>
        <span>Orders and ticket enquiries are confirmed with you on WhatsApp. No online payments are taken on this site.</span>
      </div>
    </footer>
  );
}

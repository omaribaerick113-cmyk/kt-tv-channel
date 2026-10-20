import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, ShoppingCart, ChevronDown, ChevronRight, Home as HomeIcon, ShoppingBag, CalendarDays, PlayCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { COLLECTIONS } from '../utils/catalog.js';
import { SocialLinks, socialLinkList } from './common.jsx';

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop', menu: true },
  { to: '/events', label: 'Events' },
  { to: '/videos', label: 'Shows' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' }
];

export function SearchForm({ onDone, autoFocus = false, id = 'site-search', initial = '' }) {
  const navigate = useNavigate();
  const [q, setQ] = useState(initial);
  const ref = useRef(null);
  useEffect(() => { if (autoFocus) ref.current?.focus(); }, [autoFocus]);
  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
    onDone?.();
  };
  return (
    <form className="search-form" role="search" onSubmit={submit}>
      <label htmlFor={id} className="sr-only">Search products, events and shows</label>
      <Search size={18} aria-hidden="true" />
      <input ref={ref} id={id} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, events, shows…" autoComplete="off" />
      <button type="submit" className="btn btn-primary">Search</button>
    </form>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const { count } = useCart();
  useEffect(() => { setOpen(false); setSearchOpen(false); }, [location.pathname, location.search]);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') { setSearchOpen(false); setOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" to="/" aria-label="KT TV home">
            <img className="brand-logo" src="/images/kt-tv-logo-small.png" alt="KT TV" width="360" height="204" />
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {links.map((item) => item.menu ? (
              <div className="nav-dropdown" key={item.to}>
                <NavLink to={item.to}>{item.label}<ChevronDown size={14} aria-hidden="true" /></NavLink>
                <div className="dropdown-panel">
                  <Link to="/shop">All products</Link>
                  {COLLECTIONS.map((c) => <Link key={c} to={`/shop?collection=${c}`}>{c}</Link>)}
                </div>
              </div>
            ) : (
              <React.Fragment key={item.to}>
                <NavLink to={item.to} end={item.end}>{item.label}</NavLink>
                {item.to === '/videos' && socialLinkList.length ? <div className="nav-social"><SocialLinks compact /></div> : null}
              </React.Fragment>
            ))}
          </nav>
          <div className="header-tools">
            <button type="button" className="icon-button" aria-label="Search" aria-expanded={searchOpen} onClick={() => { setSearchOpen(!searchOpen); setOpen(false); }}>
              {searchOpen ? <X size={20} aria-hidden="true" /> : <Search size={20} aria-hidden="true" />}
            </button>
            <Link className="icon-button cart-link" to="/cart" aria-label={`Cart, ${count} ${count === 1 ? 'item' : 'items'}`}>
              <ShoppingCart size={20} aria-hidden="true" />
              {count > 0 ? <span className="cart-count" aria-hidden="true">{count > 99 ? '99+' : count}</span> : null}
            </Link>
            <button type="button" className="icon-button menu-toggle" aria-label={open ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={open} onClick={() => { setOpen(!open); setSearchOpen(false); }}>
              {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
        {searchOpen ? <div className="search-panel"><div className="container"><SearchForm autoFocus onDone={() => setSearchOpen(false)} /></div></div> : null}
        {open ? (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {links.map((item) => (
              <React.Fragment key={item.to}>
                <NavLink to={item.to} end={item.end}>{item.label}<ChevronRight size={16} aria-hidden="true" /></NavLink>
                {item.menu ? COLLECTIONS.map((c) => <Link key={c} className="sub" to={`/shop?collection=${c}`}>{c}<ChevronRight size={16} aria-hidden="true" /></Link>) : null}
                {item.to === '/videos' && socialLinkList.length ? <div className="mobile-social"><SocialLinks compact /></div> : null}
              </React.Fragment>
            ))}
          </nav>
        ) : null}
      </header>
      <MobileQuickBar count={count} />
    </>
  );
}

function MobileQuickBar({ count }) {
  const items = [
    { to: '/', label: 'Home', icon: HomeIcon, end: true }, { to: '/shop', label: 'Shop', icon: ShoppingBag },
    { to: '/events', label: 'Events', icon: CalendarDays }, { to: '/videos', label: 'Shows', icon: PlayCircle }, { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: count }
  ];
  return (
    <nav className="mobile-quick" aria-label="Quick navigation">
      {items.map(({ to, label, icon: Icon, end, badge }) => (
        <NavLink key={to} to={to} end={end}>
          <span className="quick-icon"><Icon size={20} aria-hidden="true" />{badge > 0 ? <span className="cart-count" aria-hidden="true">{badge > 99 ? '99+' : badge}</span> : null}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

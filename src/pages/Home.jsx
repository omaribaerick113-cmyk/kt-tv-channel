import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, PlayCircle, ShoppingBag, MessageCircle, ShoppingCart, ListChecks, Youtube } from 'lucide-react';
import { products, events, videos, settings, social } from '../content.js';
import { SectionHeading, EmptyState, SocialLinks } from '../components/common.jsx';
import ProductCard from '../components/ProductCard.jsx';
import EventCard from '../components/EventCard.jsx';
import ShowCard from '../components/ShowCard.jsx';
import LiveReel from '../components/LiveReel.jsx';
import { sortProducts, buildFacets } from '../utils/catalog.js';
import { splitEvents } from '../utils/events.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

function Headline({ text }) {
  const parts = String(text).split(/(?<=[.!?])\s+/).filter(Boolean);
  if (parts.length < 2) return <>{text}</>;
  return <>{parts.slice(0, -1).join(' ')} <span className="accent">{parts[parts.length - 1]}</span></>;
}

export default function Home() {
  usePageMeta('', 'Shop KT TV streetwear, find upcoming events and watch exclusive shows. Order merch straight to WhatsApp.');
  const latest = useMemo(() => sortProducts(products, 'newest').slice(0, 8), []);
  const trending = useMemo(() => sortProducts(products.filter((p) => p.featured), 'newest').slice(0, 4), []);
  const upcoming = useMemo(() => splitEvents(events).upcoming.slice(0, 3), []);
  const shows = useMemo(() => [...videos].sort((a, b) => Number(b.featured === true) - Number(a.featured === true) || String(b.date || '').localeCompare(String(a.date || ''))).slice(0, 3), []);
  const facets = useMemo(() => buildFacets(products), []);
  const youtube = typeof social.youtube === 'string' ? social.youtube.trim() : '';

  return (
    <>
      <LiveReel />
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1><Headline text={settings.hero_headline} /></h1>
            <p>{settings.hero_description}</p>
            <div className="hero-actions">
              <Link to="/shop" className="btn btn-primary"><ShoppingBag size={18} aria-hidden="true" /> SHOP NOW</Link>
              <Link to="/events" className="btn btn-outline"><CalendarDays size={18} aria-hidden="true" /> EXPLORE EVENTS</Link>
            </div>
          </div>
          <img className="hero-logo" src="/images/kt-tv-logo.png" alt="" width="800" height="454" decoding="async" />
        </div>
      </section>

      <section className="section container" id="shop" aria-labelledby="shop-title">
        <SectionHeading title={<span id="shop-title">{settings.shop_title}</span>} text={settings.shop_text} action="View all products" to="/shop" />
        {facets.collections.length > 0 ? (
          <div className="collection-pills" aria-label="Shop by collection">
            {facets.collections.map((c) => <Link key={c} className="pill" to={`/shop?collection=${c}`}>{c}<ArrowUpRight size={14} aria-hidden="true" /></Link>)}
          </div>
        ) : null}
        {latest.length ? (
          <div className="product-grid">{latest.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 4} />)}</div>
        ) : (
          <EmptyState icon={ShoppingBag} title="New merch is dropping soon" text="Products published in the CMS appear here automatically after the next site build."><Link to="/contact" className="text-link">Ask about merch <ArrowUpRight size={16} aria-hidden="true" /></Link></EmptyState>
        )}
      </section>

      {trending.length > 0 ? (
        <section className="section section-alt">
          <div className="container">
            <SectionHeading eyebrow="FEATURED MERCH" title={settings.trending_title} action="Shop all" to="/shop" />
            <div className="product-grid">{trending.map((p) => <ProductCard key={p.slug} product={p} />)}</div>
          </div>
        </section>
      ) : null}

      <section className="section container" aria-labelledby="events-title">
        <SectionHeading title={<span id="events-title">{settings.events_title}</span>} action="All events" to="/events" />
        {upcoming.length
          ? <div className="event-grid">{upcoming.map((e) => <EventCard key={e.slug} event={e} />)}</div>
          : <EmptyState icon={CalendarDays} title={settings.events_empty_text} />}
      </section>

      <section className="section section-alt" aria-labelledby="shows-title">
        <div className="container">
          <SectionHeading title={<span id="shows-title">{settings.shows_title}</span>} action="All shows" to="/videos" />
          {shows.length
            ? <div className="show-grid">{shows.map((s) => <ShowCard key={s.slug} show={s} />)}</div>
            : <EmptyState icon={PlayCircle} title={settings.shows_empty_text} />}
          {youtube ? <p className="channel-cta"><a className="btn btn-outline" href={youtube} target="_blank" rel="noopener noreferrer"><Youtube size={18} aria-hidden="true" /> Visit the KT TV YouTube channel</a></p> : null}
        </div>
      </section>

      <section className="section container">
        <SectionHeading title={settings.story_title} text={settings.story_text} />
        <ol className="steps">
          <li><span className="step-icon"><ListChecks size={22} aria-hidden="true" /></span><strong>Choose your size &amp; colour</strong><p>Open a product, pick your options and add it to your cart.</p></li>
          <li><span className="step-icon"><ShoppingCart size={22} aria-hidden="true" /></span><strong>Review your cart</strong><p>Change quantities or remove items. No account needed.</p></li>
          <li><span className="step-icon"><MessageCircle size={22} aria-hidden="true" /></span><strong>Send your order on WhatsApp</strong><p>We reply to confirm availability, delivery charges and payment details.</p></li>
        </ol>
      </section>

      <section className="container">
        <div className="cta-band">
          <div><h2>Follow KT TV</h2><p>Stay close to the culture — new drops, events and shows land on our channels first.</p></div>
          <div className="cta-side"><SocialLinks compact /><Link to="/contact" className="btn btn-primary">Contact KT TV <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
        </div>
      </section>
    </>
  );
}

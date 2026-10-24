import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Play, ShoppingBag, CalendarDays, PlayCircle } from 'lucide-react';
import { products, events, videos } from '../content.js';
import { sortProducts } from '../utils/catalog.js';
import { splitEvents, parseEventDate } from '../utils/events.js';
import { formatDate, formatKES } from '../utils/format.js';
import { buildReelItems } from '../utils/reel.js';

const KIND_ICON = { Shop: ShoppingBag, Event: CalendarDays, Show: PlayCircle };

function ReelMedia({ item, active, onPlayYoutube }) {
  const videoRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const file = item.video?.type === 'file' ? item.video.src : '';

  // Direct video files play (muted) only while on screen; this saves data and battery.
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !file) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const saveData = navigator.connection?.saveData;
    if (reduce || saveData) return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio > 0.6), { threshold: [0, 0.6, 1] });
    io.observe(el);
    return () => io.disconnect();
  }, [file]);
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (visible) el.play?.().catch(() => {}); else el.pause?.();
  }, [visible]);

  if (active && item.video?.type === 'youtube') {
    return <iframe className="reel-embed" title={item.title} src={`https://www.youtube-nocookie.com/embed/${item.video.id}?autoplay=1&mute=1&rel=0&playsinline=1`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />;
  }
  if (file) {
    return <video ref={videoRef} className="reel-img" src={file} poster={item.image || undefined} muted loop playsInline preload="metadata" aria-label={item.title} />;
  }
  return item.image
    ? <img className="reel-img" src={item.image} alt={item.alt} loading="lazy" decoding="async" width="640" height="360" onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
    : <div className="reel-img reel-fallback" aria-hidden="true">KT TV</div>;
}

export default function LiveReel() {
  const items = useMemo(() => buildReelItems({
    products: [...sortProducts(products.filter((p) => p.featured), 'newest'), ...sortProducts(products.filter((p) => !p.featured), 'newest')],
    events: splitEvents(events).upcoming,
    shows: videos,
    formatPrice: formatKES,
    formatEventDate: (e) => { const d = parseEventDate(e.date); return d ? formatDate(d, { day: 'numeric', month: 'short' }) : ''; }
  }), []);
  const trackRef = useRef(null);
  const [paused, setPaused] = useState(false);
  const [playing, setPlaying] = useState('');
  const [edges, setEdges] = useState({ start: true, end: false });

  const step = useCallback((dir) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector('.reel-card');
    const amount = (card?.getBoundingClientRect().width || 280) + 12;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
    else el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }, []);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (el) setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
  }, []);
  useEffect(() => { updateEdges(); }, [items, updateEdges]);

  // Gentle auto-slide. It stops on hover, touch, keyboard focus, while a video plays, and for people who prefer reduced motion.
  useEffect(() => {
    if (paused || playing || items.length < 2) return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;
    const id = setInterval(() => step(1), 4500);
    return () => clearInterval(id);
  }, [paused, playing, items.length, step]);

  if (items.length === 0) return null;
  return (
    <section className="reel" aria-label="KT TV Live: shop, events and shows" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} onTouchStart={() => setPaused(true)}>
      <div className="container reel-head">
        <h2 className="reel-title"><span className="reel-dot" aria-hidden="true" /> KT TV LIVE <small>Shop · Events · Shows</small></h2>
        <div className="reel-arrows">
          <button type="button" className="reel-arrow" aria-label="Previous" onClick={() => step(-1)} disabled={edges.start}><ChevronLeft size={20} aria-hidden="true" /></button>
          <button type="button" className="reel-arrow" aria-label="Next" onClick={() => step(1)}><ChevronRight size={20} aria-hidden="true" /></button>
        </div>
      </div>
      <div className="reel-track" ref={trackRef} onScroll={updateEdges} tabIndex={-1}>
        {items.map((item) => {
          const Icon = KIND_ICON[item.kind] || ShoppingBag;
          const isYoutube = item.video?.type === 'youtube';
          return (
            <article className="reel-card" key={item.id}>
              <div className="reel-media">
                <ReelMedia item={item} active={playing === item.id} />
                {playing === item.id ? null : <Link to={item.to} className="reel-link" aria-label={`${item.kind}: ${item.title}`} />}
                <span className="reel-kind"><Icon size={12} aria-hidden="true" /> {item.kind}</span>
                {item.demo ? <span className="reel-demo">Sample</span> : null}
                {isYoutube && playing !== item.id ? (
                  <button type="button" className="reel-play" aria-label={`Play video: ${item.title}`} onClick={() => setPlaying(item.id)}><Play size={22} aria-hidden="true" /></button>
                ) : null}
                <div className="reel-caption"><strong>{item.title}</strong>{item.meta ? <span>{item.meta}</span> : null}</div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

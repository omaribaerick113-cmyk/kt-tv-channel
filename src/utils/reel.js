// Pure logic for the "KT TV Live" reel at the top of the home page (no React here, so it can be unit tested).
import { isValidHttpUrl, youtubeId, youtubeThumbnail, watchUrl } from './media.js';

const FILE_VIDEO = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;

/** Works out how a CMS "video_url" can be played. Returns null when there is no usable video. */
export function videoSource(url) {
  const value = typeof url === 'string' ? url.trim() : '';
  if (!value || !isValidHttpUrl(value)) return null;
  const id = youtubeId(value);
  if (id) return { type: 'youtube', id };
  if (FILE_VIDEO.test(value)) return { type: 'file', src: value };
  return null;
}

const first = (list, n) => list.slice(0, n);

/** Takes turns between groups so the reel mixes products, events and shows. */
export function interleave(...groups) {
  const out = [];
  const max = Math.max(0, ...groups.map((g) => g.length));
  for (let i = 0; i < max; i += 1) for (const g of groups) if (g[i]) out.push(g[i]);
  return out;
}

export function buildReelItems({ products = [], events = [], shows = [], formatPrice = String, formatEventDate = () => '', limit = 10 } = {}) {
  const productItems = first(products, 6).map((p) => ({
    id: `product-${p.slug}`, kind: 'Shop', title: p.name,
    meta: p.onSale ? `${formatPrice(p.price)} · Sale` : formatPrice(p.price),
    image: p.images?.[0]?.src || '', alt: p.images?.[0]?.alt || p.name,
    video: videoSource(p.video_url), to: `/shop/${p.slug}`, demo: p.demo === true
  }));
  const eventItems = first(events, 4).map((e) => ({
    id: `event-${e.slug}`, kind: 'Event', title: e.title,
    meta: [formatEventDate(e), e.venue].filter(Boolean).join(' · '),
    image: e.poster || '', alt: e.poster_alt || `${e.title} poster`,
    video: videoSource(e.video_url), to: `/events/${e.slug}`, demo: e.demo === true
  }));
  const showItems = first(shows, 3).map((s) => ({
    id: `show-${s.slug}`, kind: 'Show', title: s.title,
    meta: s.category || 'Show',
    image: s.thumbnail || youtubeThumbnail(s.youtube_url) || '', alt: s.title,
    video: videoSource(s.youtube_url) || (watchUrl(s) ? videoSource(s.watch_url) : null), to: '/videos', demo: s.demo === true
  }));
  return interleave(productItems, eventItems, showItems).slice(0, limit);
}

// Pure event helpers (dates, status, ticket options). No React / Vite APIs.
import { isValidHttpUrl } from './media.js';

/** 'YYYY-MM-DD' is read as a local calendar date (not UTC) so events don't flip a day early/late. */
export function parseEventDate(value) {
  if (!value) return null;
  const s = String(value).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const t = Date.parse(s);
  return Number.isNaN(t) ? null : new Date(t);
}

export function eventState(event) {
  if (event.status === 'cancelled' || event.availability_status === 'cancelled') return 'cancelled';
  if (event.status === 'completed') return 'completed';
  if (event.status === 'postponed') return 'postponed';
  return 'scheduled';
}

export function isUpcoming(event, now = new Date()) {
  const state = eventState(event);
  if (state === 'cancelled' || state === 'completed') return false;
  const d = parseEventDate(event.date);
  if (!d) return true; // date still to be confirmed
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return d >= today;
}

export function splitEvents(events, now = new Date()) {
  const time = (e) => parseEventDate(e.date)?.getTime() ?? Infinity;
  const upcoming = events.filter((e) => isUpcoming(e, now)).sort((a, b) => time(a) - time(b));
  const past = events.filter((e) => !isUpcoming(e, now)).sort((a, b) => time(b) - time(a));
  return { upcoming, past };
}

/** Ticket info is only reported when it was actually supplied in the CMS. */
export function ticketInfo(event) {
  const url = isValidHttpUrl(event.ticket_url) ? String(event.ticket_url).trim() : '';
  const categories = (Array.isArray(event.ticket_categories) ? event.ticket_categories : [])
    .map((c) => ({
      category: String(c?.category ?? '').trim(),
      price: c?.price === '' || c?.price === null || c?.price === undefined ? NaN : Number(c.price),
      availability: c?.availability || 'available'
    }))
    .filter((c) => c.category && Number.isFinite(c.price) && c.price >= 0);
  // A single "ticket price" (no categories) is treated as one ticket type, but only when a price was actually entered.
  const single = event.ticket_price;
  if (!categories.length && single !== '' && single !== null && single !== undefined && Number.isFinite(Number(single)) && Number(single) >= 0) {
    categories.push({ category: 'Standard ticket', price: Number(single), availability: 'available' });
  }
  const soldOut = event.availability_status === 'sold_out'
    || (categories.length > 0 && categories.every((c) => c.availability === 'sold_out'));
  const prices = categories.map((c) => c.price);
  return { url, categories, soldOut, fromPrice: prices.length ? Math.min(...prices) : null };
}

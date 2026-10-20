// Pure cart logic (no React, no browser APIs) so it is unit-testable.
// The cart stores only { slug, size, colour, quantity }. Names, prices, images and stock are always
// resolved from the current catalog, so CMS price/stock changes and removed products are handled safely.
import { MAX_QUANTITY, validateOrder } from './catalog.js';

export const lineKey = (slug, size = '', colour = '') => [slug, size, colour].join('|');
const clampQty = (n) => Math.min(MAX_QUANTITY, Math.max(1, Math.floor(Number(n) || 1)));

export function addItem(lines, { slug, size = '', colour = '', quantity = 1 }) {
  const key = lineKey(slug, size, colour);
  const existing = lines.find((l) => lineKey(l.slug, l.size, l.colour) === key);
  if (existing) return lines.map((l) => (l === existing ? { ...l, quantity: clampQty(l.quantity + quantity) } : l));
  return [...lines, { slug, size, colour, quantity: clampQty(quantity) }];
}
export function setQuantity(lines, key, quantity) {
  const n = Number(quantity);
  if (!Number.isFinite(n) || n < 1) return removeItem(lines, key);
  return lines.map((l) => (lineKey(l.slug, l.size, l.colour) === key ? { ...l, quantity: clampQty(n) } : l));
}
export const removeItem = (lines, key) => lines.filter((l) => lineKey(l.slug, l.size, l.colour) !== key);
export const cartCount = (lines) => lines.reduce((sum, l) => sum + l.quantity, 0);

/** Defensive parse of whatever was stored (localStorage can hold anything). */
export function sanitizeLines(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((l) => l && typeof l.slug === 'string' && l.slug)
    .map((l) => ({ slug: l.slug, size: String(l.size ?? ''), colour: String(l.colour ?? ''), quantity: clampQty(l.quantity) }));
}

/** Join lines with the live catalog. Unknown products are dropped; unavailable options are flagged via `problem`. */
export function resolveCart(lines, products) {
  const bySlug = new Map(products.map((p) => [p.slug, p]));
  const items = [];
  for (const l of lines) {
    const product = bySlug.get(l.slug);
    if (!product) continue;
    const check = validateOrder(product, { size: l.size, colour: l.colour, quantity: l.quantity });
    const problem = check.errors.size || check.errors.colour || check.errors.stock || check.errors.quantity || null;
    items.push({
      key: lineKey(l.slug, l.size, l.colour), product, size: l.size, colour: l.colour, quantity: l.quantity,
      unitPrice: product.price, lineTotal: product.price * l.quantity, problem
    });
  }
  return {
    items,
    count: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.filter((i) => !i.problem).reduce((s, i) => s + i.lineTotal, 0),
    hasProblems: items.some((i) => i.problem)
  };
}

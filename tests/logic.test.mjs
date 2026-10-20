import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProduct, validateOrder, stockFor, isOptionAvailable, filterProducts, sortProducts, matchesQuery, STOCK, relatedProducts } from '../src/utils/catalog.js';
import { productOrderMessage, cartOrderMessage, buildWhatsAppUrl, normalizeWhatsAppNumber, eventTicketMessage } from '../src/utils/whatsapp.js';
import { addItem, setQuantity, removeItem, resolveCart, sanitizeLines, lineKey } from '../src/utils/cartLogic.js';
import { ticketInfo, splitEvents, parseEventDate } from '../src/utils/events.js';
import { watchUrl } from '../src/utils/media.js';

const hoodie = normalizeProduct({
  name: 'KT TV Premium Hoodie', slug: 'premium-hoodie', sku: 'KTTV-HOOD-001', price: 4500, category: 'Hoodies', collection: 'Gents', demo: true,
  images: [{ image: '/uploads/demo/h.webp', alt: 'Hoodie' }], sizes: ['S', 'M', 'L'], colours: ['Black', 'Pink'],
  variants: [
    { size: 'S', colour: 'Black', stock: 'in_stock' }, { size: 'M', colour: 'Black', stock: 'limited' },
    { size: 'L', colour: 'Black', stock: 'out_of_stock' }, { size: 'S', colour: 'Pink', stock: 'out_of_stock' },
    { size: 'M', colour: 'Pink', stock: 'in_stock' }
  ]
});
const cap = normalizeProduct({ name: 'Cap', slug: 'cap', price: 1500, category: 'Accessories', stock: 'in_stock', collection: 'Unisex', description: 'Snapback' });
const tee = normalizeProduct({ name: 'Tee', slug: 'tee', price: 1800, category: 'T-shirts', sizes: ['M'], colours: ['White'], stock: 'out_of_stock', featured: true, date: '2026-10-01' });
const ORIGIN = 'https://kttv.example';

test('WhatsApp message contains the exact selected options, quantity and totals', () => {
  const msg = productOrderMessage(hoodie, { size: 'M', colour: 'Pink', quantity: 3, origin: ORIGIN });
  for (const line of ['Product: KT TV Premium Hoodie', 'Product ID: KTTV-HOOD-001', 'Size: M', 'Colour: Pink', 'Quantity: 3', 'Unit Price: KSh 4,500', 'Total: KSh 13,500',
    'Product Link: https://kttv.example/shop/premium-hoodie', 'Product Image: https://kttv.example/uploads/demo/h.webp']) assert.ok(msg.includes(line), line);
  assert.ok(msg.includes('DEMO/SAMPLE'));
});
test('each product produces its own message', () => {
  const a = productOrderMessage(cap, { quantity: 1, origin: ORIGIN });
  assert.ok(a.includes('Product: Cap') && !a.includes('Size:') && !a.includes('Hoodie'));
});
test('wa.me URL is correctly encoded and decodes back to the message', () => {
  const msg = productOrderMessage(hoodie, { size: 'S', colour: 'Black', quantity: 2, origin: ORIGIN });
  const url = buildWhatsAppUrl(msg, '+254 700-000 000');
  assert.ok(url.startsWith('https://wa.me/254700000000?text='));
  assert.ok(!/[\s\n]/.test(url.split('?text=')[1]));
  assert.equal(decodeURIComponent(url.split('?text=')[1]), msg);
  assert.ok(url.includes('%0A') && url.includes('KSh%204%2C500'));
});
test('missing/invalid WhatsApp number never produces a link', () => {
  for (const bad of ['', undefined, '0700000000', '12', 'abc']) { assert.equal(normalizeWhatsAppNumber(bad), ''); assert.throws(() => buildWhatsAppUrl('hi', bad), /not configured/); }
});
test('ordering without required options is rejected', () => {
  assert.throws(() => productOrderMessage(hoodie, { quantity: 1 }), /size/i);
  assert.throws(() => productOrderMessage(hoodie, { size: 'S', quantity: 1 }), /colour/i);
  assert.equal(validateOrder(hoodie, { size: 'S', colour: 'Black', quantity: 0 }).errors.quantity !== undefined, true);
  assert.equal(validateOrder(hoodie, { size: 'S', colour: 'Black', quantity: 100 }).ok, false);
});
test('variant stock is per size+colour and unavailable combos are blocked', () => {
  assert.equal(stockFor(hoodie, { size: 'L', colour: 'Black' }), STOCK.OUT);
  assert.equal(stockFor(hoodie, { size: 'M', colour: 'Black' }), STOCK.LIMITED);
  assert.equal(stockFor(hoodie, { size: 'L', colour: 'Pink' }), STOCK.OUT); // no such variant
  assert.equal(validateOrder(hoodie, { size: 'L', colour: 'Black', quantity: 1 }).ok, false);
  assert.equal(validateOrder(hoodie, { size: 'M', colour: 'Pink', quantity: 1 }).ok, true);
  assert.equal(isOptionAvailable(hoodie, 'size', 'L', { colour: 'Pink' }), false);
  assert.equal(isOptionAvailable(hoodie, 'size', 'L', { colour: 'Black' }), false);
  assert.equal(isOptionAvailable(hoodie, 'size', 'S', { colour: 'Black' }), true);
  assert.equal(isOptionAvailable(hoodie, 'colour', 'Pink', { size: 'S' }), false);
  assert.equal(validateOrder(tee, { size: 'M', colour: 'White', quantity: 1 }).ok, false);
});
test('search, collection, price, size/colour and stock filters work together', () => {
  const all = [hoodie, cap, tee];
  assert.deepEqual(filterProducts(all, { q: 'hood' }).map((p) => p.slug), ['premium-hoodie']);
  assert.deepEqual(filterProducts(all, { q: 'snapback' }).map((p) => p.slug), ['cap']);
  assert.deepEqual(filterProducts(all, { q: 'accessories' }).map((p) => p.slug), ['cap']);
  assert.deepEqual(filterProducts(all, { collection: 'Gents' }).map((p) => p.slug), ['premium-hoodie']);
  assert.deepEqual(filterProducts(all, { min: 1600, max: 5000 }).map((p) => p.slug).sort(), ['premium-hoodie', 'tee']);
  assert.deepEqual(filterProducts(all, { size: 'L', colour: 'Pink' }).map((p) => p.slug), []);
  assert.deepEqual(filterProducts(all, { size: 'L' }).map((p) => p.slug), ['premium-hoodie']);
  assert.deepEqual(filterProducts(all, { size: 'L', inStock: true }).map((p) => p.slug), []);
  assert.deepEqual(filterProducts(all, { inStock: true }).map((p) => p.slug).sort(), ['cap', 'premium-hoodie']);
  assert.deepEqual(filterProducts(all, { q: 'hoodie', category: 'T-shirts' }), []);
  assert.equal(matchesQuery(['Black Hoodie'], 'black   hood'), true);
});
test('sorting', () => {
  const all = [hoodie, cap, tee];
  assert.deepEqual(sortProducts(all, 'price-asc').map((p) => p.slug), ['cap', 'tee', 'premium-hoodie']);
  assert.deepEqual(sortProducts(all, 'price-desc').map((p) => p.slug), ['premium-hoodie', 'tee', 'cap']);
  assert.equal(sortProducts(all, 'featured')[0].slug, 'tee');
  assert.equal(sortProducts(all, 'newest')[0].slug, 'tee');
  assert.ok(!relatedProducts(all, hoodie).some((p) => p.slug === 'premium-hoodie'));
});
test('old image format (plain strings) still works', () => {
  assert.deepEqual(normalizeProduct({ name: 'X', images: ['/a.png'] }).images, [{ src: '/a.png', alt: 'X' }]);
});

test('cart: add merges identical lines, separate options stay separate, quantity capped', () => {
  let lines = addItem([], { slug: 'premium-hoodie', size: 'S', colour: 'Black', quantity: 1 });
  lines = addItem(lines, { slug: 'premium-hoodie', size: 'S', colour: 'Black', quantity: 2 });
  lines = addItem(lines, { slug: 'premium-hoodie', size: 'M', colour: 'Pink', quantity: 1 });
  assert.equal(lines.length, 2); assert.equal(lines[0].quantity, 3);
  assert.equal(addItem(lines, { slug: 'premium-hoodie', size: 'S', colour: 'Black', quantity: 500 })[0].quantity, 99);
  lines = setQuantity(lines, lineKey('premium-hoodie', 'M', 'Pink'), 4); assert.equal(lines[1].quantity, 4);
  assert.equal(setQuantity(lines, lineKey('premium-hoodie', 'M', 'Pink'), 0).length, 1);
  assert.equal(removeItem(lines, lineKey('premium-hoodie', 'S', 'Black')).length, 1);
  assert.deepEqual(sanitizeLines('junk'), []); assert.equal(sanitizeLines([{ slug: 'a', quantity: -4 }, null, { x: 1 }])[0].quantity, 1);
});
test('cart resolves live prices, drops removed products, flags unavailable lines', () => {
  const lines = [
    { slug: 'premium-hoodie', size: 'S', colour: 'Black', quantity: 2 },
    { slug: 'cap', size: '', colour: '', quantity: 1 },
    { slug: 'deleted-product', size: '', colour: '', quantity: 1 },
    { slug: 'premium-hoodie', size: 'L', colour: 'Black', quantity: 1 }
  ];
  const r = resolveCart(lines, [hoodie, cap, tee]);
  assert.equal(r.items.length, 3); assert.equal(r.hasProblems, true);
  assert.equal(r.subtotal, 4500 * 2 + 1500); assert.equal(r.count, 4);
  assert.throws(() => cartOrderMessage(r, { origin: ORIGIN }), /no longer available/);
  const ok = resolveCart(lines.slice(0, 2), [hoodie, cap]);
  const msg = cartOrderMessage(ok, { origin: ORIGIN });
  for (const part of ['1. KT TV Premium Hoodie', 'Size: S | Colour: Black', 'Qty: 2 x KSh 4,500 = KSh 9,000', '2. Cap', 'Qty: 1 x KSh 1,500 = KSh 1,500', 'Items total: KSh 10,500', 'https://kttv.example/shop/cap']) assert.ok(msg.includes(part), part);
  assert.throws(() => cartOrderMessage(resolveCart([], []), {}), /empty/);
});

test('events: only supplied ticket info is reported; upcoming/past split uses local dates', () => {
  assert.deepEqual(ticketInfo({ title: 'E' }), { url: '', categories: [], soldOut: false, fromPrice: null });
  assert.equal(ticketInfo({ ticket_url: 'javascript:alert(1)' }).url, '');
  assert.equal(ticketInfo({ ticket_url: 'https://tickets.example/e' }).url, 'https://tickets.example/e');
  const t = ticketInfo({ ticket_categories: [{ category: 'Regular', price: 1000 }, { category: 'VIP', price: 2500 }, { category: 'Bad', price: '' }] });
  assert.equal(t.fromPrice, 1000); assert.equal(t.categories.length, 2);
  const now = new Date(2026, 11, 12, 20, 0);
  const { upcoming, past } = splitEvents([{ title: 'today', date: '2026-12-12' }, { title: 'old', date: '2026-11-01' }, { title: 'cx', date: '2027-01-01', status: 'cancelled' }, { title: 'later', date: '2027-02-01' }, { title: 'tbc' }], now);
  assert.deepEqual(upcoming.map((e) => e.title), ['today', 'later', 'tbc']); assert.deepEqual(past.map((e) => e.title), ['cx', 'old']);
  assert.equal(parseEventDate('2026-12-12').getDate(), 12);
  const m = eventTicketMessage({ title: 'Live Night', slug: 'live-night', venue: 'Sample Venue', demo: true }, { category: 'VIP', price: 2500, quantity: 2, dateText: '12 Dec 2026', origin: ORIGIN });
  for (const part of ['Event: Live Night', 'Ticket category: VIP', 'Total: KSh 5,000', 'https://kttv.example/events/live-night', 'DEMO/SAMPLE', 'enquiry only']) assert.ok(m.includes(part), part);
});
test('watch links only exist for valid URLs', () => {
  assert.equal(watchUrl({}), ''); assert.equal(watchUrl({ youtube_url: 'not a url' }), '');
  assert.equal(watchUrl({ youtube_url: 'https://youtu.be/abc123' }), 'https://www.youtube.com/watch?v=abc123');
  assert.equal(watchUrl({ watch_url: 'https://example.com/show' }), 'https://example.com/show');
});

import { parseStock, availableQuantity } from '../src/utils/catalog.js';

test('sale price: customer pays the sale price, regular price kept for display; invalid sale prices ignored', () => {
  const p = normalizeProduct({ name: 'Tee', price: 2200, sale_price: 1900 });
  assert.equal(p.price, 1900); assert.equal(p.regularPrice, 2200); assert.equal(p.onSale, true);
  assert.equal(normalizeProduct({ name: 'Tee', price: 2200, sale_price: 2500 }).onSale, false);
  assert.equal(normalizeProduct({ name: 'Tee', price: 2200, sale_price: '' }).price, 2200);
  assert.equal(normalizeProduct({ name: 'Tee', price: 2200 }).onSale, false);
  assert.equal(normalizeProduct({ name: 'Tee', price: 2200, new: true }).isNew, true);
  const msg = productOrderMessage(p, { quantity: 2, origin: ORIGIN });
  assert.ok(msg.includes('Unit Price: KSh 1,900') && msg.includes('Total: KSh 3,800'));
  assert.deepEqual(filterProducts([p], { max: 2000 }).map((x) => x.slug), ['tee']); // filtered on the price actually paid
});

test('numeric stock: 0 sold out, 1-5 limited, more in stock; words still accepted', () => {
  assert.deepEqual(parseStock(0), { stock: 'out_of_stock', quantity: 0 });
  assert.deepEqual(parseStock(3), { stock: 'limited', quantity: 3 });
  assert.deepEqual(parseStock('5'), { stock: 'limited', quantity: 5 });
  assert.deepEqual(parseStock(6), { stock: 'in_stock', quantity: 6 });
  assert.deepEqual(parseStock('limited'), { stock: 'limited', quantity: null });
  assert.deepEqual(parseStock(undefined), { stock: 'in_stock', quantity: null });
  assert.deepEqual(parseStock(-2), { stock: 'in_stock', quantity: null });
});

test('customers cannot order more than the stock number; cart flags it too', () => {
  const p = normalizeProduct({ name: 'Hoodie', slug: 'h', price: 100, sizes: ['M'], colours: ['Black'], variants: [{ size: 'M', colour: 'Black', stock: 3 }, { size: 'L', colour: 'Black', stock: 0 }] });
  assert.equal(availableQuantity(p, { size: 'M', colour: 'Black' }), 3);
  assert.equal(validateOrder(p, { size: 'M', colour: 'Black', quantity: 3 }).ok, true);
  const over = validateOrder(p, { size: 'M', colour: 'Black', quantity: 4 });
  assert.equal(over.ok, false); assert.equal(over.errors.quantity, 'Only 3 are available.');
  assert.throws(() => productOrderMessage(p, { size: 'M', colour: 'Black', quantity: 4 }), /Only 3/);
  assert.equal(stockFor(p, { size: 'L', colour: 'Black' }), STOCK.OUT);
  const r = resolveCart([{ slug: 'h', size: 'M', colour: 'Black', quantity: 5 }], [p]);
  assert.equal(r.hasProblems, true); assert.match(r.items[0].problem, /Only 3/); assert.equal(r.subtotal, 0);
  assert.equal(availableQuantity(normalizeProduct({ name: 'x', stock: 2 }), {}), 2);
  assert.equal(availableQuantity(normalizeProduct({ name: 'x' }), {}), Infinity);
});

test('events: a single ticket_price works as one ticket type, and is only reported when entered', () => {
  const t = ticketInfo({ ticket_price: 500 });
  assert.equal(t.fromPrice, 500); assert.equal(t.categories[0].price, 500);
  assert.equal(ticketInfo({ ticket_price: 0 }).fromPrice, 0);
  assert.equal(ticketInfo({ ticket_price: '' }).fromPrice, null);
  assert.equal(ticketInfo({ ticket_price: null }).categories.length, 0);
  assert.equal(ticketInfo({ ticket_price: 500, ticket_categories: [{ category: 'VIP', price: 900 }] }).categories.length, 1);
});

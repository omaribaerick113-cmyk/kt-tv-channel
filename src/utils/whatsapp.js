// WhatsApp link + message builders. Pure functions: the business number is passed in by the caller
// (it lives in content/settings/general.yml → whatsapp_number, edited in the CMS under Site settings).
import { formatKES } from './format.js';
import { validateOrder } from './catalog.js';

export const DEMO_NOTE = 'Note: this is a DEMO/SAMPLE listing, not real stock.';

/** International digits only, no "+", spaces or dashes. Returns '' when the value cannot be a valid wa.me number. */
export function normalizeWhatsAppNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  // E.164 numbers are 8–15 digits and never start with 0 (a leading 0 means a local format without country code).
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : '';
}
export const isValidWhatsAppNumber = (value) => normalizeWhatsAppNumber(value) !== '';

export function buildWhatsAppUrl(message, number) {
  const digits = normalizeWhatsAppNumber(number);
  if (!digits) throw new Error('A valid WhatsApp number is not configured. Set whatsapp_number in content/settings/general.yml (international digits, e.g. 2547XXXXXXXX).');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/** Absolute URL for a site path or image; '' when no origin is known or the value is empty. */
export function absoluteUrl(origin, pathOrUrl) {
  if (!pathOrUrl) return '';
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  if (!origin) return '';
  return `${String(origin).replace(/\/+$/, '')}/${String(pathOrUrl).replace(/^\/+/, '')}`;
}

const productLink = (origin, product) => absoluteUrl(origin, `shop/${product.slug}`);
const imageLink = (origin, product) => absoluteUrl(origin, product.images?.[0]?.src);

/** One product, exactly the selections the customer made. Throws if the selection is incomplete or invalid. */
export function productOrderMessage(product, { size = '', colour = '', quantity = 1, origin = '' } = {}) {
  const check = validateOrder(product, { size, colour, quantity });
  if (!check.ok) throw new Error(Object.values(check.errors)[0]);
  const qty = Number(quantity);
  const link = productLink(origin, product); const image = imageLink(origin, product);
  return [
    'Hi KT TV! I would like to order the following product:',
    '',
    `Product: ${product.name}`,
    product.sku ? `Product ID: ${product.sku}` : null,
    product.sizes.length ? `Size: ${size}` : null,
    product.colours.length ? `Colour: ${colour}` : null,
    `Quantity: ${qty}`,
    `Unit Price: ${formatKES(product.price)}`,
    `Total: ${formatKES(product.price * qty)}`,
    link ? `Product Link: ${link}` : null,
    image ? `Product Image: ${image}` : null,
    product.demo ? DEMO_NOTE : null,
    '',
    'Please confirm availability, delivery charges, and payment instructions. Thank you!'
  ].filter((line) => line !== null).join('\n');
}

/** Whole cart in one message. `resolved` is the result of resolveCart(); items with problems are not allowed. */
export function cartOrderMessage(resolved, { origin = '' } = {}) {
  if (!resolved.items.length) throw new Error('Your cart is empty.');
  if (resolved.hasProblems) throw new Error('Some items in your cart are no longer available. Please remove them first.');
  const blocks = resolved.items.map((item, i) => {
    const { product } = item;
    const link = productLink(origin, product); const image = imageLink(origin, product);
    const options = [item.size && `Size: ${item.size}`, item.colour && `Colour: ${item.colour}`].filter(Boolean).join(' | ');
    return [
      `${i + 1}. ${product.name}`,
      product.sku ? `   Product ID: ${product.sku}` : null,
      options ? `   ${options}` : null,
      `   Qty: ${item.quantity} x ${formatKES(item.unitPrice)} = ${formatKES(item.lineTotal)}`,
      link ? `   Link: ${link}` : null,
      image ? `   Image: ${image}` : null
    ].filter((line) => line !== null).join('\n');
  });
  const anyDemo = resolved.items.some((i) => i.product.demo);
  return [
    'Hi KT TV! I would like to order the following items:',
    '',
    blocks.join('\n\n'),
    '',
    `Items total: ${formatKES(resolved.subtotal)}`,
    anyDemo ? DEMO_NOTE : null,
    '',
    'Please confirm availability, delivery charges, and payment instructions. Thank you!'
  ].filter((line) => line !== null).join('\n');
}

/** Ticket ENQUIRY (not a purchase). */
export function eventTicketMessage(event, { category = '', price = null, quantity = 1, dateText = '', origin = '' } = {}) {
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > 99) throw new Error('Quantity must be a whole number between 1 and 99.');
  const unit = Number(price);
  const link = absoluteUrl(origin, `events/${event.slug}`);
  return [
    'Hi KT TV! I would like to enquire about tickets:',
    '',
    `Event: ${event.title}`,
    dateText ? `Date: ${dateText}` : null,
    event.venue ? `Venue: ${event.venue}` : null,
    category ? `Ticket category: ${category}` : null,
    Number.isFinite(unit) ? `Price per ticket: ${formatKES(unit)}` : null,
    `Quantity: ${qty}`,
    Number.isFinite(unit) ? `Total: ${formatKES(unit * qty)}` : null,
    link ? `Event Link: ${link}` : null,
    event.demo ? 'Note: this is a DEMO/SAMPLE event, not a confirmed event.' : null,
    '',
    'Please confirm ticket availability and payment instructions. This is an enquiry only; no ticket has been purchased.'
  ].filter((line) => line !== null).join('\n');
}

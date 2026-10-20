// Pure catalog logic (no React, no Vite-only APIs) so it can be unit-tested with `npm test`.
// Handles product normalisation, size/colour variants, stock, search, filters and sorting.

export const STOCK = Object.freeze({ IN: 'in_stock', LIMITED: 'limited', OUT: 'out_of_stock' });
const VALID_STOCK = new Set(Object.values(STOCK));
export const STOCK_LABELS = { in_stock: 'In stock', limited: 'Limited stock', out_of_stock: 'Out of stock' };
export const MAX_QUANTITY = 99;
/** A numeric stock count at or below this is shown as "Limited stock". */
export const LOW_STOCK_THRESHOLD = 5;
export const COLLECTIONS = ['Gents', 'Ladies', 'Unisex'];

const text = (v) => (v === undefined || v === null ? '' : String(v).trim());
const list = (v) => (Array.isArray(v) ? v.map(text).filter(Boolean) : []);
const unique = (arr) => [...new Set(arr)];

export function slugify(value = '') {
  return text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Stock can be a number of items (CMS: 0 = sold out, 1–5 = limited) or one of the words in_stock / limited / out_of_stock.
 * Returns the status plus the exact quantity when a number was given (null when unknown).
 */
export function parseStock(value) {
  if (VALID_STOCK.has(value)) return { stock: value, quantity: null };
  if (value !== '' && value !== null && value !== undefined && Number.isFinite(Number(value)) && Number(value) >= 0) {
    const quantity = Math.floor(Number(value));
    return { stock: quantity === 0 ? STOCK.OUT : quantity <= LOW_STOCK_THRESHOLD ? STOCK.LIMITED : STOCK.IN, quantity };
  }
  return { stock: STOCK.IN, quantity: null };
}

/** Accepts the old format (list of image paths) and the new one (list of { image, alt }). */
export function normalizeImages(images, fallbackAlt = '') {
  if (!Array.isArray(images)) return [];
  return images
    .map((item) => {
      if (typeof item === 'string') return item.trim() ? { src: item.trim(), alt: fallbackAlt } : null;
      const src = text(item?.image || item?.src);
      return src ? { src, alt: text(item?.alt) || fallbackAlt } : null;
    })
    .filter(Boolean);
}

export function normalizeProduct(raw = {}) {
  const name = text(raw.name) || 'Untitled product';
  const regular = Number(raw.price);
  const regularPrice = Number.isFinite(regular) && regular >= 0 ? regular : 0;
  const hasSale = raw.sale_price !== '' && raw.sale_price !== null && raw.sale_price !== undefined;
  const sale = Number(raw.sale_price);
  const onSale = hasSale && Number.isFinite(sale) && sale >= 0 && sale < regularPrice;
  const variants = (Array.isArray(raw.variants) ? raw.variants : [])
    .map((v) => ({ size: text(v?.size), colour: text(v?.colour ?? v?.color), ...parseStock(v?.stock) }))
    .filter((v) => v.size || v.colour);
  const base = parseStock(raw.stock);
  return {
    ...raw,
    name,
    slug: text(raw.slug) || slugify(name),
    sku: text(raw.sku),
    description: text(raw.description),
    // `price` is always the price the customer pays (the sale price when one is set); `regularPrice` is the crossed-out one.
    price: onSale ? sale : regularPrice,
    regularPrice,
    onSale,
    isNew: raw.new === true,
    category: text(raw.category) || 'Merchandise',
    product_type: text(raw.product_type),
    collection: COLLECTIONS.includes(text(raw.collection)) ? text(raw.collection) : '',
    tags: list(raw.tags),
    images: normalizeImages(raw.images, name),
    // When variants exist they are the source of truth; declared sizes/colours without a variant are shown as unavailable.
    sizes: unique([...list(raw.sizes), ...variants.map((v) => v.size).filter(Boolean)]),
    colours: unique([...list(raw.colours), ...variants.map((v) => v.colour).filter(Boolean)]),
    variants,
    stock: base.stock,
    quantity: base.quantity,
    demo: raw.demo === true,
    featured: raw.featured === true,
    dateValue: Date.parse(text(raw.date)) || 0
  };
}

/* ---------- variants & stock ---------- */

const bestStock = (levels) => {
  if (!levels.length || levels.every((s) => s === STOCK.OUT)) return STOCK.OUT;
  return levels.includes(STOCK.IN) ? STOCK.IN : STOCK.LIMITED;
};
const variantMatches = (v, sel) => (!sel.size || v.size === sel.size) && (!sel.colour || v.colour === sel.colour);

/** Stock for a (possibly partial) selection. Unknown sizes/colours are treated as unavailable. */
export function stockFor(product, selection = {}) {
  const sel = { size: text(selection.size), colour: text(selection.colour) };
  if (product.variants.length) {
    return bestStock(product.variants.filter((v) => variantMatches(v, sel)).map((v) => v.stock));
  }
  if (sel.size && !product.sizes.includes(sel.size)) return STOCK.OUT;
  if (sel.colour && !product.colours.includes(sel.colour)) return STOCK.OUT;
  return product.stock;
}
export const productStock = (product) => stockFor(product, {});

/** How many can be ordered for a selection; Infinity when no exact count is known. */
export function availableQuantity(product, selection = {}) {
  const sel = { size: text(selection.size), colour: text(selection.colour) };
  if (product.variants.length) {
    const matching = product.variants.filter((v) => variantMatches(v, sel));
    if (!matching.length || matching.some((v) => v.quantity === null)) return Infinity;
    return matching.reduce((sum, v) => sum + v.quantity, 0);
  }
  return product.quantity === null ? Infinity : product.quantity;
}

/** Is `value` for `dimension` ('size' | 'colour') purchasable given what is already selected in the other dimension? */
export function isOptionAvailable(product, dimension, value, selection = {}) {
  return stockFor(product, { ...selection, [dimension]: value }) !== STOCK.OUT;
}

export function validateOrder(product, { size = '', colour = '', quantity = 1 } = {}) {
  const errors = {};
  if (product.sizes.length && !size) errors.size = 'Please select a size.';
  else if (size && !product.sizes.includes(size)) errors.size = 'That size is not available.';
  if (product.colours.length && !colour) errors.colour = 'Please select a colour.';
  else if (colour && !product.colours.includes(colour)) errors.colour = 'That colour is not available.';
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QUANTITY) errors.quantity = `Quantity must be a whole number between 1 and ${MAX_QUANTITY}.`;
  if (!errors.size && !errors.colour && stockFor(product, { size, colour }) === STOCK.OUT) {
    errors.stock = product.sizes.length || product.colours.length
      ? 'That combination is out of stock. Please choose another option.'
      : 'This product is currently out of stock.';
  } else if (!errors.size && !errors.colour && !errors.quantity) {
    const max = availableQuantity(product, { size, colour });
    if (Number.isFinite(max) && qty > max) errors.quantity = max === 1 ? 'Only 1 is available.' : `Only ${max} are available.`;
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

/* ---------- search, filters, sorting ---------- */

/** Every whitespace-separated word of the query must appear somewhere in the given fields. */
export function matchesQuery(fields, query) {
  const words = text(query).toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = fields.flat().map((f) => text(f).toLowerCase()).join(' | ');
  return words.every((w) => haystack.includes(w));
}

export const productSearchFields = (p) => [p.name, p.description, p.category, p.collection, p.product_type, p.tags, p.sku];

const offers = (product, sel) => {
  if (product.variants.length) return product.variants.some((v) => variantMatches(v, sel));
  return (!sel.size || product.sizes.includes(sel.size)) && (!sel.colour || product.colours.includes(sel.colour));
};

export const emptyFilters = Object.freeze({ q: '', collection: '', category: '', size: '', colour: '', min: '', max: '', inStock: false });

export function filterProducts(products, filters = {}) {
  const f = { ...emptyFilters, ...filters };
  const min = f.min === '' || f.min === null ? null : Number(f.min);
  const max = f.max === '' || f.max === null ? null : Number(f.max);
  const sel = { size: text(f.size), colour: text(f.colour) };
  return products.filter((p) => {
    if (!matchesQuery(productSearchFields(p), f.q)) return false;
    if (f.collection && p.collection !== f.collection) return false;
    if (f.category && p.category !== f.category) return false;
    if (Number.isFinite(min) && p.price < min) return false;
    if (Number.isFinite(max) && p.price > max) return false;
    if ((sel.size || sel.colour) && !offers(p, sel)) return false;
    if (f.inStock && stockFor(p, sel) === STOCK.OUT) return false;
    return true;
  });
}

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' }
];

export function sortProducts(products, sort = 'featured') {
  const byNewest = (a, b) => b.dateValue - a.dateValue || a.name.localeCompare(b.name);
  const copy = [...products];
  switch (sort) {
    case 'newest': return copy.sort(byNewest);
    case 'price-asc': return copy.sort((a, b) => a.price - b.price || byNewest(a, b));
    case 'price-desc': return copy.sort((a, b) => b.price - a.price || byNewest(a, b));
    default: return copy.sort((a, b) => Number(b.featured) - Number(a.featured) || byNewest(a, b));
  }
}

const SIZE_ORDER = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'XXXL', 'ONE SIZE'];
export const compareSizes = (a, b) => {
  const ia = SIZE_ORDER.indexOf(a.toUpperCase()); const ib = SIZE_ORDER.indexOf(b.toUpperCase());
  if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  return a.localeCompare(b, undefined, { numeric: true });
};

export function buildFacets(products) {
  const prices = products.map((p) => p.price);
  return {
    collections: COLLECTIONS.filter((c) => products.some((p) => p.collection === c)),
    categories: unique(products.map((p) => p.category).filter(Boolean)).sort(),
    sizes: unique(products.flatMap((p) => p.sizes)).sort(compareSizes),
    colours: unique(products.flatMap((p) => p.colours)).sort(),
    minPrice: prices.length ? Math.min(...prices) : 0,
    maxPrice: prices.length ? Math.max(...prices) : 0
  };
}

/** Same category first, then anything else; never the product itself. */
export function relatedProducts(products, product, limit = 4) {
  const others = products.filter((p) => p.slug !== product.slug);
  const same = others.filter((p) => p.category === product.category);
  const rest = others.filter((p) => p.category !== product.category);
  return [...sortProducts(same, 'featured'), ...sortProducts(rest, 'featured')].slice(0, limit);
}

/* ---------- colour swatches ---------- */
const SWATCHES = {
  black: '#0d0d0f', white: '#f4f4f4', charcoal: '#3a3a40', grey: '#8a8a92', gray: '#8a8a92', navy: '#16213e',
  pink: '#f02bb7', 'hot pink': '#f02bb7', magenta: '#d614a0', yellow: '#ffd93b', orange: '#ff6a1f', red: '#d92b3a',
  green: '#1f8f55', olive: '#5b6130', blue: '#2563eb', purple: '#7a3bd1', cream: '#efe6d2', beige: '#d8c6a5', brown: '#6b4a32'
};
export const swatchColour = (name = '') => SWATCHES[text(name).toLowerCase()] || null;

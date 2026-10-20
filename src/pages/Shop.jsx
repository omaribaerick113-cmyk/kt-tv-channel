import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { products } from '../content.js';
import { PageIntro, EmptyState } from '../components/common.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { COLLECTIONS, SORT_OPTIONS, buildFacets, filterProducts, sortProducts } from '../utils/catalog.js';
import { formatKES } from '../utils/format.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

const facets = buildFacets(products);

export default function Shop() {
  usePageMeta('Shop', 'Shop KT TV streetwear — T-shirts, hoodies and accessories. Search, filter by size, colour and price, then order on WhatsApp.');
  const [params, setParams] = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = {
    q: params.get('q') || '',
    collection: COLLECTIONS.includes(params.get('collection')) ? params.get('collection') : '',
    category: params.get('category') || '',
    size: params.get('size') || '',
    colour: params.get('colour') || '',
    min: params.get('min') || '',
    max: params.get('max') || '',
    inStock: params.get('stock') === '1'
  };
  const sort = SORT_OPTIONS.some((o) => o.value === params.get('sort')) ? params.get('sort') : 'featured';

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === '' || value === null || value === undefined || value === false) next.delete(key);
      else next.set(key, value === true ? '1' : String(value));
    });
    setParams(next, { replace: true });
  };
  const reset = () => setParams(new URLSearchParams(), { replace: true });

  const shown = useMemo(() => sortProducts(filterProducts(products, filters), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters.q, filters.collection, filters.category, filters.size, filters.colour, filters.min, filters.max, filters.inStock, sort]);
  const activeCount = [filters.category, filters.size, filters.colour, filters.min, filters.max, filters.inStock].filter(Boolean).length;
  const anyActive = activeCount > 0 || filters.q || filters.collection;

  return (
    <>
      <PageIntro eyebrow="KT TV MERCHANDISE" title={filters.collection ? `${filters.collection} collection` : 'Shop the collection'} text="Pick your size and colour, add to cart and send your order on WhatsApp. Delivery and payment are confirmed with you before anything is charged." />
      <section className="container content-section" aria-label="Products">
        <div className="collection-tabs" role="group" aria-label="Collections">
          {['', ...facets.collections].map((c) => (
            <button key={c || 'all'} type="button" className={`pill ${filters.collection === c ? 'active' : ''}`} aria-pressed={filters.collection === c} onClick={() => update({ collection: c })}>{c || 'All'}</button>
          ))}
        </div>

        <div className="shop-toolbar">
          <div className="search-box">
            <Search size={18} aria-hidden="true" />
            <label htmlFor="shop-search" className="sr-only">Search products</label>
            <input id="shop-search" type="search" value={filters.q} onChange={(e) => update({ q: e.target.value })} placeholder="Search name, description, category or type…" autoComplete="off" />
          </div>
          <div className="select-box">
            <label htmlFor="shop-sort">Sort by</label>
            <select id="shop-sort" value={sort} onChange={(e) => update({ sort: e.target.value === 'featured' ? '' : e.target.value })}>
              {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button type="button" className="btn btn-outline filters-toggle" aria-expanded={filtersOpen} aria-controls="filters-panel" onClick={() => setFiltersOpen(!filtersOpen)}>
            <SlidersHorizontal size={16} aria-hidden="true" /> Filters{activeCount ? ` (${activeCount})` : ''}
          </button>
        </div>

        <div id="filters-panel" className={`filters-panel ${filtersOpen ? 'open' : ''}`}>
          <div className="filter-field">
            <label htmlFor="f-category">Category</label>
            <select id="f-category" value={filters.category} onChange={(e) => update({ category: e.target.value })}>
              <option value="">All categories</option>
              {facets.categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {facets.sizes.length > 0 ? (
            <fieldset className="filter-field"><legend>Size</legend>
              <div className="chip-row">{facets.sizes.map((s) => <button key={s} type="button" className={`chip ${filters.size === s ? 'active' : ''}`} aria-pressed={filters.size === s} onClick={() => update({ size: filters.size === s ? '' : s })}>{s}</button>)}</div>
            </fieldset>
          ) : null}
          {facets.colours.length > 0 ? (
            <fieldset className="filter-field"><legend>Colour</legend>
              <div className="chip-row">{facets.colours.map((c) => <button key={c} type="button" className={`chip ${filters.colour === c ? 'active' : ''}`} aria-pressed={filters.colour === c} onClick={() => update({ colour: filters.colour === c ? '' : c })}>{c}</button>)}</div>
            </fieldset>
          ) : null}
          <fieldset className="filter-field"><legend>Price (KSh)</legend>
            <div className="price-range">
              <label className="sr-only" htmlFor="f-min">Minimum price</label>
              <input id="f-min" type="number" inputMode="numeric" min="0" placeholder={`Min ${facets.minPrice}`} value={filters.min} onChange={(e) => update({ min: e.target.value })} />
              <span aria-hidden="true">–</span>
              <label className="sr-only" htmlFor="f-max">Maximum price</label>
              <input id="f-max" type="number" inputMode="numeric" min="0" placeholder={`Max ${facets.maxPrice}`} value={filters.max} onChange={(e) => update({ max: e.target.value })} />
            </div>
            {facets.maxPrice > 0 ? <small className="muted">Prices range from {formatKES(facets.minPrice)} to {formatKES(facets.maxPrice)}.</small> : null}
          </fieldset>
          <div className="filter-field">
            <label className="check"><input type="checkbox" checked={filters.inStock} onChange={(e) => update({ stock: e.target.checked })} /> In stock only</label>
            {anyActive ? <button type="button" className="btn btn-outline btn-sm" onClick={reset}>Reset filters</button> : null}
          </div>
        </div>

        <p className="result-count" role="status" aria-live="polite">{shown.length} {shown.length === 1 ? 'product' : 'products'}{filters.q ? ` for “${filters.q}”` : ''}</p>
        {shown.length ? (
          <div className="product-grid">{shown.map((p, i) => <ProductCard key={p.slug} product={p} priority={i < 4} />)}</div>
        ) : products.length ? (
          <EmptyState icon={ShoppingBag} title="No products found" text="Try a different search term or remove some filters.">
            <button type="button" className="btn btn-primary" onClick={reset}>Reset filters</button>
          </EmptyState>
        ) : (
          <EmptyState icon={ShoppingBag} title="New merch is dropping soon" text="Products published in the CMS appear here after the next site build." />
        )}
      </section>
    </>
  );
}

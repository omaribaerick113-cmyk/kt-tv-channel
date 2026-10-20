import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { products, events, videos } from '../content.js';
import { PageIntro, EmptyState, SectionHeading } from '../components/common.jsx';
import { SearchForm } from '../components/Header.jsx';
import ProductCard from '../components/ProductCard.jsx';
import EventCard from '../components/EventCard.jsx';
import ShowCard from '../components/ShowCard.jsx';
import { filterProducts, matchesQuery, sortProducts } from '../utils/catalog.js';
import { eventSearchFields } from './Events.jsx';
import { showSearchFields } from './Shows.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

export default function SearchPage() {
  const [params] = useSearchParams();
  const q = (params.get('q') || '').trim();
  usePageMeta(q ? `Search: ${q}` : 'Search', 'Search KT TV products, events and shows.');
  const results = useMemo(() => q ? {
    products: sortProducts(filterProducts(products, { q }), 'featured'),
    events: events.filter((e) => matchesQuery(eventSearchFields(e), q)),
    shows: videos.filter((s) => matchesQuery(showSearchFields(s), q))
  } : { products: [], events: [], shows: [] }, [q]);
  const total = results.products.length + results.events.length + results.shows.length;
  return (
    <>
      <PageIntro eyebrow="SEARCH" title={q ? `Results for “${q}”` : 'Search KT TV'} text="Search merchandise, events and shows." />
      <section className="container content-section">
        <SearchForm key={q} id="search-page-input" initial={q} />
        <p className="result-count" role="status" aria-live="polite">{q ? `${total} ${total === 1 ? 'result' : 'results'}` : ''}</p>
        {q && total === 0 ? <EmptyState icon={Search} title="Nothing found" text="Try another word, or browse the shop."><Link className="btn btn-primary" to="/shop">Browse the shop</Link></EmptyState> : null}
        {results.products.length > 0 ? <><SectionHeading title={`Products (${results.products.length})`} action="Open in shop" to={`/shop?q=${encodeURIComponent(q)}`} /><div className="product-grid">{results.products.map((p) => <ProductCard key={p.slug} product={p} />)}</div></> : null}
        {results.events.length > 0 ? <><SectionHeading title={`Events (${results.events.length})`} /><div className="event-grid">{results.events.map((e) => <EventCard key={e.slug} event={e} />)}</div></> : null}
        {results.shows.length > 0 ? <><SectionHeading title={`Shows (${results.shows.length})`} /><div className="show-grid">{results.shows.map((s) => <ShowCard key={s.slug} show={s} />)}</div></> : null}
      </section>
    </>
  );
}

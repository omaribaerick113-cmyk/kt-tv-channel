import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PlayCircle, Search, Youtube } from 'lucide-react';
import { videos, settings, social } from '../content.js';
import { PageIntro, EmptyState } from '../components/common.jsx';
import ShowCard from '../components/ShowCard.jsx';
import { matchesQuery } from '../utils/catalog.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export const showSearchFields = (s) => [s.title, s.description, s.category];

export default function Shows() {
  usePageMeta('Shows & videos', 'Watch KT TV shows and videos.');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const list = useMemo(() => videos.filter((s) => matchesQuery(showSearchFields(s), q)).sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))), [q]);
  const youtube = typeof social.youtube === 'string' ? social.youtube.trim() : '';
  return (
    <>
      <PageIntro eyebrow="WATCH KT TV" title="Shows & videos" text="“Watch Now” appears only when a show has a valid video link. Others are marked coming soon." />
      <section className="container content-section">
        {videos.length > 0 ? (
          <div className="shop-toolbar single"><div className="search-box"><Search size={18} aria-hidden="true" /><label htmlFor="show-search" className="sr-only">Search shows</label>
            <input id="show-search" type="search" value={q} placeholder="Search shows and videos…" onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })} autoComplete="off" /></div></div>
        ) : null}
        {list.length ? <div className="show-grid">{list.map((s) => <ShowCard key={s.slug} show={s} />)}</div> : <EmptyState icon={PlayCircle} title={q ? 'No shows match your search' : settings.shows_empty_text} />}
        {youtube ? <p className="channel-cta"><a className="btn btn-outline" href={youtube} target="_blank" rel="noopener noreferrer"><Youtube size={18} aria-hidden="true" /> Visit the KT TV YouTube channel</a></p> : null}
      </section>
    </>
  );
}

import React from 'react';
import { PlayCircle, ArrowUpRight } from 'lucide-react';
import SmartImage from './SmartImage.jsx';
import { DemoBadge } from './common.jsx';
import { watchUrl, youtubeThumbnail } from '../utils/media.js';

/** "Watch Now" only exists when the CMS supplied a valid URL; otherwise the card says "Coming soon". */
export default function ShowCard({ show }) {
  const url = watchUrl(show);
  const thumb = show.thumbnail || youtubeThumbnail(show.youtube_url);
  return (
    <article className="show-card">
      <div className="show-thumb">
        <SmartImage src={thumb} alt={`${show.title} thumbnail`} width="1280" height="720" icon={PlayCircle} label="KT TV" />
        <span className="badge-row">{show.demo ? <DemoBadge>Sample</DemoBadge> : null}</span>
        {url ? <a className="play-overlay" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${show.title}`}><PlayCircle size={52} aria-hidden="true" /></a> : null}
      </div>
      <div className="show-info">
        {show.category ? <span className="eyebrow">{show.category}</span> : null}
        <h3>{show.title}</h3>
        {show.description ? <p>{show.description}</p> : null}
        {url
          ? <a className="btn btn-primary" href={url} target="_blank" rel="noopener noreferrer">Watch Now <ArrowUpRight size={14} aria-hidden="true" /></a>
          : <span className="coming-soon">Coming soon</span>}
      </div>
    </article>
  );
}

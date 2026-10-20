import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, ArrowUpRight, Ticket } from 'lucide-react';
import SmartImage from './SmartImage.jsx';
import { DemoBadge } from './common.jsx';
import { eventState, parseEventDate, ticketInfo } from '../utils/events.js';
import { formatDate, formatKES } from '../utils/format.js';

export default function EventCard({ event }) {
  const state = eventState(event);
  const date = parseEventDate(event.date);
  const tickets = ticketInfo(event);
  const to = `/events/${event.slug}`;
  const place = [event.venue, event.location].filter(Boolean).join(' · ');
  const statusBadge = state === 'cancelled' ? 'Cancelled' : state === 'postponed' ? 'Postponed' : state === 'completed' ? 'Past event' : tickets.soldOut ? 'Sold out' : '';
  return (
    <article className="event-card">
      <Link to={to} className="event-poster" aria-label={`View details: ${event.title}`} tabIndex={-1}>
        <SmartImage src={event.poster} alt={event.poster_alt || `${event.title} poster`} width="1000" height="1250" icon={CalendarDays} label="Poster coming soon" />
        <span className="badge-row">
          {event.demo ? <DemoBadge>Demo</DemoBadge> : null}
          {statusBadge ? <span className="badge badge-out">{statusBadge}</span> : null}
        </span>
      </Link>
      <div className="event-info">
        <p className="event-date"><CalendarDays size={14} aria-hidden="true" /> {date ? formatDate(date, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date to be confirmed'}</p>
        <h3><Link to={to}>{event.title}</Link></h3>
        <ul className="event-meta">
          {event.start_time ? <li><Clock size={14} aria-hidden="true" /> {event.start_time}</li> : null}
          {place ? <li><MapPin size={14} aria-hidden="true" /> {place}</li> : null}
        </ul>
        {event.description ? <p className="event-desc">{event.description}</p> : null}
        {tickets.fromPrice !== null ? <p className="event-price">{tickets.fromPrice > 0 ? `Tickets from ${formatKES(tickets.fromPrice)}` : 'Free entry'}</p> : null}
        <div className="card-actions">
          <Link className="btn btn-outline" to={to}>View Details</Link>
          {tickets.url && state !== 'cancelled' && state !== 'completed' && !tickets.soldOut ? (
            <a className="btn btn-primary" href={tickets.url} target="_blank" rel="noopener noreferrer"><Ticket size={16} aria-hidden="true" /> Get Tickets <ArrowUpRight size={14} aria-hidden="true" /></a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

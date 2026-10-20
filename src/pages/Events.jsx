import React, { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CalendarDays, Clock, MapPin, Search, Ticket, ArrowUpRight } from 'lucide-react';
import { events, settings, whatsappReady } from '../content.js';
import { PageIntro, EmptyState, DemoBadge } from '../components/common.jsx';
import EventCard from '../components/EventCard.jsx';
import SmartImage from '../components/SmartImage.jsx';
import QuantityInput from '../components/QuantityInput.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import RichText from '../components/RichText.jsx';
import { eventState, isUpcoming, parseEventDate, splitEvents, ticketInfo } from '../utils/events.js';
import { matchesQuery } from '../utils/catalog.js';
import { eventTicketMessage } from '../utils/whatsapp.js';
import { formatDate, formatKES } from '../utils/format.js';
import { usePageMeta } from '../hooks/usePageMeta.js';

export const eventSearchFields = (e) => [e.title, e.description, e.venue, e.location, e.body];

export function Events() {
  usePageMeta('Events', 'Upcoming KT TV events and shows — dates, venues and ticket information.');
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const { upcoming, past } = useMemo(() => splitEvents(events.filter((e) => matchesQuery(eventSearchFields(e), q))), [q]);
  return (
    <>
      <PageIntro eyebrow="LIVE & IN PERSON" title="Events & shows" text="See what’s coming up with KT TV. Ticket buttons only appear when ticket details have been confirmed for an event." />
      <section className="container content-section">
        {events.length > 0 ? (
          <div className="shop-toolbar single">
            <div className="search-box">
              <Search size={18} aria-hidden="true" />
              <label htmlFor="event-search" className="sr-only">Search events</label>
              <input id="event-search" type="search" value={q} placeholder="Search events by name, venue or location…" onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })} autoComplete="off" />
            </div>
          </div>
        ) : null}
        <h2 className="list-heading">Upcoming</h2>
        {upcoming.length
          ? <div className="event-grid">{upcoming.map((e) => <EventCard key={e.slug} event={e} />)}</div>
          : <EmptyState icon={CalendarDays} title={q ? 'No events match your search' : settings.events_empty_text} />}
        {past.length > 0 ? (<><h2 className="list-heading">Past &amp; cancelled</h2><div className="event-grid">{past.map((e) => <EventCard key={e.slug} event={e} />)}</div></>) : null}
      </section>
    </>
  );
}

export function Tickets() {
  usePageMeta('Tickets', 'Events with ticket information from KT TV.');
  const list = useMemo(() => splitEvents(events).upcoming.filter((e) => { const t = ticketInfo(e); return t.url || t.categories.length; }), []);
  return (
    <>
      <PageIntro eyebrow="YOUR NEXT EXPERIENCE" title="Tickets" text="Events that have ticket details. Open an event to get tickets or send a ticket enquiry on WhatsApp." />
      <section className="container content-section">
        {list.length ? <div className="event-grid">{list.map((e) => <EventCard key={e.slug} event={e} />)}</div> : <EmptyState icon={Ticket} title="Ticket details are coming soon" text="No upcoming event has ticket details yet. Check the events page for the latest."><Link className="btn btn-primary" to="/events">See all events</Link></EmptyState>}
      </section>
    </>
  );
}

function TicketBox({ event }) {
  const tickets = ticketInfo(event);
  const state = eventState(event);
  const [category, setCategory] = useState(tickets.categories.length === 1 ? tickets.categories[0].category : '');
  const [qty, setQty] = useState('1');
  const [error, setError] = useState('');
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const open = isUpcoming(event) && state !== 'cancelled' && !tickets.soldOut;
  if (!open) return <div className="ticket-box"><p className="help">{state === 'cancelled' ? 'This event has been cancelled.' : tickets.soldOut ? 'Tickets for this event are sold out.' : 'Ticket sales for this event have closed.'}</p></div>;
  if (!tickets.url && !tickets.categories.length) return <div className="ticket-box"><h2>Tickets</h2><p className="help">Ticket details haven’t been announced yet. Check back soon.</p></div>;

  const chosen = tickets.categories.find((c) => c.category === category);
  const needsCategory = tickets.categories.length > 0;
  const qtyN = Number(qty);
  const qtyOk = Number.isInteger(qtyN) && qtyN >= 1 && qtyN <= 99;
  let blockedReason = '';
  if (needsCategory && !chosen) blockedReason = 'Please choose a ticket category.';
  else if (chosen?.availability === 'sold_out') blockedReason = 'That ticket category is sold out.';
  else if (!qtyOk) blockedReason = 'Quantity must be a whole number between 1 and 99.';
  const message = blockedReason ? '' : eventTicketMessage(event, { category: chosen?.category || '', price: chosen ? chosen.price : null, quantity: qtyN, origin, dateText: formatDate(parseEventDate(event.date), { day: 'numeric', month: 'long', year: 'numeric' }) });

  return (
    <div className="ticket-box">
      <h2>Tickets</h2>
      {tickets.url ? <a className="btn btn-primary btn-lg" href={tickets.url} target="_blank" rel="noopener noreferrer"><Ticket size={18} aria-hidden="true" /> GET TICKETS <ArrowUpRight size={14} aria-hidden="true" /></a> : null}
      {needsCategory ? (
        <>
          <div className="filter-field"><label htmlFor="ticket-cat">Ticket category</label>
            <select id="ticket-cat" value={category} onChange={(e) => { setCategory(e.target.value); setError(''); }}>
              <option value="">Choose a category</option>
              {tickets.categories.map((c) => <option key={c.category} value={c.category} disabled={c.availability === 'sold_out'}>{c.category} — {c.price > 0 ? formatKES(c.price) : 'Free'}{c.availability === 'limited' ? ' (limited)' : c.availability === 'sold_out' ? ' (sold out)' : ''}</option>)}
            </select>
          </div>
          <div className="qty-row"><label htmlFor="ticket-qty" className="qty-label">Tickets</label><QuantityInput id="ticket-qty" value={qty} onChange={(v) => { setQty(v); setError(''); }} /></div>
          {whatsappReady ? <WhatsAppButton className="btn-lg" label="ENQUIRE ABOUT TICKETS ON WHATSAPP" message={message} blockedReason={blockedReason} onBlocked={setError} onSent={() => setError('')} /> : <WhatsAppButton label="ENQUIRE ABOUT TICKETS ON WHATSAPP" message="" />}
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <p className="help">This is an enquiry only — no ticket is reserved or bought until KT TV confirms availability and payment with you.</p>
        </>
      ) : null}
    </div>
  );
}

export function EventDetail() {
  const { slug } = useParams();
  const event = events.find((e) => e.slug === slug);
  usePageMeta(event ? event.title : 'Event not found', event?.description || 'KT TV events');
  if (!event) return <section className="container content-section"><EmptyState icon={CalendarDays} title="We couldn’t find that event" text="It may have been unpublished or the link may be wrong."><Link className="btn btn-primary" to="/events">All events</Link></EmptyState></section>;
  const date = parseEventDate(event.date); const state = eventState(event);
  return (
    <>
      <nav className="breadcrumb container" aria-label="Breadcrumb"><Link to="/events">Events</Link><span aria-hidden="true">/</span><span aria-current="page">{event.title}</span></nav>
      <section className="container event-detail">
        <div className="event-detail-poster"><SmartImage src={event.poster} alt={event.poster_alt || `${event.title} poster`} width="1000" height="1250" eager icon={CalendarDays} label="Poster coming soon" /></div>
        <div className="event-detail-body">
          <div className="badge-row inline">{event.demo ? <DemoBadge>Demo event</DemoBadge> : null}{state !== 'scheduled' ? <span className="badge badge-out">{state === 'cancelled' ? 'Cancelled' : state === 'postponed' ? 'Postponed' : 'Past event'}</span> : null}</div>
          <h1>{event.title}</h1>
          <ul className="event-facts">
            <li><CalendarDays size={18} aria-hidden="true" /> {date ? formatDate(date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'Date to be confirmed'}</li>
            {event.start_time ? <li><Clock size={18} aria-hidden="true" /> {event.start_time}</li> : null}
            {event.venue || event.location ? <li><MapPin size={18} aria-hidden="true" /> {[event.venue, event.location].filter(Boolean).join(' · ')}</li> : null}
          </ul>
          {event.description ? <p className="detail-lead">{event.description}</p> : null}
          {event.body ? <RichText text={event.body} className="prose" /> : null}
          <TicketBox event={event} />
        </div>
      </section>
    </>
  );
}

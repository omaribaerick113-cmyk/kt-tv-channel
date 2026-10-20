import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Mail, MessageCircle, Music2 } from 'lucide-react';
import { pages, settings, whatsappChatUrl } from '../content.js';
import { PageIntro, EmptyState, SocialLinks, socialLinkList } from '../components/common.jsx';
import RichText from '../components/RichText.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';

export function Music() {
  usePageMeta('Music', 'KT TV music links.');
  const links = socialLinkList.filter(([key]) => ['spotify', 'audiomack', 'soundcloud', 'youtube'].includes(key));
  return (
    <>
      <PageIntro eyebrow="SOUND & CULTURE" title="Music" text="Find KT TV’s music-related links. Platform links appear only when configured in the CMS." />
      <section className="container content-section">
        <div className="music-platforms">
          {links.map(([key, label, Icon, url]) => (
            <a key={key} className="music-platform" href={url} target="_blank" rel="noopener noreferrer"><Icon size={28} aria-hidden="true" /><span><strong>{label}</strong><small>Open official profile</small></span><ArrowUpRight aria-hidden="true" /></a>
          ))}
        </div>
        {!links.length ? <EmptyState icon={Music2} title="Music links coming soon" text="Optional music platform links can be added in the CMS under Site settings → Social media settings." /> : null}
      </section>
    </>
  );
}

export function SocialPage() {
  usePageMeta('Social media', 'Follow KT TV on social media.');
  return (
    <>
      <PageIntro eyebrow="STAY CONNECTED" title="Follow the movement." text="Connect with KT TV through the official channels below. Optional platforms stay hidden until a link is configured." />
      <section className="container content-section">
        <div className="social-card-grid">
          {socialLinkList.map(([key, label, Icon, url]) => (
            <a className="social-card" href={url} key={key} target="_blank" rel="noopener noreferrer"><span className="social-card-icon"><Icon size={25} aria-hidden="true" /></span><span><strong>{label}</strong><small>Follow KT TV on {label}</small></span><ArrowUpRight aria-hidden="true" /></a>
          ))}
        </div>
      </section>
    </>
  );
}

export function About() {
  usePageMeta('About', 'About KT TV — Kenyan Trapper.');
  const page = pages.find((p) => p.slug === 'about');
  const text = page?.body || settings.about_text || 'Kenyan Trapper — KT TV is a digital media and personal-brand platform focused on creative expression, contemporary culture, lifestyle, fashion, and entertainment.';
  return (
    <>
      <PageIntro eyebrow="WHO WE ARE" title="Creativity without a box." text="Meet the platform behind KT TV." />
      <section className="container content-section about-layout">
        <div className="about-monogram"><img className="about-logo" src="/images/kt-tv-logo.png" alt="KT TV logo" width="800" height="454" loading="lazy" /><small>KENYAN TRAPPER</small></div>
        <div className="prose"><RichText text={text} /><Link className="btn btn-primary" to="/contact">Connect with KT TV <ArrowUpRight size={16} aria-hidden="true" /></Link></div>
      </section>
    </>
  );
}

export function Contact() {
  usePageMeta('Contact', 'Contact KT TV for merchandise, events and collaborations.');
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.trim().length < 8) { setError('Please enter your name, a valid email and a message of at least 8 characters.'); return; }
    if (!settings.email) { setError('The contact email has not been configured yet.'); return; }
    const body = `Name: ${form.name}\nEmail: ${form.email}\nSubject: ${form.subject || 'General enquiry'}\n\n${form.message}`;
    window.location.href = `mailto:${settings.email}?subject=${encodeURIComponent(form.subject || 'KT TV website enquiry')}&body=${encodeURIComponent(body)}`;
    setError('');
  };
  return (
    <>
      <PageIntro eyebrow="SAY HELLO" title="Let’s talk." text="For general questions, merchandise enquiries, event information or collaboration ideas, get in touch." />
      <section className="container content-section contact-layout">
        <div className="contact-info">
          <h2>Connect with KT TV</h2>
          <p>Send an enquiry and your email app will open with your message ready to send, or contact us through WhatsApp.</p>
          {settings.email ? <a className="contact-method" href={`mailto:${settings.email}`}><span><Mail aria-hidden="true" /></span><div><small>Email</small><strong>{settings.email}</strong></div><ArrowUpRight aria-hidden="true" /></a> : null}
          {whatsappChatUrl ? <a className="contact-method" href={whatsappChatUrl} target="_blank" rel="noopener noreferrer"><span><MessageCircle aria-hidden="true" /></span><div><small>WhatsApp</small><strong>Message KT TV</strong></div><ArrowUpRight aria-hidden="true" /></a> : null}
          <SocialLinks />
        </div>
        <form className="contact-form" onSubmit={submit} noValidate>
          <h2>Send a message</h2>
          <div className="filter-field"><label htmlFor="c-name">Your name</label><input id="c-name" required value={form.name} onChange={set('name')} autoComplete="name" /></div>
          <div className="filter-field"><label htmlFor="c-email">Email address</label><input id="c-email" required type="email" value={form.email} onChange={set('email')} autoComplete="email" /></div>
          <div className="filter-field"><label htmlFor="c-subject">Subject</label><input id="c-subject" value={form.subject} onChange={set('subject')} /></div>
          <div className="filter-field"><label htmlFor="c-message">Message</label><textarea id="c-message" required rows="5" value={form.message} onChange={set('message')} /></div>
          {error ? <p className="field-error" role="alert">{error}</p> : null}
          <button className="btn btn-primary" type="submit">Prepare email <ArrowUpRight size={16} aria-hidden="true" /></button>
          <small className="muted">This form opens your email application; it does not send data to a website server.</small>
        </form>
      </section>
    </>
  );
}

export function LegalPage({ slug }) {
  const page = pages.find((p) => p.slug === slug);
  usePageMeta(page?.title || 'Information', page?.meta_description || 'Information about using the KT TV website.');
  return (
    <>
      <PageIntro eyebrow="SITE INFORMATION" title={page?.title || 'Information'} text={page?.meta_description || 'Information about using the KT TV website.'} />
      <section className="container content-section"><RichText className="prose" text={page?.body || 'This page is being prepared.'} /></section>
    </>
  );
}

export function NotFound() {
  usePageMeta('Page not found', 'This page could not be found.');
  return (
    <section className="not-found container"><span className="eyebrow">ERROR 404</span><h1>This page went off the grid.</h1><p>The page may have moved or the address may be incorrect.</p><Link to="/" className="btn btn-primary">Back to home <ArrowUpRight size={16} aria-hidden="true" /></Link></section>
  );
}

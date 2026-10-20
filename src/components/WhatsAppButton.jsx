import React, { useState } from 'react';
import { MessageCircle, Copy, Check } from 'lucide-react';
import { settings, whatsappNumber, whatsappReady } from '../content.js';
import { buildWhatsAppUrl } from '../utils/whatsapp.js';

function SetupNotice({ label, className }) {
  return (
    <div className="whatsapp-setup">
      <button type="button" className={`btn btn-whatsapp ${className}`} disabled><MessageCircle size={18} aria-hidden="true" /> {label}</button>
      <p className="help" role="note">
        {import.meta.env.DEV
          ? 'Setup needed: add the business WhatsApp number (international digits, e.g. 2547XXXXXXXX) as whatsapp_number in content/settings/general.yml, or in the CMS under Site settings → General.'
          : <>WhatsApp ordering is temporarily unavailable. Please{settings.email ? <> email us at <a href={`mailto:${settings.email}`}>{settings.email}</a></> : ' contact us another way'}.</>}
      </p>
    </div>
  );
}

/**
 * A real link to wa.me with the pre-filled message (so it works with the WhatsApp app on phones and WhatsApp Web on desktop).
 * If `blockedReason` is set the link does not open; `onBlocked(reason)` lets the page show what is missing.
 * After a click we offer a fallback: open the link again, or copy the message.
 */
export default function WhatsAppButton({ message, blockedReason = '', onBlocked, onSent, label = 'ORDER VIA WHATSAPP', className = '' }) {
  const [clicked, setClicked] = useState(false);
  const [copy, setCopy] = useState('');
  if (!whatsappReady) return <SetupNotice label={label} className={className} />;

  let url = '';
  if (!blockedReason && message) { try { url = buildWhatsAppUrl(message, whatsappNumber); } catch { url = ''; } }

  const onClick = (e) => {
    if (!url) { e.preventDefault(); onBlocked?.(blockedReason || 'Nothing to send yet.'); return; }
    setClicked(true); setCopy(''); onSent?.();
  };
  const copyMessage = async () => {
    try { await navigator.clipboard.writeText(message); setCopy('copied'); } catch { setCopy('failed'); }
  };
  return (
    <div className="whatsapp-action">
      <a className={`btn btn-whatsapp ${className}`} href={url || '#whatsapp-order'} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        <MessageCircle size={18} aria-hidden="true" /> {label}
      </a>
      {clicked && url ? (
        <p className="help" role="status">
          WhatsApp didn’t open? <a href={url} target="_blank" rel="noopener noreferrer">Open it again</a> or{' '}
          <button type="button" className="link-button" onClick={copyMessage}>{copy === 'copied' ? <><Check size={14} aria-hidden="true" /> Copied</> : <><Copy size={14} aria-hidden="true" /> copy the order message</>}</button>
          {copy === 'failed' ? ' — copying isn’t available in this browser.' : ''}
        </p>
      ) : null}
    </div>
  );
}

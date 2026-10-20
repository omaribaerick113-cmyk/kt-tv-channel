import React from 'react';

/** Minimal, safe renderer for CMS text: blank-line paragraphs and **bold**. No HTML is ever injected. */
export default function RichText({ text = '', className = '' }) {
  const paragraphs = String(text).split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        <p key={i}>{p.split(/(\*\*[^*]+\*\*)/g).map((part, j) => (part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part))}</p>
      ))}
    </div>
  );
}

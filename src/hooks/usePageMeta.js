import { useEffect } from 'react';

const DEFAULT_TITLE = 'KT TV — Kenyan Trapper';
function setMeta(selector, create, value) {
  let el = document.head.querySelector(selector);
  if (!el) { el = document.createElement('meta'); create(el); document.head.appendChild(el); }
  el.setAttribute('content', value);
}
/** Sets the document title and meta description (also the Open Graph copies) for the current page. */
export function usePageMeta(title, description) {
  useEffect(() => {
    const fullTitle = title ? `${title} — KT TV` : DEFAULT_TITLE;
    document.title = fullTitle;
    setMeta('meta[property="og:title"]', (el) => el.setAttribute('property', 'og:title'), fullTitle);
    if (description) {
      setMeta('meta[name="description"]', (el) => el.setAttribute('name', 'description'), description);
      setMeta('meta[property="og:description"]', (el) => el.setAttribute('property', 'og:description'), description);
    }
  }, [title, description]);
}

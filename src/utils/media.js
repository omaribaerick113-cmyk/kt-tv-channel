export function isValidHttpUrl(value = '') {
  try {
    const u = new URL(String(value).trim());
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch { return false; }
}
export function youtubeId(url = '') {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1).split('/')[0] || null;
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(parsed.hostname)) {
      if (parsed.pathname === '/watch') return parsed.searchParams.get('v');
      const match = parsed.pathname.match(/^\/(embed|shorts)\/([^/?]+)/);
      if (match) return match[2];
    }
  } catch { /* invalid or empty URL */ }
  return null;
}
export function youtubeThumbnail(url) { const id = youtubeId(url); return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : ''; }
/** A "Watch Now" link only exists when the CMS supplied a valid YouTube URL or another valid http(s) URL. */
export function watchUrl(show = {}) {
  const id = youtubeId(show.youtube_url);
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  return isValidHttpUrl(show.watch_url) ? String(show.watch_url).trim() : '';
}

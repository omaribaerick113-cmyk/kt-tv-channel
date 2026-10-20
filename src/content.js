import YAML from 'yaml';
import { parseFrontMatter } from './utils/frontmatter.js';
import { normalizeProduct } from './utils/catalog.js';
import { normalizeWhatsAppNumber } from './utils/whatsapp.js';

// All site content is edited in Decap CMS and read here at build time from /content.
const markdownFiles = import.meta.glob('../content/**/*.md', { eager: true, query: '?raw', import: 'default' });
const yamlFiles = import.meta.glob('../content/settings/*.yml', { eager: true, query: '?raw', import: 'default' });

function parseMarkdownFiles(folder) {
  return Object.entries(markdownFiles)
    .filter(([path]) => path.includes(`/content/${folder}/`))
    .map(([path, raw]) => {
      const parsed = parseFrontMatter(raw);
      return { ...parsed.data, body: parsed.content.trim(), _path: path };
    });
}
const isPublished = (item) => item.published !== false;

export const products = parseMarkdownFiles('products').filter(isPublished).map(normalizeProduct);
export const events = parseMarkdownFiles('events').filter(isPublished).map((e) => ({
  ...e,
  slug: e.slug || String(e.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  demo: e.demo === true
}));
export const videos = parseMarkdownFiles('videos').filter(isPublished).map((v) => ({
  ...v,
  slug: v.slug || String(v.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
  demo: v.demo === true
}));
export const pages = parseMarkdownFiles('pages').filter(isPublished);

function loadYaml(name, fallback) {
  const entry = Object.entries(yamlFiles).find(([path]) => path.endsWith(`/${name}.yml`));
  if (!entry) return fallback;
  try { return { ...fallback, ...(YAML.parse(entry[1]) || {}) }; } catch { return fallback; }
}

const settingDefaults = {
  brand_name: 'KT TV', full_brand_name: 'Kenyan Trapper', email: '', whatsapp_number: '',
  hero_headline: 'WEAR THE CULTURE. REPRESENT KT TV.',
  hero_description: 'Discover KT TV streetwear, upcoming events, and exclusive entertainment.',
  shop_title: 'SHOP THE LATEST KT TV COLLECTION', shop_text: '', trending_title: 'TRENDING NOW',
  events_title: 'UPCOMING EVENTS & SHOWS', events_empty_text: 'New events are coming soon — check back for updates.',
  shows_title: 'WATCH KT TV', shows_empty_text: 'New shows and videos are coming soon — check back for updates.',
  story_title: 'HOW ORDERING WORKS', story_text: '',
  delivery_info: 'Delivery options, charges and timelines are confirmed with you on WhatsApp before you pay.',
  returns_info: 'Exchanges and returns are handled case by case. Please ask us on WhatsApp before ordering if you have questions.'
};
export const settings = loadYaml('general', settingDefaults);
export const social = loadYaml('social', {});
export const aboutPage = pages.find((page) => page.slug === 'about');

/** The single place the business WhatsApp number is read: content/settings/general.yml → whatsapp_number. */
export const whatsappNumber = normalizeWhatsAppNumber(settings.whatsapp_number);
export const whatsappReady = whatsappNumber !== '';
export const whatsappChatUrl = whatsappReady ? `https://wa.me/${whatsappNumber}` : '';

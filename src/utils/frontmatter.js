import YAML from 'yaml';

// Small browser-safe front-matter parser (replaces gray-matter, which expects Node's Buffer/fs).
export function parseFrontMatter(raw = '') {
  const text = String(raw).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const match = text.match(/^---[ \t]*\n(?:([\s\S]*?)\n)?---[ \t]*(?:\n|$)([\s\S]*)$/);
  if (!match) return { data: {}, content: text };
  let data = {};
  try { data = YAML.parse(match[1] || '') || {}; } catch { data = {}; }
  if (typeof data !== 'object' || Array.isArray(data)) data = {};
  return { data, content: match[2] || '' };
}

// Run with:  npm run check:cms
// Checks that the CMS setup (public/admin/config.yml) and the real content files agree, so the CMS never
// hides or silently drops data. It changes nothing; it only reports.
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { parseFrontMatter } from '../src/utils/frontmatter.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
let errors = 0; let notes = 0;
const fail = (msg) => { errors++; console.log(`  ERROR  ${msg}`); };
const note = (msg) => { notes++; console.log(`  note   ${msg}`); };
const ok = (msg) => console.log(`  ok     ${msg}`);

console.log('1. config.yml is valid YAML');
let config;
try { config = YAML.parse(read('public/admin/config.yml')); ok('parsed'); } catch (e) { fail(`config.yml could not be parsed: ${e.message}`); process.exit(1); }
const backend = config.backend || {};
if (backend.name === 'turbo-github') {
  if (!backend.turbo_site_id) fail('backend.turbo_site_id is missing (it must be under "backend:")');
  else if (/PASTE|REPLACE/i.test(String(backend.turbo_site_id))) note('turbo_site_id is still the placeholder - paste your real Site ID from the Turbo dashboard before going live.');
  else ok('turbo_site_id is set');
  if (config.turbo_site_id) fail('turbo_site_id found at the top level - it must be inside "backend:"');
}
if (backend.repo) note('backend.repo is set; with Turbo it is ignored (the repo is set in the Turbo dashboard).');

console.log('2. package.json is valid JSON');
try { const pkg = JSON.parse(read('package.json')); ok(`parsed (scripts: ${Object.keys(pkg.scripts || {}).join(', ')})`); for (const s of ['cms']) if (!pkg.scripts?.[s]) fail(`script "${s}" missing`); for (const d of ['decap-server', 'serve']) if (!pkg.devDependencies?.[d]) fail(`devDependency "${d}" missing`); } catch (e) { fail(`package.json: ${e.message}`); }

console.log('3. no CMS file is empty');
for (const f of ['public/admin/index.html', 'public/admin/config.yml', 'package.json', 'README-CMS.md', 'README.md']) {
  if (!fs.existsSync(path.join(root, f))) fail(`${f} is missing`); else if (!read(f).trim()) fail(`${f} is empty`); else ok(f);
}

const isMarkdownBody = (f) => f.name === 'body' && f.widget === 'markdown';
function compare(label, fields, records) {
  // records: array of plain objects (front matter or yaml). Compare top-level and nested list keys.
  const used = new Map(); // key -> count
  const nestedUsed = new Map(); // listKey -> Set(nested keys)
  for (const rec of records) {
    for (const [k, v] of Object.entries(rec)) {
      used.set(k, (used.get(k) || 0) + 1);
      if (Array.isArray(v) && v.some((x) => x && typeof x === 'object')) {
        if (!nestedUsed.has(k)) nestedUsed.set(k, new Set());
        v.forEach((x) => x && typeof x === 'object' && Object.keys(x).forEach((nk) => nestedUsed.get(k).add(nk)));
      }
    }
  }
  const known = new Map(fields.filter((f) => !isMarkdownBody(f)).map((f) => [f.name, f]));
  for (const key of used.keys()) if (!known.has(key)) fail(`${label}: content field "${key}" has NO matching CMS field (the CMS would not show it)`);
  for (const [name, f] of known) {
    if (!used.has(name)) {
      if (f.required === false) note(`${label}: optional CMS field "${name}" is not used by any current file (fine - it is there for you to fill in)`);
      else fail(`${label}: required CMS field "${name}" does not exist in any content file`);
    }
    if (Array.isArray(f.fields) && nestedUsed.has(name)) {
      const inner = new Set(f.fields.map((x) => x.name));
      for (const nk of nestedUsed.get(name)) if (!inner.has(nk)) fail(`${label}.${name}: content sub-field "${nk}" has NO matching CMS sub-field`);
    }
  }
  ok(`${label}: ${records.length} content file(s) checked against ${known.size} CMS field(s)`);
}

console.log('4. every CMS field name matches the content files (both directions)');
for (const col of config.collections) {
  if (col.folder) {
    const dir = path.join(root, col.folder);
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')) : [];
    if (!files.length) { note(`${col.name}: no content files yet in ${col.folder}`); continue; }
    compare(col.name, col.fields, files.map((f) => parseFrontMatter(fs.readFileSync(path.join(dir, f), 'utf8')).data));
  } else if (col.files) {
    for (const file of col.files) compare(`${col.name}/${file.name}`, file.fields, [YAML.parse(read(file.file)) || {}]);
  }
}

console.log(`\n${errors ? `${errors} problem(s) found.` : 'No problems found.'}${notes ? ` (${notes} note(s) above are for your information.)` : ''}`);
process.exit(errors ? 1 : 0);

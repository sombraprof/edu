#!/usr/bin/env node
// Aggregate Creative Commons resources for lesson galleries.
// Sources: Openverse (images/audio) and Wikimedia Commons (images).
// Usage:
//   node scripts/aggregate-open-resources.mjs --query "sistemas dinâmicos" --limit 18 --out public/resources/sistemas-dinamicos.json

import fs from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
function getArg(name, fallback = '') {
  const i = args.findIndex((a) => a === `--${name}`);
  if (i >= 0 && args[i + 1]) return args[i + 1];
  const eq = args.find((a) => a.startsWith(`--${name}=`));
  if (eq) return eq.split('=').slice(1).join('=');
  return fallback;
}

const query = getArg('query');
const limit = Number(getArg('limit', '24')) || 24;
const out = getArg('out');
const includeAudio = args.includes('--audio');

if (!query || !out) {
  console.error('Uso: --query "termos" --out public/resources/arquivo.json [--limit 24]');
  process.exit(1);
}

function stripHtml(s) {
  if (typeof s !== 'string') return '';
  return s.replace(/<[^>]*>/g, '').trim();
}

function safeText(v) {
  return stripHtml(String(v ?? '').trim()).slice(0, 300);
}

function slugify(s) {
  return String(s)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function queryOpenverseImages(q, n) {
  const url = new URL('https://api.openverse.engineering/v1/images/');
  url.searchParams.set('q', q);
  url.searchParams.set('page_size', String(Math.min(n, 50)));
  // Default Openverse returns CC-licensed media. We keep defaults.
  const res = await fetch(url, { headers: { 'User-Agent': 'edu-resource-aggregator/1.0' } });
  if (!res.ok) throw new Error(`Openverse falhou: ${res.status}`);
  const json = await res.json();

  const items = Array.isArray(json?.results) ? json.results : [];
  return items
    .map((it, idx) => ({
      id: it.id || `ov-${idx}`,
      type: 'image',
      title: safeText(it.title || it.foreign_landing_url || 'Imagem CC'),
      url: it.foreign_landing_url || it.url || '',
      thumbnail: it.thumbnail || it.url || '',
      author: safeText(it.creator || it.source || ''),
      source: 'Openverse',
      license: (it.license ? `CC-${String(it.license).toUpperCase()}` : '') || '',
      licenseUrl: it.license_url || '',
    }))
    .filter((r) => r.url);
}

async function queryWikimediaCommonsImages(q, n) {
  // MediaWiki API: search → image info + thumbnail
  const url = new URL('https://commons.wikimedia.org/w/api.php');
  url.searchParams.set('action', 'query');
  url.searchParams.set('format', 'json');
  url.searchParams.set('origin', '*');
  url.searchParams.set('prop', 'imageinfo');
  url.searchParams.set('iiprop', 'url|extmetadata');
  url.searchParams.set('iiurlwidth', '640');
  url.searchParams.set('generator', 'search');
  url.searchParams.set('gsrnamespace', '6'); // File namespace
  url.searchParams.set('gsrsearch', q);
  url.searchParams.set('gsrlimit', String(Math.min(n, 50)));

  const res = await fetch(url, { headers: { 'User-Agent': 'edu-resource-aggregator/1.0' } });
  if (!res.ok) throw new Error(`Wikimedia falhou: ${res.status}`);
  const json = await res.json();
  const pages = json?.query?.pages || {};
  const values = Object.values(pages);
  const results = [];
  for (const p of values) {
    const info = Array.isArray(p?.imageinfo) ? p.imageinfo[0] : null;
    if (!info) continue;
    const title = safeText(p?.title || 'Arquivo no Commons');
    const url = info.descriptionurl || info.url || '';
    const thumb = info.thumburl || info.url || '';
    // License and author data
    const meta = info.extmetadata || {};
    const author = safeText(meta.Artist?.value || meta.Credit?.value || 'Wikimedia Commons');
    const licenseShort = safeText(meta.LicenseShortName?.value || 'CC');
    const licenseUrl = meta.LicenseUrl?.value || '';
    if (url) {
      results.push({
        id: String(p.pageid || p.title),
        type: 'image',
        title,
        url,
        thumbnail: thumb,
        author,
        source: 'Wikimedia Commons',
        license: licenseShort,
        licenseUrl,
      });
    }
  }
  return results;
}

async function queryOpenverseAudio(q, n) {
  const url = new URL('https://api.openverse.engineering/v1/audio/');
  url.searchParams.set('q', q);
  url.searchParams.set('page_size', String(Math.min(n, 50)));
  const res = await fetch(url, { headers: { 'User-Agent': 'edu-resource-aggregator/1.0' } });
  if (!res.ok) throw new Error(`Openverse (áudio) falhou: ${res.status}`);
  const json = await res.json();
  const items = Array.isArray(json?.results) ? json.results : [];
  return items
    .map((it, idx) => ({
      id: it.id || `ova-${idx}`,
      type: 'audio',
      title: safeText(it.title || it.foreign_landing_url || 'Áudio CC'),
      url: it.foreign_landing_url || it.url || it.audio_set?.foreign_landing_url || '',
      thumbnail: it.thumbnail || '',
      author: safeText(it.creator || it.source || ''),
      source: 'Openverse',
      license: (it.license ? `CC-${String(it.license).toUpperCase()}` : '') || '',
      licenseUrl: it.license_url || '',
    }))
    .filter((r) => r.url);
}

async function main() {
  const tasks = [
    queryOpenverseImages(query, Math.ceil(limit / (includeAudio ? 3 : 2))),
    queryWikimediaCommonsImages(query, Math.ceil(limit / (includeAudio ? 3 : 2))),
  ];
  if (includeAudio) tasks.push(queryOpenverseAudio(query, Math.ceil(limit / 3)));
  const results = await Promise.allSettled(tasks);

  const items = [];
  for (const r of results) {
    if (r.status === 'fulfilled') items.push(...r.value);
  }

  // Trim to requested limit and ensure unique by URL
  const seen = new Set();
  const unique = [];
  for (const it of items) {
    const key = it.url;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(it);
    }
    if (unique.length >= limit) break;
  }

  const payload = {
    query,
    generatedAt: new Date().toISOString(),
    items: unique,
  };

  const outPath = path.resolve(process.cwd(), out);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Salvo ${unique.length} itens em ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

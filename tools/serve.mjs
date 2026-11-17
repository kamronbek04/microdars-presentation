// Serves one built presentation (its dist folder) to the public link, in place of `vite preview`.
// Faster over the tunnel than vite preview:
// - text files (scripts, styles, map data) are compressed here, once, so the tunnel from this PC
//   carries about a quarter of the bytes;
// - the hashed files in assets/ are cached by browsers for a year, the map data for an hour, so a
//   second visit asks this PC for almost nothing; index.html is always checked, so a rebuild shows.
// usage: node serve.mjs <dist folder> <port>
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

const [dirArg, portArg] = process.argv.slice(2);
if (!dirArg || !portArg) {
  console.error('usage: node serve.mjs <dist folder> <port>');
  process.exit(1);
}
const ROOT = path.resolve(dirArg);
const PORT = Number(portArg);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.geojson': 'application/geo+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};
const TEXT = new Set(['.html', '.js', '.mjs', '.css', '.json', '.geojson', '.svg', '.txt']);

// One entry per file, rebuilt when the file changes on disk (a rebuild while serving).
const files = new Map();
function entry(abs) {
  let st;
  try {
    st = fs.statSync(abs);
  } catch {
    return null;
  }
  if (!st.isFile()) return null;
  const hit = files.get(abs);
  if (hit && hit.mtime === st.mtimeMs && hit.size === st.size) return hit;
  const raw = fs.readFileSync(abs);
  const ext = path.extname(abs).toLowerCase();
  const e = {
    mtime: st.mtimeMs,
    size: st.size,
    raw,
    ext,
    type: TYPES[ext] || 'application/octet-stream',
    etag: `"${crypto.createHash('sha1').update(raw).digest('base64url').slice(0, 20)}"`,
    br: null,
    gz: null,
  };
  if (TEXT.has(ext) && raw.length > 1024) {
    e.br = zlib.brotliCompressSync(raw, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 9, [zlib.constants.BROTLI_PARAM_SIZE_HINT]: raw.length },
    });
    e.gz = zlib.gzipSync(raw, { level: 9 });
  }
  files.set(abs, e);
  return e;
}

function cacheControl(rel) {
  if (rel === 'index.html') return 'no-cache';
  if (rel.startsWith('assets/')) return 'public, max-age=31536000, immutable'; // names carry a content hash
  return 'public, max-age=3600';
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  let rel;
  try {
    rel = decodeURIComponent(new URL(req.url, 'http://x').pathname).replace(/^\/+/, '');
  } catch {
    res.writeHead(400).end();
    return;
  }
  if (rel === '' || rel.endsWith('/')) rel += 'index.html';
  const abs = path.resolve(ROOT, rel);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  const e = entry(abs);
  if (!e) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
    return;
  }
  const headers = {
    'Content-Type': e.type,
    'Cache-Control': cacheControl(path.relative(ROOT, abs).split(path.sep).join('/')),
    ETag: e.etag,
    'X-Content-Type-Options': 'nosniff',
  };
  if (e.br) headers.Vary = 'Accept-Encoding';
  if (req.headers['if-none-match'] === e.etag) {
    res.writeHead(304, headers).end();
    return;
  }
  const accept = String(req.headers['accept-encoding'] || '');
  let body = e.raw;
  if (e.br && /\bbr\b/.test(accept)) {
    body = e.br;
    headers['Content-Encoding'] = 'br';
  } else if (e.gz && /\bgzip\b/.test(accept)) {
    body = e.gz;
    headers['Content-Encoding'] = 'gzip';
  }
  headers['Content-Length'] = body.length;
  res.writeHead(200, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Serving ${ROOT} at http://127.0.0.1:${PORT}`);
});

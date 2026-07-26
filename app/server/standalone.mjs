/**
 * Production server: serves the built `dist/` plus the same /api middleware the
 * dev server uses. Run `npm run build` first.
 *
 *   node server/standalone.mjs
 *   PORT=8080 KOHLER_HOST=192.168.0.115 node server/standalone.mjs
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createKohlerMiddleware } from './middleware.mjs';
import { DEFAULT_HOST } from './kohler-client.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.resolve(__dirname, '..', 'dist');
const PORT = Number(process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const api = createKohlerMiddleware({ host: DEFAULT_HOST });

function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';

  const file = path.join(DIST, rel);
  // Refuse anything that escapes dist/.
  if (!file.startsWith(DIST)) {
    res.statusCode = 403;
    return res.end('forbidden');
  }

  fs.readFile(file, (err, buf) => {
    if (err) {
      // SPA fallback.
      return fs.readFile(path.join(DIST, 'index.html'), (e2, html) => {
        if (e2) {
          res.statusCode = 404;
          return res.end('not found — did you run `npm run build`?');
        }
        res.setHeader('Content-Type', MIME['.html']);
        res.end(html);
      });
    }
    res.setHeader('Content-Type', MIME[path.extname(file)] || 'application/octet-stream');
    res.end(buf);
  });
}

http
  .createServer((req, res) => api(req, res, () => serveStatic(req, res)))
  .listen(PORT, '0.0.0.0', () => {
    console.log(`DTV+ web UI  http://0.0.0.0:${PORT}`);
    console.log(`controller   ${DEFAULT_HOST}`);
  });

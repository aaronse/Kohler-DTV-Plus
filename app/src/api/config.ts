/**
 * Where the /api proxy lives.
 *
 * Empty string means "same origin", which is what the Vite dev server and the
 * standalone Node server both provide. A packaged build — the planned Capacitor
 * Android host — has no Node process of its own, so it must be pointed at a
 * server on the LAN:
 *
 *     VITE_API_BASE=http://192.168.0.20:8080 npm run build
 *
 * The controller itself can never be the target directly: its .cgi endpoints
 * answer in HTTP/0.9, which no browser or WebView HTTP stack will accept. The
 * proxy is what makes it speakable, so it stays in the picture on every
 * platform. See DESIGN.md.
 */
export const API_BASE = (import.meta.env.VITE_API_BASE ?? '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

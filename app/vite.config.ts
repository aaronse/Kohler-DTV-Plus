import { defineConfig, loadEnv, type PluginOption } from 'vite';
import react from '@vitejs/plugin-react';
// @ts-expect-error -- plain .mjs, shared with the standalone server
import { createKohlerMiddleware } from './server/middleware.mjs';

/**
 * The controller cannot be reached with Vite's normal `server.proxy`: its .cgi
 * handlers answer in HTTP/0.9 (body, no status line) and node-http-proxy throws
 * on that. So /api is served by our own middleware, which talks to the unit over
 * a raw socket. See server/kohler-client.mjs.
 */
function kohlerApi(host: string): PluginOption {
  const middleware = createKohlerMiddleware({ host });
  return {
    name: 'kohler-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'KOHLER_');
  const host = env.KOHLER_HOST || '192.168.0.115';

  return {
    plugins: [react(), kohlerApi(host)],
    server: {
      port: 5180,
      // Bound to all interfaces so the phone on the same Wi-Fi can reach it.
      host: true,
    },
    build: { outDir: 'dist' },
  };
});

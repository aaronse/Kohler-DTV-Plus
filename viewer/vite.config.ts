import { defineConfig } from 'vitest/config';

// Port 5181 deliberately: the DTV+ hardware app owns 5180. Running both at once
// is normal (compare the physical control against the model), and a port clash
// that silently steals the hardware app's socket would be a bad day.
export default defineConfig({
  server: {
    port: 5181,
    strictPort: true,
    // Bound to all interfaces so a tablet on the bench can view the model.
    host: true,
  },
  build: {
    outDir: 'dist',
    // three + its addons dominate the bundle; the 500KB default warning is noise
    // here and would train us to ignore a real regression.
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});

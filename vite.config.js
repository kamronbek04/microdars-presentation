import { defineConfig } from 'vite';

// base './' keeps the built folder portable: dist/ works from any address or sub-folder.
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 2500 },
});

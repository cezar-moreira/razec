import { defineConfig } from 'vite';

export default defineConfig({
  base: '/razec/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});

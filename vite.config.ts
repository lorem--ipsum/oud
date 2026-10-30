import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: { outDir: 'demo', emptyOutDir: true },
  server: { port: 3000 },
});

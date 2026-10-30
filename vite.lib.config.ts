import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: { entry: 'src/index.ts', name: 'oud', fileName: 'oud', formats: ['es', 'umd'] },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime', 'three'],
      output: {
        globals: { react: 'React', 'react-dom': 'ReactDOM', 'react/jsx-runtime': 'jsxRuntime', three: 'THREE' },
      },
    },
  },
});

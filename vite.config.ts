import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Проксі обходить CORS: браузер звертається до свого origin (/freeserp),
// а Vite сам ходить на https://freeserp.ai
const freeserpProxy = {
  '/freeserp': {
    target: 'https://freeserp.ai',
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => path.replace(/^\/freeserp/, ''),
  },
};

export default defineConfig({
  plugins: [react()],
  server: { proxy: freeserpProxy },
  preview: { proxy: freeserpProxy },
});

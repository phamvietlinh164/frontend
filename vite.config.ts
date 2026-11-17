import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development, proxy /api to the Go backend so the browser only ever talks to
// the frontend origin. In production the same path is proxied by nginx.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});

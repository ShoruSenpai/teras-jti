import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindvue from '@tailwindcss/vite';

// ngrok http localhost:5175 --domain=sinkerless-horribly-felicity.ngrok-free.dev --host-header=localhost:5175

export default defineConfig({
  plugins: [
    tailwindvue(), // Tailwind v4 butuh plugin ini terpasang di Vite
  ],
  server: {
    allowedHosts: true,
    host: true,
    cors: true,
    hmr: {
      protocol: 'wss', // Use 'wss' (WebSocket Secure) for HTTPS
      clientPort: 443, // Standard HTTPS port
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        desktop: resolve(__dirname, 'desktop.html'),
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});

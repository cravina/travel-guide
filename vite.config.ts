import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/travel-guide/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'TrailSync Itinerary Guide',
        short_name: 'TrailSync',
        display: 'standalone',
        theme_color: '#1E4238',
        background_color: '#F4F6F0',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
            sizes: '192x192 512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});

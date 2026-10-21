import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemmap'

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://www.alveolystudios.site',
      dynamicRoutes: ['/', '/features', '/pricing', '/showcase', '/faq', '/about', '/contact', '/terms', '/privacy'],
    }),
  ],
})
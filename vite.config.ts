import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: set base to your repo name
  base: '/PixelFind/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('tesseract')) return 'vendor-tesseract';
          if (id.includes('dexie')) return 'vendor-dexie';
          if (id.includes('fuse.js')) return 'vendor-fuse';
          if (id.includes('zustand')) return 'vendor-zustand';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor-react';
        },
      },
    },
  },
  optimizeDeps: {
    // Force Vite to pre-bundle tesseract.js with CJS->ESM interop
    include: ['tesseract.js'],
  },
})

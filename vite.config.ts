/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/**
 * Vite configuration for QR Generator.
 * - base set for GitHub Pages deployment under /qr_generator/
 * - Tailwind CSS v4 plugin for JIT compilation
 * - React Fast Refresh for development
 */
export default defineConfig({
  base: '/qr_generator/',
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          qr: ['qr-code-styling'],
          export: ['jspdf', 'jszip', 'file-saver'],
        },
      },
    },
  },
})

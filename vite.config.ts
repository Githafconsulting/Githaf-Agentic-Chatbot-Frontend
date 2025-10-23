import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy all /api requests to backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy /health endpoint to backend
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    // Manual chunk splitting for better caching and performance
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries
          'ui-vendor': ['framer-motion', 'lucide-react', 'clsx'],

          // Charts and data viz (including globe)
          'charts-vendor': ['recharts', 'react-globe.gl', 'three'],

          // Date and i18n
          'utils-vendor': ['date-fns', 'i18next', 'react-i18next', 'axios'],

          // Form and data components
          'form-vendor': ['react-datepicker', 'react-grid-layout', 'react-resizable'],
        },
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Optimize CSS
    cssCodeSplit: true,

    // Source maps for production debugging (optional)
    sourcemap: false,

    // Minify options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: ['react-globe.gl'], // Exclude globe from pre-bundling for better lazy loading
  },
})

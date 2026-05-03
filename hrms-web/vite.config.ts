import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    // Raise the warning threshold — antd alone is large by design
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached across every page
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Ant Design — largest dependency, cache separately
          'vendor-antd': ['antd', '@ant-design/icons'],
          // Charts — only loaded on analytics/payroll pages
          'vendor-charts': ['recharts'],
          // PDF export — only loaded on demand
          'vendor-pdf': ['jspdf', 'html2canvas'],
          // Date utilities
          'vendor-date': ['dayjs'],
          // HTTP / query
          'vendor-query': ['@tanstack/react-query', 'axios'],
        },
      },
    },
  },
  server: {
    port: 5175,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
      '/media': {
        target: 'http://localhost:8001',
        changeOrigin: true,
      },
    },
  },
})

/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import legacy from '@vitejs/plugin-legacy'

const proxy = {
  "/api": {
      target: "http://localhost:8080",
      changeOrigin: true,
      secure: false,
      ws: true,
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  preview: {
    port:3000
  },
  server: {
    port:3000,
      proxy,
  },
  plugins: [
    react(),
    legacy({
      targets: ['last 2 versions, not dead, > 0.2%'],
    })
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: "test-setup.ts",
  },
})

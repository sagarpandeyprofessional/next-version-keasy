import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwind from '@tailwindcss/vite'  // rename import to avoid confusion

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwind(),  // call the plugin as a function
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
})
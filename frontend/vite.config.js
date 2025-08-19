import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwind from '@tailwindcss/vite'  // rename import to avoid confusion

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwind(),  // call the plugin as a function
  ],
})

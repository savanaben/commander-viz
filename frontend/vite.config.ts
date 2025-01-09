import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Add an alias to make imports from project root easier
      '@data': '/data'
    }
  },
  // Allow JSON imports
  json: {
    stringify: true
  }
});

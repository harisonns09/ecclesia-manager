import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // This allows accessing process.env.API_KEY in the browser for the demo
    // WARNING: In production, never expose API keys in frontend code
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '') 
  }
});
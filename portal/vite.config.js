import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Built with a relative base so the app can be served from any subpath (e.g. /pof/).
export default defineConfig({
  base: './',
  plugins: [react()]
});

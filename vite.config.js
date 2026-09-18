import { defineConfig } from 'vite';
export default defineConfig({ build: { rollupOptions: { input: ['index.html', 'guide.html', 'formats.html', 'about.html', 'privacy.html', 'contact.html'] } }, worker: { format: 'es' } });

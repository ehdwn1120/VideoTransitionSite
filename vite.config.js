import { defineConfig } from 'vite';
export default defineConfig({ optimizeDeps: { exclude: ['@ffmpeg/ffmpeg'] }, build: { rollupOptions: { input: ['index.html', 'guide.html', 'formats.html', 'about.html', 'privacy.html', 'contact.html', 'en/index.html', 'en/guide.html', 'en/formats.html', 'en/about.html', 'en/privacy.html', 'en/contact.html'] } }, worker: { format: 'es' } });

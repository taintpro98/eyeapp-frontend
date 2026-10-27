import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',
        port: 5173,
        watch: {
            usePolling: true, // required for reliable file watching inside Docker
        },
        // Serverless functions (api/*.ts) run in scripts/dev-api.ts locally; Vercel serves them in production.
        proxy: {
            '/api': {
                target: process.env.DEV_API_URL || 'http://localhost:3001',
                changeOrigin: true,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});

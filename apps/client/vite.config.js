import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api/auth': {
                target:
                    process.env.VITE_AUTH_PROXY_TARGET ||
                    'http://localhost:3001',
                changeOrigin: true,
            },
            '/api': {
                target:
                    process.env.VITE_PROXY_TARGET || 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
});

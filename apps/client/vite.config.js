import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [react()],
        test: {
            environment: 'jsdom',
            setupFiles: './src/test/setup.js',
        },
        server: {
            proxy: {
                '/api/auth': {
                    target:
                        env.VITE_AUTH_PROXY_TARGET || 'http://localhost:3001',
                    changeOrigin: true,
                },
                '/api': {
                    target: env.VITE_PROXY_TARGET || 'http://localhost:3000',
                    changeOrigin: true,
                },
            },
        },
    };
});

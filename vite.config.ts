import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const useLocalApiProxy = env.VITE_USE_LOCAL_API_PROXY === 'true';
  return {
    base: './',
    server: {
      port: 3000,
      strictPort: true,
      host: '127.0.0.1',
      proxy: useLocalApiProxy
        ? {
            '/api': {
              target: 'http://127.0.0.1:5000',
              changeOrigin: true,
              secure: false,
            },
          }
        : undefined,
    },
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});

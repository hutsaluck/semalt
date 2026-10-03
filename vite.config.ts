import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { API_ENDPOINT } from './src/api/endpoint.ts';

const proxy = {
  [`^${API_ENDPOINT}(?:\\?|$)`]: {
    target: 'https://freeserp.ai',
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/freeserp(?=\?|$)/, '/api.php'),
    proxyTimeout: 16_000,
  },
};

export default defineConfig({
  plugins: [react()],
  base: './',
  server: { proxy },
  preview: { proxy },
  test: {
    environment: 'node',
    clearMocks: true,
    restoreMocks: true,
    include: ['src/**/*.test.ts'],
  },
});

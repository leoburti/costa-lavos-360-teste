import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.js',
        '**/index.js',
        'src/main.jsx'
      ],
    },
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
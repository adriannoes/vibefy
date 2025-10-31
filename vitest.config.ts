import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: true, // Usar thread único para evitar problemas de memória
        useAtomics: false,
        maxThreads: 1,
        minThreads: 1,
      },
    },
    testTimeout: 30000, // Aumentar timeout para testes mais longos
    hookTimeout: 30000,
    maxConcurrency: 1, // Executar testes sequencialmente
    maxWorkers: 1,
    isolate: false, // Desabilitar isolamento para reduzir overhead
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

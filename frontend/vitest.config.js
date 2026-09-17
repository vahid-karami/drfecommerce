import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.jsx'],
      include: ['./src/**/*.test.{js,jsx}'],
      exclude: ['**/node_modules/**', '**/dist/**'],
      globals: true,
      mockReset: true,
      coverage: {
        reporter: ['text', 'lcov'],
        exclude: ['src/test/', 'src/main.jsx', 'src/App.jsx'],
      },
    },
  };
});

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import fs from 'fs'; // Добавьте импорт fs

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    https: { // Добавьте эту секцию
      key: fs.readFileSync('./cert/key.pem'),
      cert: fs.readFileSync('./cert/cert.pem')
    },
    host: '0.0.0.0',
    port: 5173
  }
});
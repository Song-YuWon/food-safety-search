import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// /api/* 요청은 백엔드(3001)로 프록시 — CORS 우회 + 단일 origin으로 운영
// 백엔드 포트는 backend/.env의 PORT와 일치해야 함
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});

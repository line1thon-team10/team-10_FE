import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // 개발 서버에서만 /api를 백엔드로 넘겨요. 비어 있으면 프록시를 켜지 않아요. 변수 이름 [임시]
  const target = loadEnv(mode, process.cwd(), '').API_PROXY_TARGET;
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      port: 5173,
      proxy: target ? { '/api': { target, changeOrigin: true } } : undefined,
    },
  };
});

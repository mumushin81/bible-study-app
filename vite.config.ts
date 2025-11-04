import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages는 /bible-study-app/, Vercel은 /
  base: process.env.GITHUB_ACTIONS ? '/bible-study-app/' : '/',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000, // 1000 kB로 chunk size 경고 제한 증가
    rollupOptions: {
      output: {
        manualChunks: {
          // vendor 라이브러리들을 별도 chunk로 분리하여 캐싱 효율 향상
          'react-vendor': ['react', 'react-dom'],
          'supabase-vendor': ['@supabase/supabase-js'],
          'ui-vendor': ['framer-motion', 'lucide-react'],
        },
      },
    },
  },
})
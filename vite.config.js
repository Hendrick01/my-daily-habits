import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // O arquivo único tem ~600 kB (react-dom + Supabase são ~70%) e o service worker guarda depois da 1ª visita.
  build: { chunkSizeWarningLimit: 650 },
})

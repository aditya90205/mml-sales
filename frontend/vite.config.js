import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Served from https://deepcrucs.ai/mml-sales/ in production, but keep local
  // dev at the site root so `npm run dev` still works at http://localhost:5173/.
  base: process.env.NODE_ENV === 'production' ? '/mml-sales/' : '/',
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
})

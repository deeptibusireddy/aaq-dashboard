import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path: '/' for Azure Static Web Apps / local dev
// Change to '/aaq-dashboard/' if re-deploying to GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/',
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: process.env.VITE_ALLOWED_HOSTS
    ? { allowedHosts: process.env.VITE_ALLOWED_HOSTS.split(',') }
    : undefined,
})

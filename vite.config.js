import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/College-Feedback-System/',
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['localhost', 'aiqubit.dev'],
  },
})

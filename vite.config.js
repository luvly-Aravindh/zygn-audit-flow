import 'dotenv/config'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiPlugin } from './server/apiPlugin.js'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiPlugin()],
  base: '/',
})
import { fileURLToPath, URL } from 'node:url'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] }), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks for libraries every page needs, so app deploys
        // don't invalidate them. UI libraries are left ungrouped on purpose:
        // grouping would pull lazy-only pieces (checkbox, alert dialog) into
        // the initial download.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 3 },
            { name: 'router', test: /node_modules[\\/]react-router[\\/]/, priority: 2 },
            { name: 'dates', test: /node_modules[\\/](date-fns|@date-fns)[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})

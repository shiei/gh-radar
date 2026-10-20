/// <reference types="vitest/config" />
import { createHash } from 'node:crypto'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

/**
 * Content Security Policy for production builds. Scripts may only come from this
 * origin (plus the hashed inline theme bootstrap), and the page may only talk to
 * api.github.com. Dev mode is excluded because Vite injects its own inline scripts.
 * Move this to an HTTP header at the hosting layer when deploying.
 */
function cspPlugin(): Plugin {
  return {
    name: 'osr-csp',
    apply: 'build',
    transformIndexHtml(html) {
      const hashes = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(
        (m) =>
          `'sha256-${createHash('sha256')
            .update(m[1] ?? '')
            .digest('base64')}'`,
      )
      const policy = [
        "default-src 'self'",
        `script-src 'self' ${hashes.join(' ')}`.trim(),
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https://avatars.githubusercontent.com",
        "connect-src 'self' https://api.github.com",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join('; ')
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: policy },
          injectTo: 'head-prepend',
        },
      ]
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), cspPlugin()],
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.ts'],
    passWithNoTests: true,
  },
})

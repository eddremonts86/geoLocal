import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST

const config = defineConfig((configEnv) => {
  const shouldStubDbForClientBuild = configEnv.command === 'build' && !configEnv.isSsrBuild

  return {
    server: { port: 3001, hmr: { protocol: 'ws', host: 'localhost' } },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
      include: [
        'tests/unit/**/*.{test,spec}.{ts,tsx}',
        'tests/integration/**/*.{test,spec}.{ts,tsx}',
      ],
    },
    resolve: {
      tsconfigPaths: true,
      dedupe: ['react', 'react-dom'],
      alias: [
        ...(shouldStubDbForClientBuild
          ? [
              {
                find: /^@\/shared\/lib\/db$/,
                replacement: fileURLToPath(
                  new URL('./src/shared/lib/db/browser.ts', import.meta.url),
                ),
              },
            ]
          : []),
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      ],
    },
    plugins: [
      tailwindcss(),
      !isTest &&
        tanstackStart({
          srcDirectory: './src',
          router: { routeToken: 'route' },
        }),
      viteReact(),
    ].filter(Boolean),
  }
})

export default config

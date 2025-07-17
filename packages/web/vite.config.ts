import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { viteElectronPlugin } from './build/vite';
import dayjs from 'dayjs'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  console.log(resolve(__dirname, './header.html'))
  const isStandalone = mode === 'standalone'
  return {
    plugins: [
      // viteElectronPlugin(),
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      })
    ],
    server: {
      host: 'localhost',
      port: 3000
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, './src/renderer'),
        "@src": path.resolve(__dirname, "./src"),
      }
    },
    define: {
      __APP_BUILD_TIME__: JSON.stringify(dayjs().format('YYYY-MM-DD HH:mm:ss')),
      __STANDALONE__: isStandalone
    },
    optimizeDeps: {
      include: [
        `monaco-editor/esm/vs/language/json/json.worker`,
        `monaco-editor/esm/vs/language/css/css.worker`,
        `monaco-editor/esm/vs/language/html/html.worker`,
        `monaco-editor/esm/vs/language/typescript/ts.worker`,
        `monaco-editor/esm/vs/editor/editor.worker`
      ]
    },
    build: {
      target: 'esnext',
      rollupOptions: {
        input: {
          header: resolve(__dirname, './public/header.html'),
          index: resolve(__dirname, './index.html'),
        },
      },
    }
  }
})

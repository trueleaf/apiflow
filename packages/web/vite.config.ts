import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import { viteElectronPlugin } from './build/vite';
import dayjs from 'dayjs'
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(({ mode, command }) => {
  return {
    base: './',
    plugins: [
      viteElectronPlugin(mode, command),
      vue(),
      vueJsx({
        // 配置JSX选项
        transformOn: true,
        mergeProps: false
      }),
      // 自动导入 Vue 相关函数和 Element Plus 组件 API
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/types/auto-imports.d.ts',
      }),
      // 自动导入 Element Plus 组件
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/types/components.d.ts',
      })
    ],
    server: {
      host: 'localhost',
      port: 4000
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, './src/renderer'),
        "@src": path.resolve(__dirname, "./src"),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    define: {
      __APP_BUILD_TIME__: JSON.stringify(dayjs().format('YYYY-MM-DD HH:mm:ss')),
      __COMMAND__: JSON.stringify(command),
    },
    optimizeDeps: {
      include: [
        `monaco-editor/esm/vs/language/json/json.worker`,
        `monaco-editor/esm/vs/language/css/css.worker`,
        `monaco-editor/esm/vs/language/html/html.worker`,
        `monaco-editor/esm/vs/language/typescript/ts.worker`,
        `monaco-editor/esm/vs/editor/editor.worker`
      ],
    },
    build: {
      target: 'esnext',
      outDir: 'dist/renderer',
      emptyOutDir: true,
      // root: path.resolve(__dirname, 'dist/renderer'),
      rollupOptions: {
        input: {
          header: resolve(__dirname, './header.html'),
          index: resolve(__dirname, './index.html'),
        },
      },
    }
  }
})


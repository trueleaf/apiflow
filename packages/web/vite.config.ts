import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import dayjs from 'dayjs'
import { resolve } from 'path';
import AutoImport from 'unplugin-auto-import/rolldown'
import Components from 'unplugin-vue-components/rolldown'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig(async ({ mode, command }) => {
  // 检测是否为纯 Web 构建模式
  const isWebOnly = process.env.BUILD_TARGET === 'web'
  
  // 仅在非 Web 模式下动态导入 Electron 插件
  let viteElectronPlugin = null
  if (!isWebOnly) {
    const electronModule = await import('./build/vite')
    viteElectronPlugin = electronModule.viteElectronPlugin(mode, command)
  }
  
  return {
    base: './',
    plugins: [
      // 仅在非 Web 模式下加载 Electron 插件
      viteElectronPlugin,
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
    ].filter(Boolean),
    server: {
      host: 'localhost',
      port: 4000
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, './src/renderer'),
        "@src": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "./src/shared"),
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
        `monaco-editor/esm/vs/editor/editor.worker`,
        // 'element-plus',
        // 'element-plus/es/locale/lang/zh-cn',
        // 'lodash-es',
        // 'axios',
        // 'dayjs',
        // 'nanoid/non-secure',
        // 'vue-i18n',
        // 'pinia',
        // 'vue-router',
        // 'mitt',
        // 'idb',
        // '@faker-js/faker/locale/zh_CN',
        // 'mockjs',
        // 'lucide-vue-next',
        // '@element-plus/icons-vue',
      ],
    },
    build: {
      minify: false,
      target: 'esnext',
      outDir: isWebOnly ? 'dist/web' : 'dist/renderer',
      emptyOutDir: true,
      rollupOptions: {
        input: isWebOnly
          ? { index: resolve(__dirname, './index.html') }
          : {
              header: resolve(__dirname, './header.html'),
              index: resolve(__dirname, './index.html'),
            },
      },
    }
  }
})


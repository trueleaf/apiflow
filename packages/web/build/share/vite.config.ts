import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path, { resolve } from 'path'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

dayjs.extend(utc)
dayjs.extend(timezone)

export default defineConfig({
  root: __dirname, // 设置根目录为当前目录
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'pinia'],
      dts: '../../src/types/auto-imports-share.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: '../../src/types/components-share.d.ts',
    }),
    viteSingleFile(), // 启用单文件输出
  ],
  resolve: {
    alias: {
      "@shared/execCode": path.resolve(__dirname, '../../src/shared/execCode.web.ts'),
      "@": path.resolve(__dirname, '../../src/renderer'),
      "@src": path.resolve(__dirname, "../../src"),
      "@shared": path.resolve(__dirname, "../../src/shared"),
    }
  },
  define: {
    // 注入构建时间和环境变量标记是否为HTML模式
    __APP_VERSION__: JSON.stringify('0.9.8'),
    __APP_BUILD_TIME__: JSON.stringify(dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')),
    __APP_CLEAN_MODE__: JSON.stringify(false),
    __APP_BRAND_NAME__: JSON.stringify('ApiFlow'),
    __APP_DEFAULT_SERVER_URL__: JSON.stringify('https://app.apiflow.cn'),
    __APP_OFFICIAL_URL__: JSON.stringify('https://apiflow.cn'),
    __APP_GITHUB_URL__: JSON.stringify('https://github.com/trueleaf/apiflow'),
    __APP_GITEE_URL__: JSON.stringify('https://gitee.com/wildsell/apiflow'),
    __APP_RELEASE_URL__: JSON.stringify('https://github.com/trueleaf/apiflow/releases'),
    __APP_LICENSE_URL__: JSON.stringify('https://github.com/trueleaf/apiflow/blob/main/LICENSE'),
    __APP_COPYRIGHT__: JSON.stringify('Copyright © 2026 TrueLeaf Team'),
    __COMMAND__: JSON.stringify('serve'),
    'import.meta.env.VITE_USE_FOR_HTML': JSON.stringify('true')
  },
  worker: {
    // 禁用 worker 构建
    format: 'es',
    rollupOptions: {
      external: [/monaco-editor/, /mockjs/]
    }
  },
  optimizeDeps: {
    exclude: ['monaco-editor', 'mockjs', '@faker-js/faker']
  },
  build: {
    target: 'esnext', // 支持顶层 await
    // 指定自定义入口
    rollupOptions: {
      input: {
        share: resolve(__dirname, 'index.html') // 使用绝对路径
      },
      output: {
        // 禁用代码分割，将所有内容打包到一个文件中
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
      external: [
        /monaco-editor/,
        /mockjs/,
        /@faker-js\/faker/,
      ]
    },
    // 内联所有资源
    cssCodeSplit: false,
    assetsInlineLimit: 1000000000, // 允许较大的内联资源
    // 输出目录
    outDir: 'dist',
    emptyOutDir: true,
    // 关闭 sourcemap
    // sourcemap: true
  },
  server: {
    host: 'localhost',
    port: 3001
  },
})


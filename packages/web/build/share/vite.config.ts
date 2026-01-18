import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path, { resolve } from 'path'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export default defineConfig({
  root: __dirname, // 设置根目录为当前目录
  plugins: [
    vue(),
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
    __APP_VERSION__: JSON.stringify('0.9.6'),
    __APP_BUILD_TIME__: JSON.stringify(dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')),
    __COMMAND__: JSON.stringify('serve'),
    'import.meta.env.VITE_USE_FOR_HTML': JSON.stringify('true')
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
      }
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
  optimizeDeps: {
    include: [
      `monaco-editor/esm/vs/language/json/json.worker`,
      `monaco-editor/esm/vs/language/html/html.worker`,
      `monaco-editor/esm/vs/editor/editor.worker`
    ]
  },

})


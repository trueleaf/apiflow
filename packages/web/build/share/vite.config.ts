import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { viteSingleFile } from 'vite-plugin-singlefile'
// import { visualizer } from 'rollup-plugin-visualizer'
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
    // viteSingleFile(), // 启用单文件输出
    // visualizer({
    //   filename: 'dist/bundle-analysis.html', // 输出分析报告的路径
    //   open: true, // 构建完成后自动打开分析报告
    //   gzipSize: true, // 显示 gzip 压缩后的大小
    //   brotliSize: true, // 显示 brotli 压缩后的大小
    //   template: 'treemap' // 使用矩形树图模板
    // })
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
    __APP_BUILD_TIME__: JSON.stringify(dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')),
    'import.meta.env.VITE_USE_FOR_HTML': JSON.stringify('true')
  },
  build: {
    target: 'esnext', // 支持顶层 await
    // 指定自定义入口
    rollupOptions: {
      input: {
        share: resolve(__dirname, 'index.html') // 使用绝对路径
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
      `monaco-editor/esm/vs/language/css/css.worker`,
      `monaco-editor/esm/vs/language/html/html.worker`,
      `monaco-editor/esm/vs/language/typescript/ts.worker`,
      `monaco-editor/esm/vs/editor/editor.worker`
    ]
  },

})


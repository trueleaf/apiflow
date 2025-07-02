import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path, { resolve } from 'path'

export default defineConfig({
  root: __dirname, // 设置根目录为当前目录
  plugins: [
    vue(),
    viteSingleFile() // 启用单文件插件
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, '../../src/renderer'),
      "@src": path.resolve(__dirname, "../../src"),
    }
  },
  define: {
    // 注入环境变量，用于控制是否为HTML模式
    'import.meta.env.VITE_USE_FOR_HTML': JSON.stringify('true')
  },
  build: {
    // 指定自定义入口
    rollupOptions: {
      input: {
        share: resolve(__dirname, 'share.html') // 使用绝对路径
      }
    },
    // 内联所有资源
    cssCodeSplit: false,
    assetsInlineLimit: 100000000, // 内联所有资源
    // 输出单文件
    outDir: 'dist/share',
    emptyOutDir: true
  }
})
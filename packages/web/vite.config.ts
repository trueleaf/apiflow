import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { resolve } from 'path';

dayjs.extend(utc)
dayjs.extend(timezone)
import pkg from './package.json'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

const cleanBuildName = process.env.APIFLOW_BUILD_NAME?.trim() || 'ApiFlow'
const isCleanBuild = process.env.APIFLOW_CLEAN_BUILD === 'true'
const brandName = isCleanBuild ? cleanBuildName : 'ApiFlow'
const defaultServerUrl = isCleanBuild ? 'http://127.0.0.1:7001' : 'https://app.apiflow.cn'
const officialUrl = isCleanBuild ? '' : 'https://apiflow.cn'
const githubUrl = isCleanBuild ? '' : 'https://github.com/trueleaf/apiflow'
const giteeUrl = isCleanBuild ? '' : 'https://gitee.com/wildsell/apiflow'
const releaseUrl = isCleanBuild ? '' : 'https://github.com/trueleaf/apiflow/releases'
const licenseUrl = isCleanBuild ? '' : 'https://github.com/trueleaf/apiflow/blob/main/LICENSE'
const copyright = isCleanBuild ? `Copyright © 2026 ${brandName}` : 'Copyright © 2026 TrueLeaf Team'
const brandHtmlTitlePlugin = {
  name: 'brand-html-title',
  transformIndexHtml(html: string, context: { path: string }) {
    const title = context.path.endsWith('mcp.html') ? `${brandName} MCP Executor` : brandName
    return html.replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
  },
}

export default defineConfig(async ({ mode, command }) => {
  // 检测是否为纯 Web 构建模式
  const isWebOnly = process.env.BUILD_TARGET === 'web'
  const execCodeModule = isWebOnly
    ? path.resolve(__dirname, './src/shared/execCode.web.ts')
    : path.resolve(__dirname, './src/shared/execCode.renderer.ts')
  
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
      brandHtmlTitlePlugin,
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
        "@shared/execCode": execCodeModule,
        "@": path.resolve(__dirname, './src/renderer'),
        "@src": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "./src/shared"),
      },
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
    },
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
      __APP_BUILD_TIME__: JSON.stringify(dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')),
      __APP_CLEAN_MODE__: JSON.stringify(isCleanBuild),
      __APP_BRAND_NAME__: JSON.stringify(brandName),
      __APP_DEFAULT_SERVER_URL__: JSON.stringify(defaultServerUrl),
      __APP_OFFICIAL_URL__: JSON.stringify(officialUrl),
      __APP_GITHUB_URL__: JSON.stringify(githubUrl),
      __APP_GITEE_URL__: JSON.stringify(giteeUrl),
      __APP_RELEASE_URL__: JSON.stringify(releaseUrl),
      __APP_LICENSE_URL__: JSON.stringify(licenseUrl),
      __APP_COPYRIGHT__: JSON.stringify(copyright),
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
      sourcemap: false,
      reportCompressedSize: false,
      rollupOptions: {
        input: isWebOnly
          ? { index: resolve(__dirname, './index.html') }
          : {
              header: resolve(__dirname, './header.html'),
              index: resolve(__dirname, './index.html'),
              mcp: resolve(__dirname, './mcp.html'),
            },
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return;
            if (id.includes('monaco-editor')) return 'monaco';
            if (id.includes('element-plus')) return 'element-plus';
            if (id.includes('vue') || id.includes('pinia')) return 'vue';
            return 'vendor';
          },
        },
      },
    }
  }
})


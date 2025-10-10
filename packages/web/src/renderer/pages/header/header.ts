import { createApp } from 'vue'
import Header from './header.vue'
import '@/assets/font/iconfont.css'
import '@/assets/font/iconfont.js'
import { initStandaloneDB } from '@/cache/db';
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ElementPlus from 'element-plus';
import { i18n } from '@/i18n';
import { createPinia } from 'pinia';
import { useRuntime } from '@/store/runtime/runtime';

const pinia = createPinia();
const app = createApp(Header);

app.use(pinia);

const runtimeStore = useRuntime();

if (runtimeStore.networkMode === 'offline') {
  try { await initStandaloneDB(); }
  catch (e) { console.warn('本地缓存初始化失败，已跳过：', e); }
}

app.use(i18n).use(ElementPlus, { locale: zhCn });
app.mount('#header')

import { createApp } from 'vue'
import Header from './header.vue'
import '@/assets/font/iconfont.css'
import '@/assets/font/iconfont.js'
import { standaloneCache } from '@/cache/standalone.ts';
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ElementPlus from 'element-plus';
import { i18n } from '@/i18n';

const app = createApp(Header);

if (__STANDALONE__) {
  await standaloneCache.init();
}

app.use(i18n).use(ElementPlus, { locale: zhCn });
app.mount('#header')

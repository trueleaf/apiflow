import { createApp } from 'vue'
import Header from './Header.vue'
import '@/assets/font/iconfont.css'
import '@/assets/font/iconfont.js'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ElementPlus from 'element-plus';
import { i18n } from '@/i18n';

const app = createApp(Header);

app.use(i18n).use(ElementPlus, { locale: zhCn });
app.mount('#header')


import { createApp } from 'vue'
import Header from './header.vue'
import '@/assets/font/iconfont.css'
import '@/assets/font/iconfont.js'
import { standaloneCache } from '@/cache/standalone.ts';
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ElementPlus from 'element-plus';
import i18next from 'i18next';
import I18NextVue from "i18next-vue";

// 直接导入翻译文件，避免使用http-backend
import zhCnTranslations from '@/i18n/zh-cn';
import enTranslations from '@/i18n/en';
import zhTwTranslations from '@/i18n/zh-tw';

const app = createApp(Header);

if (__STANDALONE__) {
  await standaloneCache.init();
}

// 配置i18next，直接使用导入的翻译文件
await i18next.init({
  lng: 'zh-cn', // 默认语言
  fallbackLng: "zh-cn",
  resources: {
    'zh-cn': {
      translation: zhCnTranslations
    },
    'en': {
      translation: enTranslations
    },
    'zh-tw': {
      translation: zhTwTranslations
    }
  },
  interpolation: {
    escapeValue: false // 不转义HTML
  }
});

app.use(I18NextVue, { i18next }).use(ElementPlus, { locale: zhCn });
app.mount('#header')

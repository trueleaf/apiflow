import { createApp } from 'vue'
import ShareComponent from '../../src/renderer/pages/modules/apidoc/doc-share/share.vue'
import { createPinia } from 'pinia';
import { zhCn } from 'element-plus/es/locale/index.mjs';
import i18next from 'i18next';
import I18NextVue from "i18next-vue";
import '@/assets/css/index.css'
import { customDirective } from '../../src/renderer/directive/directive';
import ElementPlus from 'element-plus';
import { router } from '../../src/renderer/router';

// 直接导入翻译文件，避免使用http-backend
import zhCnTranslations from '../../src/renderer/i18n/zh-cn';
import enTranslations from '../../src/renderer/i18n/en';
import zhTwTranslations from '../../src/renderer/i18n/zh-tw';

const pinia = createPinia();
const app = createApp(ShareComponent);

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

app.use(pinia).use(customDirective).use(I18NextVue, { i18next }).use(ElementPlus, { locale: zhCn }).use(router).mount('#app')

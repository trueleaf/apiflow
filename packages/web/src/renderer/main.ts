import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import elZhCn from "element-plus/es/locale/lang/zh-cn";
import ElementPlus from "element-plus";
import { router } from "./router";
import "@/assets/css/index.css";
import i18next from "i18next";
import I18NextVue from "i18next-vue";
// import Backend from 'i18next-http-backend'
import { customDirective } from "./directive/directive";
import "@/assets/font/iconfont.css";
import "@/assets/font/iconfont.js";
import { standaloneCache } from "./cache/standalone";
import zhCn from "./i18n/zh-cn.ts";
import zhTw from "./i18n/zh-tw.ts";
import en from "./i18n/en.ts";
import ja from "./i18n/ja.ts";


const pinia = createPinia();
const app = createApp(App);

if (__STANDALONE__) {
  await standaloneCache.init();
}

i18next.init({
  lng: "zh-tw",
  interpolation: {
    escapeValue: false, // Vue 自动处理 HTML
  },
  load: "currentOnly",
  resources: {
    "zh-CN": {
      translation:  zhCn,
    },
    "zh-TW": {
      translation: zhTw
    },
    en: {
      translation: en
    },
    ja: {
      translation: ja,
    },
  },
});

// await i18next.use(Backend).init({
//   lng: 'zh',
//   fallbackLng: "zh",
// });

app
  .use(pinia)
  .use(customDirective)
  .use(I18NextVue, { i18next })
  .use(ElementPlus, {
    locale: elZhCn,
  })
  .use(router);
app.mount("#app");
/*
|--------------------------------------------------------------------------
| 备忘录
|--------------------------------------------------------------------------
| 1.checkApidocIsEqual 判断参数是否发生改变
*/

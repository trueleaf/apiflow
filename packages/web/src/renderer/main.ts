import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import elZhCn from "element-plus/es/locale/lang/zh-cn";
import ElementPlus from "element-plus";
import { router } from "./router";
import "@/assets/css/index.css";
import i18next from "i18next";
import I18NextVue from "i18next-vue";
// import Backend from "i18next-http-backend";
import { customDirective } from "./directive/directive";
import "@/assets/font/iconfont.css";
import "@/assets/font/iconfont.js";
import { standaloneCache } from "./cache/standalone";

// 本地静态语言资源
import zhCn from "./i18n/zh-cn";
// import zhTw from "./i18n/zh-tw";
// import en from "./i18n/en";
// import ja from "./i18n/ja";

const pinia = createPinia();
const app = createApp(App);

if (__STANDALONE__) {
  await standaloneCache.init();
}

const initialLanguage = (localStorage.getItem("language") || "zh-cn") as string;

// i18next 初始化
await i18next.init({
  lng: initialLanguage,
  interpolation: {
    escapeValue: false
  },
  fallbackLng: false,
  debug: true,
  resources: {
    "zh-cn": {
      translation: zhCn,
    },
    // "zh-TW": {
    //   translation: zhTw,
    // },
    // en: {
    //   translation: en,
    // },
    // ja: {
    //   translation: ja,
    // },
  },
});

// 如果要改为远程加载 JSON，可以启用 Backend：
// await i18next
//   .use(Backend)
//   .init({
//     lng: "zh-TW",
//     fallbackLng: ["zh-CN", "en"],
//     backend: {
//       loadPath: "/locales/{{lng}}/{{ns}}.json",
//     },
//   });

app
  .use(pinia)
  .use(customDirective)
  .use(I18NextVue, { i18next })
  .use(ElementPlus, {
    locale: elZhCn,
  })
  .use(router);

app.mount("#app");

// 页面卸载时清空所有 WebSocket 连接
window.addEventListener("beforeunload", () => {
  window.electronAPI?.websocket.clearAllConnections().catch((error) => {
    console.error("页面卸载时清理 WebSocket 连接失败:", error);
  });
});

/*
|--------------------------------------------------------------------------
| 备忘录
|--------------------------------------------------------------------------
| 1.checkApidocIsEqual 判断参数是否发生改变
*/

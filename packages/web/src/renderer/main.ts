import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import elZhCn from "element-plus/es/locale/lang/zh-cn";
import ElementPlus from "element-plus";
import { router } from "./router";
import "@/assets/css/index.css";
import { customDirective } from "./directive/directive";
import "@/assets/font/iconfont.css";
import "@/assets/font/iconfont.js";
import { standaloneCache } from "./cache/standalone";
import { i18n } from "./i18n";
import { shortcutManager } from "./shortcut/index.ts";


shortcutManager.init();
const pinia = createPinia();
const app = createApp(App);

if (__STANDALONE__) {
  await standaloneCache.init();
}

app
  .use(pinia)
  .use(customDirective)
  .use(i18n)
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

import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import elZhCn from "element-plus/es/locale/lang/zh-cn";
import ElementPlus from "element-plus";
import { router } from "./router";
import "@/assets/css/reset.css";
import "@/assets/css/global.css";
import "@/assets/css/theme/default.css";
import "@/assets/css/theme/dark.css";
import "@/assets/css/utilities.css";
import { customDirective } from "./directive/directive";
import "@/assets/font/iconfont.css";
import "@/assets/font/iconfont.js";
import { i18n } from "./i18n";
import { useRuntime } from "./store/runtime/runtimeStore.ts";

const pinia = createPinia();
const app = createApp(App);

const runtimeStore = useRuntime(pinia);
app.use(pinia);

// 初始化用户信息
runtimeStore.initUserInfo();

app.use(router);

app.use(customDirective)
  .use(i18n)
  .use(ElementPlus, {
    locale: elZhCn,
  });

app.mount("#app");

// 页面卸载时清空所有 WebSocket 连接
window.addEventListener("beforeunload", () => {
  window.electronAPI?.websocket.clearAllConnections().catch((error) => {
    console.error("页面卸载时清理 WebSocket 连接失败:", error);
  });
});

// // 全局拦截 Monaco 等库在销毁阶段触发的 Promise 取消异常，避免刷新/快速切换时控制台报 Uncaught (in promise) Canceled
// window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
//   const reason: unknown = event?.reason;
//   if (reason && typeof reason === 'object') {
//     const err = reason as { name?: string; message?: string };
//     if (err.name === 'Canceled' || err.message === 'Canceled') {
//       event.preventDefault();
//     }
//   }
// });

/*
|--------------------------------------------------------------------------
| 备忘录
|--------------------------------------------------------------------------
| 1.checkApidocIsEqual 判断参数是否发生改变
*/

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
import { initStandaloneDB } from "./cache/db";
import { i18n } from "./i18n";
import { shortcutManager } from "./shortcut/index.ts";
import { useRuntime } from "./store/runtime/runtime.ts";
import { usePermissionStore } from "./store/permission";


shortcutManager.init();
const pinia = createPinia();
const app = createApp(App);


// 在 app.use(pinia) 之前如需使用 store，必须将 pinia 实例显式传入
const runtimeStore = useRuntime(pinia);
if (runtimeStore.networkMode === 'offline') {
  try { await initStandaloneDB(); }
  catch (e) { console.error("离线数据库初始化失败：", e); }
}
app.use(pinia);

// 初始化权限信息
const permissionStore = usePermissionStore();
permissionStore.initUserInfo();

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

// 全局拦截 Monaco 等库在销毁阶段触发的 Promise 取消异常，避免刷新/快速切换时控制台报 Uncaught (in promise) Canceled
window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  const reason: unknown = event?.reason;
  if (reason && typeof reason === 'object') {
    const err = reason as { name?: string; message?: string };
    if (err.name === 'Canceled' || err.message === 'Canceled') {
      event.preventDefault();
    }
  }
});

/*
|--------------------------------------------------------------------------
| 备忘录
|--------------------------------------------------------------------------
| 1.checkApidocIsEqual 判断参数是否发生改变
*/

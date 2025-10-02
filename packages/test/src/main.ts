import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import { pinia } from "./stores";
import { mockApi } from "./mock/api";
import "./style.css";

// 初始化 Mock 数据
mockApi.initializeMockData();

const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.use(pinia);

app.mount("#app");
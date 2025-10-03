import { createApp } from "vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import App from "./App.vue";
import router from "./router";
import { pinia } from "./stores";
import "./style.css";

const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.use(pinia);

app.mount("#app");
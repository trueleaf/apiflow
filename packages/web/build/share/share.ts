import { createApp } from 'vue'
import ShareComponent from '../../src/renderer/pages/share/Share.vue'
import { createPinia } from 'pinia';
import { zhCn } from 'element-plus/es/locale/index.mjs';
import { customDirective } from '../../src/renderer/directive/directive';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
import { router } from '../../src/renderer/router';
import '../../src/renderer/assets/css/reset.css'
import '../../src/renderer/assets/css/global.css'
import '../../src/renderer/assets/css/theme/default.css'
import '../../src/renderer/assets/css/theme/dark.css'
import '../../src/renderer/assets/css/utilities.css'
import '../../src/renderer/assets/font/iconfont.css'
import '../../src/renderer/assets/font/iconfont.js'
import '../../src/renderer/assets/js/beauty.min.js'
import { i18n } from '../../src/renderer/i18n';

const pinia = createPinia();
const app = createApp(ShareComponent);

app.use(pinia);
app.use(customDirective);
app.use(i18n);
app.use(ElementPlus, { locale: zhCn });
app.use(router);
app.mount('#app');

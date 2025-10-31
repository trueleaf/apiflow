import { createApp } from 'vue'
import ShareComponent from '../../src/renderer/pages/share/Share.vue'
import { createPinia } from 'pinia';
import { zhCn } from 'element-plus/es/locale/index.mjs';
import { customDirective } from '../../src/renderer/directive/directive';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css'
import { router } from '../../src/renderer/router';
import '../../src/renderer/assets/css/index.css'
import '../../src/renderer/assets/font/inline-font.css'
import '../../src/renderer/assets/font/iconfont.js'
import '../../src/renderer/assets/js/beauty.min.js'
import { i18n } from '../../src/renderer/i18n';

const pinia = createPinia();
const app = createApp(ShareComponent);

app.use(pinia).use(customDirective).use(i18n).use(ElementPlus, { locale: zhCn }).use(router).mount('#app')

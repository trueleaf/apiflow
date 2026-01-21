import { createApp } from 'vue'
import ShareComponent from '../../src/renderer/pages/share/Share.vue'
import { createPinia } from 'pinia';
import { customDirective } from '../../src/renderer/directive/directive';
import '../../src/renderer/assets/css/reset.css'
import '../../src/renderer/assets/css/global.css'
import '../../src/renderer/assets/css/theme/default.css'
import '../../src/renderer/assets/css/utilities.css'
import '../../src/renderer/assets/font/iconfont.css'
import '../../src/renderer/assets/font/iconfont.js'
import '../../src/renderer/assets/js/beauty.min.js'
import { i18n } from '../../src/renderer/i18n';
import Prism from 'prismjs'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-markup'
import 'prismjs/components/prism-javascript'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-css'
import 'prismjs/themes/prism.css'

if (typeof window !== 'undefined') {
  (window as Record<string, unknown>).Prism = Prism
}

const pinia = createPinia();
const app = createApp(ShareComponent);

app.use(pinia);
app.use(customDirective);
app.use(i18n);
app.mount('#app');

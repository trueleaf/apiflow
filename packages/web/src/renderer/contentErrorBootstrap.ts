import { createApp } from 'vue';
import i18n from './i18n';
import ContentError from './platform/tauri/ContentError.vue';

createApp(ContentError).use(i18n).mount('#app');

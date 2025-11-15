import { createApp } from 'vue'
import Header from './Header.vue'
import '@/assets/font/iconfont.css'
import '@/assets/font/iconfont.js'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import ElementPlus from 'element-plus';
import { i18n } from '@/i18n';
import { createPinia } from 'pinia'
import { watch } from 'vue'
import { useAppSettings } from '@/store/appSettings/appSettingsStore'

const pinia = createPinia()
const app = createApp(Header);

app.use(pinia).use(i18n).use(ElementPlus, { locale: zhCn });
app.mount('#header')

const appSettingsStore = useAppSettings()
watch(
  () => appSettingsStore.appTitle,
  (newTitle) => {
    document.title = newTitle
  },
  { immediate: true }
)


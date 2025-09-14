import { createI18n } from 'vue-i18n';
import type { Language } from '@src/types';

// 导入语言资源
import zhCn from './zh-cn';
import zhTw from './zh-tw';
import en from './en';
import ja from './ja';

// 语言资源配置
const messages = {
  'zh-cn': zhCn,
  'zh-tw': zhTw,
  'en': en,
  'ja': ja,
};

// 获取初始语言
const getInitialLanguage = (): Language => {
  const savedLanguage = localStorage.getItem('language') as Language;
  return savedLanguage || 'zh-cn';
};

// 创建 i18n 实例
export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getInitialLanguage(),
  fallbackLocale: 'zh-cn',
  messages,
  globalInjection: true, // 全局注入 $t
  silentTranslationWarn: true, // 静默翻译警告
  silentFallbackWarn: true, // 静默回退警告
});

// 切换语言的辅助函数
export const changeLanguage = (language: Language) => {
  i18n.global.locale.value = language;
  localStorage.setItem('language', language);
};

// 获取当前语言
export const getCurrentLanguage = (): Language => {
  return i18n.global.locale.value as Language;
};

// 支持的语言列表
export const supportedLanguages = [
  { code: 'zh-cn' as Language, name: '简体中文', flag: '🇨🇳' },
  { code: 'zh-tw' as Language, name: '繁體中文', flag: '🇹🇼' },
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
];

export default i18n;

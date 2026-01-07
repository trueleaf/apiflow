import { createI18n } from 'vue-i18n';
import type { Language } from '@src/types';
import { runtimeCache } from '@/cache/runtime/runtimeCache';
import { francAll } from 'franc-min';

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
  return runtimeCache.getLanguage();
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
  runtimeCache.setLanguage(language);
};

// 使用指定语言翻译文本（不改变界面语言）
export const translateWithLocale = (key: string, locale: Language, params?: Record<string, unknown>): string => {
  const targetMessages = messages[locale];
  if (!targetMessages) {
    return key;
  }
  
  const keys = key.split('.');
  let value: unknown = targetMessages;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // 简单的参数替换
  if (params) {
    return value.replace(/\{(\w+)\}/g, (_, paramKey) => {
      return params[paramKey] !== undefined ? String(params[paramKey]) : `{${paramKey}}`;
    });
  }
  
  return value;
};

// 检测输入文本的语言
export const detectInputLanguage = (text: string, fallbackLocale: Language): Language => {
  // 如果文本太短，使用界面语言
  if (!text || text.trim().length < 10) {
    return fallbackLocale;
  }
  
  // 使用 franc 检测语言
  const detected = francAll(text, { minLength: 10 });
  
  if (!detected || detected.length === 0) {
    return fallbackLocale;
  }
  
  // 获取最可能的语言代码（ISO 639-3）
  const [topLang, confidence] = detected[0];
  
  // 置信度太低时使用界面语言
  if (confidence < 0.5) {
    return fallbackLocale;
  }
  
  // 映射 ISO 639-3 到 Language 类型
  const languageMap: Record<string, Language> = {
    'cmn': 'zh-cn', // 普通话
    'zho': 'zh-cn', // 中文
    'eng': 'en',    // 英语
    'jpn': 'ja',    // 日语
  };
  
  const mappedLang = languageMap[topLang];
  return mappedLang || fallbackLocale;
};

export default i18n;

import { App, ref, Ref } from 'vue';
import { Language } from '@src/types/global';
import zhCn from './zh-cn'
import zhTw from './zh-tw'
import en from './en'

//=========================================================================//
let localLanguage = localStorage.getItem('language') as (Language | null);
if (!localLanguage) {
  localLanguage = 'zh-cn';
} else if (localLanguage !== 'en' && localLanguage !== 'ja' && localLanguage !== 'zh-cn' && localLanguage !== 'zh-tw') {
  localLanguage = 'zh-cn';
}
const languageType: Ref<Language> = ref(localLanguage);
//=========================================================================//
function replaceVariable(rawStr: string, replacement?: Record<string, string>): string {
  if (!rawStr) {
    return ''
  }
  const hasSlot = rawStr.match(/\{[^}]+\}/g);
  let result = ''
  if (hasSlot && replacement) {
    result = rawStr.replace(/\{([^}]+)\}/g, (foo, key) => {
      const replaceVal = replacement[key];
      return replaceVal || '';
    })
  } else {
    return rawStr;
  }
  return `${result}`;
}

export const $t = (str: string, replacement?: Record<string, string>): string => {
  const cnValue = (zhCn as Record<string, string>)[str];
  if (languageType.value === 'zh-cn') {
    const mapedStr = (zhCn as Record<string, string>)[str] || '';
    if (!mapedStr) {
      console.warn('未匹配到当前字段的翻译信息', str)
      return str
    }
    return replaceVariable(mapedStr, replacement);
  }
  if (languageType.value === 'zh-tw') {
    const mapedStr = (zhTw as Record<string, string>)[str] || (zhCn as Record<string, string>)[str];
    if (!mapedStr) {
      console.warn('未匹配到當前字段的翻譯信息', str)
    }
    return replaceVariable(mapedStr, replacement);
  }
  if (languageType.value === 'en') {
    const mapedStr = (en as Record<string, string>)[str] || (zhCn as Record<string, string>)[str];
    if (!mapedStr) {
      console.warn('translation error', str)
    }
    return replaceVariable(mapedStr, replacement);
  }
  return cnValue;
}
export default {
  install(app: App): void {
    app.config.globalProperties.$t = $t;
  },
}
//改变当前语言
export const changeLanguage = (type: Language): void => {
  languageType.value = type;
  localStorage.setItem('language', type);
}

import {getRequestConfig} from 'next-intl/server';

// 可以从共享配置中导入
export const locales = ['zh', 'en'] as const;

export default getRequestConfig(async ({requestLocale}) => {
  // 这通常对应于 `[locale]` 段
  let locale = await requestLocale;

  // 确保使用有效的语言环境
  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = 'zh';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

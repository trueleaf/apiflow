import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  // 支持的所有语言环境列表
  locales: ['zh', 'en'],

  // 当没有语言环境匹配时使用
  defaultLocale: 'zh',

  // 自动检测用户浏览器语言设置
  localeDetection: true
});

export const config = {
  // 仅匹配国际化路径名
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};

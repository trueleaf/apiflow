'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';

export const ClientWelcome = () => {
  const t = useTranslations('Console');

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.log(
        '%cApiflow',
        `
  color: #00c6ff;
  font-size: 48px;
  font-weight: bold;
  text-shadow:
    1px 1px 0 #000,
    2px 2px 0 #333,
    3px 3px 0 #666;
  `
      );
      console.log(`
${t('website')}：https://apiflow.cn

${t('github')}：https://github.com/trueleaf/apiflow

${t('gitee')}：https://gitee.com/wildsell/apiflow

${t('lastUpdate')}：${__APP_BUILD_TIME__}
      `);
    }
  }, [t]);

  return null;
};

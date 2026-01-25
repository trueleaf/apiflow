import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import pkg from './package.json';

dayjs.extend(utc);
dayjs.extend(timezone);

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    APP_VERSION: pkg.version,
    APP_BUILD_TIME: dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'),
  },
};

export default withNextIntl(nextConfig);

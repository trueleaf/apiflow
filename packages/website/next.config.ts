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
  webpack: (config) => {
    config.plugins.push(
      new config.webpack.DefinePlugin({
        __APP_VERSION__: JSON.stringify(pkg.version),
        __APP_BUILD_TIME__: JSON.stringify(dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss')),
      })
    );
    return config;
  },
};

export default withNextIntl(nextConfig);

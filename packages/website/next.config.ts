import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    APP_VERSION: process.env.APP_VERSION || '0.9.81',
    APP_BUILD_TIME: new Date().toISOString(),
  },
};

export default withNextIntl(nextConfig);
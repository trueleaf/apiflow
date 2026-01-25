import createNextIntlPlugin from 'next-intl/plugin';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

dayjs.extend(utc);
dayjs.extend(timezone);

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    APP_VERSION: pkg.version,
    APP_BUILD_TIME: dayjs().tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm:ss'),
  },
};

export default withNextIntl(nextConfig);

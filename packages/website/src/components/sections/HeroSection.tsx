import Link from 'next/link';
import { Star, Users, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('首页');
  const stats = [
    { icon: Users, value: '10K+', label: t('统计.开发者') },
    { icon: Star, value: '4.9/5', label: t('统计.评分') },
    { icon: Zap, value: '99.9%', label: t('统计.正常运行时间') },
  ];

  return (
    <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-left">
            {/* Badge */}
            <div className="inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-800 mb-8">
              {t('徽章')}
            </div>

            {/* Main heading */}
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              {t('标题')}{' '}
              <span className="gradient-text">{t('标题高亮')}</span>
            </h1>

            {/* Subheading */}
            <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600 sm:text-xl">
              {t('副标题')}
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
              <Link
                href="https://github.com/trueleaf/apiflow/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semi text-white shadow-lg hover:bg-blue-700"
              >
                {t('下载离线版本')}
              </Link>
              <Link
                href="https://github.com/trueleaf/apiflow"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-green-600 px-8 py-3 text-base font-semi text-white shadow-lg hover:bg-green-700"
              >
                {t('下载互联网版本')}
              </Link>
            </div>
          </div>

          {/* Right side - Stats */}
          <div className="lg:pl-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:grid-cols-1 lg:gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center lg:justify-start justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 mr-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                      <div className="text-sm text-gray-600">{stat.label}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

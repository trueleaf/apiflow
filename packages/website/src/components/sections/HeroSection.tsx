import Link from 'next/link';
import { WifiOff, Users, Shield, Download, Gift, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations();
  const features = [
    { icon: WifiOff, title: t('离线运行'), description: t('除协作外可以使用所有功能') },
    { icon: Users, title: t('团队协作'), description: t('我们提供实时协作功能') },
    { icon: Shield, title: t('本地部署'), description: t('所有功能支持Docker本地部署') },
    { icon: Download, title: t('数据自由'), description: t('可随时导出数据到其他工具') },
    { icon: Gift, title: t('完全免费'), description: t('所有核心功能永久免费使用') },
    { icon: Globe, title: t('协议支持'), description: t('支持HTTP、WebSocket等协议') },
  ];

  return (
    <section className="relative pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
      {/* 背景光效 */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-background [background:radial-gradient(125%_125%_at_50%_10%,#fff_40%,#63e_100%)] opacity-20 dark:[background:radial-gradient(125%_125%_at_50%_10%,#000_40%,#63e_100%)]"></div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 左侧 - 内容 */}
          <div className="text-left">
            {/* 主标题 */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              <span>{t('Postman 和 Apifox 的')}{' '}</span>
              <span className="gradient-text">{t('免费开源替代品')}</span>
            </h1>

            {/* 副标题 */}
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              <span>{t('在 Vibe Coding 的支持下，个人开发者或小团队同样能够构建媲美企业级应用的产品，欢迎 Star，支持我们走得更远')}</span>
            </p>

            {/* CTA按钮 */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="https://github.com/trueleaf/apiflow/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-primary px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 hover:shadow-blue-500/40 transition-all duration-200"
              >
                {t('下载客户端')}
              </Link>
              <Link
                href="https://app.apiflow.cn"
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm px-8 py-3.5 text-base font-semibold text-foreground shadow-sm ring-1 ring-inset ring-border hover:bg-muted/80 transition-all duration-200"
              >
                {t('使用 Web 版')}
              </Link>
            </div>
          </div>

          {/* 右侧 - 特色功能 */}
          <div className="lg:pl-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex items-start p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 mr-3 flex-shrink-0">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-gray-900 mb-1">{feature.title}</div>
                      <div className="text-sm text-gray-600 leading-relaxed">{feature.description}</div>
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

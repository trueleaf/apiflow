import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Bot, Database, Zap, Users } from 'lucide-react';

export default function ProductShowcase() {
  const t = useTranslations();
  const locale = useLocale();

  const features = [
    {
      key: 'agent',
      icon: Bot,
      title: t('产品展示_Agent_标题'),
      image: `/${locale}/agent.gif`
    },
    {
      key: 'sse',
      icon: Zap,
      title: t('产品展示_SSE_标题'),
      image: `/${locale}/sse.gif`
    }
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {t('产品展示_标题')}
          </h2>
        </div>

        <div className="space-y-24">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            
            return (
              <div key={feature.key} className="flex flex-col items-center gap-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    {feature.title}
                  </h3>
                </div>
                
                <div className="w-full max-w-5xl">
                  <div className="relative rounded-xl overflow-hidden shadow-2xl border border-border/50 bg-card group hover:shadow-primary/10 transition-shadow duration-500">
                    <div className="aspect-[16/10] relative">
                        <Image
                          src={feature.image}
                          alt={feature.title}
                          fill
                          className="object-contain bg-background"
                          unoptimized
                        />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

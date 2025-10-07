import { MessageCircle, Users, Video } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutUsSection() {
  const t = useTranslations();

  const channels = [
    { icon: Video, label: t('社区渠道_B站') },
    { icon: Users, label: t('社区渠道_QQ群') },
    { icon: MessageCircle, label: t('社区渠道_微信群') },
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {t('关于我们_标题')}
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
            {t('关于我们_副标题')}
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {channels.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-2xl border border-gray-200 bg-white/80 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                <Icon className="h-6 w-6" />
              </div>
              <div className="mt-4 text-center text-base font-semibold text-gray-900">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

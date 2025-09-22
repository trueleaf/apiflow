import { getTranslations } from "next-intl/server";

export default async function ProductShowcasePage() {
  const t = await getTranslations();

  return (
    <main className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {t('产品展示_标题')}
        </h1>
        <p className="text-lg text-gray-600">
          {t('产品展示_描述')}
        </p>
      </div>
    </main>
  );
}

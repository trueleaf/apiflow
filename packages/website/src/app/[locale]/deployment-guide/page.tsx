import { getTranslations } from 'next-intl/server';

export default async function DeploymentGuidePage() {
  const t = await getTranslations();

  const prerequisites = [
    t('部署教程_章节_准备工作_要点1'),
    t('部署教程_章节_准备工作_要点2'),
    t('部署教程_章节_准备工作_要点3')
  ];

  const deploymentSteps = [
    t('部署教程_章节_部署流程_步骤1'),
    t('部署教程_章节_部署流程_步骤2'),
    t('部署教程_章节_部署流程_步骤3')
  ];

  const operations = [
    t('部署教程_章节_运维_要点1'),
    t('部署教程_章节_运维_要点2'),
    t('部署教程_章节_运维_要点3')
  ];

  const troubleshooting = [
    t('部署教程_章节_排障_要点1'),
    t('部署教程_章节_排障_要点2'),
    t('部署教程_章节_排障_要点3')
  ];

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-16">
        <header className="space-y-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('部署教程_标题')}
          </h1>
          <p className="text-base text-gray-600 sm:text-lg">
            {t('部署教程_简介')}
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('部署教程_章节_准备工作_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('部署教程_章节_准备工作_描述')}
          </p>
          <ul className="list-disc space-y-2 pl-6 text-base text-gray-600">
            {prerequisites.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('部署教程_章节_部署流程_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('部署教程_章节_部署流程_描述')}
          </p>
          <ol className="list-decimal space-y-2 pl-6 text-base text-gray-600">
            {deploymentSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('部署教程_章节_运维_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('部署教程_章节_运维_描述')}
          </p>
          <ul className="list-disc space-y-2 pl-6 text-base text-gray-600">
            {operations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('部署教程_章节_排障_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('部署教程_章节_排障_描述')}
          </p>
          <ul className="list-disc space-y-2 pl-6 text-base text-gray-600">
            {troubleshooting.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

import { getTranslations } from 'next-intl/server';

export default async function UsageDocsPage() {
  const t = await getTranslations();

  const docStructure = [
    t('使用文档_章节_文档结构_要点1'),
    t('使用文档_章节_文档结构_要点2'),
    t('使用文档_章节_文档结构_要点3')
  ];

  const quickStartSteps = [
    t('使用文档_章节_快速开始_步骤1'),
    t('使用文档_章节_快速开始_步骤2'),
    t('使用文档_章节_快速开始_步骤3')
  ];

  const workflows = [
    t('使用文档_章节_深入探索_要点1'),
    t('使用文档_章节_深入探索_要点2'),
    t('使用文档_章节_深入探索_要点3')
  ];

  const faqs = [
    {
      question: t('使用文档_章节_常见问题_Q1'),
      answer: t('使用文档_章节_常见问题_A1')
    },
    {
      question: t('使用文档_章节_常见问题_Q2'),
      answer: t('使用文档_章节_常见问题_A2')
    },
    {
      question: t('使用文档_章节_常见问题_Q3'),
      answer: t('使用文档_章节_常见问题_A3')
    }
  ];

  return (
    <div className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-16">
        <header className="space-y-4 text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            {t('使用文档_标题')}
          </h1>
          <p className="text-base text-gray-600 sm:text-lg">
            {t('使用文档_简介')}
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('使用文档_章节_文档结构_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('使用文档_章节_文档结构_描述')}
          </p>
          <ul className="list-disc space-y-2 pl-6 text-base text-gray-600">
            {docStructure.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('使用文档_章节_快速开始_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('使用文档_章节_快速开始_描述')}
          </p>
          <ol className="list-decimal space-y-2 pl-6 text-base text-gray-600">
            {quickStartSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('使用文档_章节_深入探索_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('使用文档_章节_深入探索_描述')}
          </p>
          <ul className="list-disc space-y-2 pl-6 text-base text-gray-600">
            {workflows.map((workflow) => (
              <li key={workflow}>{workflow}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('使用文档_章节_常见问题_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('使用文档_章节_常见问题_描述')}
          </p>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-lg border border-gray-200 p-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {faq.question}
                </h3>
                <p className="mt-2 text-base text-gray-600">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

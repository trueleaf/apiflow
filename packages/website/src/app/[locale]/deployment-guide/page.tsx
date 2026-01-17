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

  const envVarsRequired = [
    { key: 'MONGO_ROOT_USERNAME', desc: t('部署教程_章节_环境变量_必需_1'), default: 'admin' },
    { key: 'MONGO_ROOT_PASSWORD', desc: t('部署教程_章节_环境变量_必需_2'), default: t('部署教程_章节_环境变量_必需_2_默认') },
    { key: 'MONGO_DATABASE', desc: t('部署教程_章节_环境变量_必需_3'), default: 'apiflow' }
  ];

  const envVarsAI = [
    { key: 'DEEPSEEK_API_KEY', desc: t('部署教程_章节_环境变量_AI_1') },
    { key: 'DEEPSEEK_BASE_URL', desc: t('部署教程_章节_环境变量_AI_2'), default: 'https://api.deepseek.com/v1/chat/completions' },
    { key: 'DEEPSEEK_MODEL', desc: t('部署教程_章节_环境变量_AI_3'), default: 'deepseek-chat' }
  ];

  const envVarsMail = [
    { key: 'EMAIL_REGISTER_ENABLE', desc: t('部署教程_章节_环境变量_邮件_1'), default: 'false' },
    { key: 'ALI_ACCESS_KEY_ID', desc: t('部署教程_章节_环境变量_邮件_2') },
    { key: 'ALI_ACCESS_KEY_SECRET', desc: t('部署教程_章节_环境变量_邮件_3') },
    { key: 'ALI_ACCOUNT_NAME', desc: t('部署教程_章节_环境变量_邮件_4') }
  ];

  const securitySteps = [
    t('部署教程_章节_安全_要点1'),
    t('部署教程_章节_安全_要点2'),
    t('部署教程_章节_安全_要点3'),
    t('部署教程_章节_安全_要点4')
  ];

  const backupSteps = [
    t('部署教程_章节_备份_步骤1'),
    t('部署教程_章节_备份_步骤2'),
    t('部署教程_章节_备份_步骤3')
  ];

  const monitoringTips = [
    t('部署教程_章节_监控_要点1'),
    t('部署教程_章节_监控_要点2'),
    t('部署教程_章节_监控_要点3')
  ];

  const operations = [
    t('部署教程_章节_运维_要点1'),
    t('部署教程_章节_运维_要点2'),
    t('部署教程_章节_运维_要点3')
  ];

  const troubleshooting = [
    { title: t('部署教程_章节_排障_问题1_标题'), desc: t('部署教程_章节_排障_问题1_描述') },
    { title: t('部署教程_章节_排障_问题2_标题'), desc: t('部署教程_章节_排障_问题2_描述') },
    { title: t('部署教程_章节_排障_问题3_标题'), desc: t('部署教程_章节_排障_问题3_描述') },
    { title: t('部署教程_章节_排障_问题4_标题'), desc: t('部署教程_章节_排障_问题4_描述') },
    { title: t('部署教程_章节_排障_问题5_标题'), desc: t('部署教程_章节_排障_问题5_描述') }
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
            {t('部署教程_章节_环境变量_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('部署教程_章节_环境变量_描述')}
          </p>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {t('部署教程_章节_环境变量_必需_标题')}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">{t('部署教程_表格_变量名')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">{t('部署教程_表格_说明')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">{t('部署教程_表格_默认值')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {envVarsRequired.map((item, index) => (
                      <tr key={item.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900 border-b">{item.key}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">{item.desc}</td>
                        <td className="px-4 py-2 text-sm font-mono text-gray-500 border-b">{item.default}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {t('部署教程_章节_环境变量_AI_标题')}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">{t('部署教程_表格_变量名')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">{t('部署教程_表格_说明')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">{t('部署教程_表格_默认值')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {envVarsAI.map((item, index) => (
                      <tr key={item.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900 border-b">{item.key}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">{item.desc}</td>
                        <td className="px-4 py-2 text-sm font-mono text-gray-500 border-b">{item.default || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                {t('部署教程_章节_环境变量_邮件_标题')}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">{t('部署教程_表格_变量名')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">{t('部署教程_表格_说明')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-b">{t('部署教程_表格_默认值')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {envVarsMail.map((item, index) => (
                      <tr key={item.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-2 text-sm font-mono text-gray-900 border-b">{item.key}</td>
                        <td className="px-4 py-2 text-sm text-gray-600 border-b">{item.desc}</td>
                        <td className="px-4 py-2 text-sm font-mono text-gray-500 border-b">{item.default || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('部署教程_章节_安全_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('部署教程_章节_安全_描述')}
          </p>
          <ul className="list-disc space-y-2 pl-6 text-base text-gray-600">
            {securitySteps.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('部署教程_章节_备份_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('部署教程_章节_备份_描述')}
          </p>
          <ol className="list-decimal space-y-2 pl-6 text-base text-gray-600">
            {backupSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t('部署教程_章节_监控_标题')}
          </h2>
          <p className="text-base text-gray-600">
            {t('部署教程_章节_监控_描述')}
          </p>
          <ul className="list-disc space-y-2 pl-6 text-base text-gray-600">
            {monitoringTips.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
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
          <div className="space-y-4">
            {troubleshooting.map((item) => (
              <div key={item.title} className="border-l-4 border-blue-500 pl-4 py-2">
                <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

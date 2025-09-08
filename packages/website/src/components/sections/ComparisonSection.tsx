import React from 'react';
import { Check, X, Zap, Shield, Users, Code } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ComparisonSection() {
  const t = useTranslations('对比');
  const features = [
    {
      category: 'Core Features',
      items: [
        { feature: 'API Testing & Documentation', apiflow: true, postman: true, apifox: true },
        { feature: 'Real-time Collaboration', apiflow: true, postman: 'limited', apifox: true },
        { feature: 'Advanced Mock Servers', apiflow: true, postman: 'paid', apifox: true },
        { feature: 'Automated Testing Workflows', apiflow: true, postman: 'paid', apifox: 'limited' },
        { feature: 'GraphQL Support', apiflow: true, postman: true, apifox: true },
      ]
    },
    {
      category: 'Developer Experience',
      items: [
        { feature: 'Intuitive Interface', apiflow: true, postman: 'good', apifox: 'good' },
        { feature: 'Fast Performance', apiflow: true, postman: 'slow', apifox: 'good' },
        { feature: 'Offline Mode', apiflow: true, postman: true, apifox: 'limited' },
        { feature: 'Custom Themes', apiflow: true, postman: false, apifox: 'limited' },
        { feature: 'Plugin Ecosystem', apiflow: true, postman: true, apifox: 'limited' },
      ]
    },
    {
      category: 'Enterprise',
      items: [
        { feature: 'SSO Integration', apiflow: true, postman: 'paid', apifox: 'paid' },
        { feature: 'Advanced Security', apiflow: true, postman: 'paid', apifox: 'limited' },
        { feature: 'Custom Deployment', apiflow: true, postman: 'enterprise', apifox: false },
        { feature: 'Priority Support', apiflow: true, postman: 'paid', apifox: 'paid' },
        { feature: 'Compliance Ready', apiflow: true, postman: 'enterprise', apifox: 'limited' },
      ]
    }
  ];

  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-green-600" />;
    } else if (value === false) {
      return <X className="h-5 w-5 text-red-500" />;
    } else {
      return <span className="text-xs text-yellow-600 font-medium">{value}</span>;
    }
  };

  const highlights = [
    {
      icon: Zap,
      title: t('亮点.更快.标题'),
      description: t('亮点.更快.描述')
    },
    {
      icon: Shield,
      title: t('亮点.企业级就绪.标题'),
      description: t('亮点.企业级就绪.描述')
    },
    {
      icon: Users,
      title: t('亮点.团队协作.标题'),
      description: t('亮点.团队协作.描述')
    },
    {
      icon: Code,
      title: t('亮点.开发者优先.标题'),
      description: t('亮点.开发者优先.描述')
    }
  ];

  return (
    <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {/* {t('标题')} */}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            {t('副标题')}
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {highlights.map((highlight, index) => {
            const Icon = highlight.icon;
            return (
              <div key={index} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-blue-600 mb-4">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{highlight.title}</h3>
                <p className="text-gray-600">{highlight.description}</p>
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-purple-600">
            <h3 className="text-2xl font-bold text-white text-center">
              {t('表格标题')}
            </h3>
            <p className="text-blue-100 text-center mt-2">
              {t('表格副标题')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Feature
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">
                    APIFlow
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    Postman
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                    Apifox
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {features.map((category, categoryIndex) => (
                  <React.Fragment key={`category-group-${categoryIndex}`}>
                    <tr key={`category-${categoryIndex}`} className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-3 text-sm font-semibold text-gray-700">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <tr key={`${categoryIndex}-${itemIndex}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.feature}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {renderFeatureValue(item.apiflow)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {renderFeatureValue(item.postman)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {renderFeatureValue(item.apifox)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-6 bg-blue-50 text-center">
            <p className="text-sm text-gray-600 mb-4">
              {t('准备体验')}
            </p>
            <button className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-200">
              {t('开始试用')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

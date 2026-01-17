import React from 'react';
import { Check, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

export default function ComparisonSection() {
  const t = useTranslations();
  const locale = useLocale();
  const shouldShowHoppscotch = locale.startsWith('zh');

  const features = [
    {
      category: t('核心优势对比'),
      items: [
        { feature: t('是否开源'), apiflow: true, postman: false, hoppscotch: true, apifox: false },
        { feature: t('是否免费'), apiflow: true, postman: t('有限'), hoppscotch: true, apifox: t('limit(公网版免费)') },
        { feature: t('是否支持本地部署'), apiflow: true, postman: false, hoppscotch: true, apifox: t('付费') },
      ],
    },
    {
      category: t('HTTP请求支持'),
      items: [
        { feature: t('基本 HTTP 请求方法支持 (GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS)'), apiflow: true, postman:  true, hoppscotch: true, apifox:  true },
        { feature: 'HTTP/1.1', apiflow: true, postman: true, hoppscotch: true, apifox: true },
        { feature: 'HTTP/2', apiflow: false, postman: true, hoppscotch: false, apifox: true },
        { feature: t('query参数、路径参数'), apiflow: true, postman: true, hoppscotch: true, apifox: true },
        { feature: t('body参数, json、formData、urlencoded、binary'), apiflow: true, postman: true, hoppscotch: true, apifox: true },
        { feature: t('请求头自动添加Content-Type'), apiflow: true, postman: true, hoppscotch: true, apifox: true },
        { feature: t('Cookies管理'), apiflow: true, postman: true, hoppscotch: t('limit(浏览器限制)'), apifox: true },
        { feature: t('前置脚本/后置脚本'), apiflow: true, postman: true, hoppscotch: true, apifox: true },
        { feature: t('调试本地服务 /跨域 (CORS / 本地 API)'), apiflow: true, postman: true, hoppscotch: t('limit(浏览器限制)'), apifox: true },
      ],
    },
    {
      category: t('其他协议支持'),
      items: [
        { feature: 'WebSocket', apiflow: true, postman: true, hoppscotch: true, apifox: true },
        { feature: 'Socket.IO', apiflow: false, postman: true, hoppscotch: true, apifox: true },
        { feature: 'gRPC', apiflow: false, postman: true, hoppscotch: false, apifox: true },
        { feature: 'MQTT', apiflow: false, postman: false, hoppscotch: false, apifox: true },
      ],
    },
    {
      category: t('历史记录'),
      items: [
        { feature: t('发送请求历史记录'), apiflow: true, postman: true, hoppscotch: true, apifox: true },
        { feature: t('单个节点历史记录'), apiflow: true, postman: t('limit(付费版)'), hoppscotch: '—', apifox: '—' },
        { feature: t('回收站'), apiflow: true, postman: true, hoppscotch: false, apifox: true },
      ],
    },
    {
      category: t('团队协作'),
      items: [
        { feature: t('工作区'), apiflow: true, postman: true, hoppscotch: true, apifox: true },
        { feature: t('角色与权限（RBAC'), apiflow: true, postman: true, hoppscotch: true, apifox: true },
        { feature: t('评论/讨论'), apiflow: false, postman: true, hoppscotch: false, apifox: true },
        { feature: t('审计功能'), apiflow: true, postman: t('limit(付费版)'), hoppscotch: false, apifox: t('limit(付费版)') },
      ],
    },
  ];

  const renderFeatureValue = (value: boolean | string) => {
    if (value === true) {
      return <Check className="h-5 w-5 text-green-600" />;
    }
    if (value === false) {
      return <X className="h-5 w-5 text-red-500" />;
    }
    return (
      <span className="text-xs font-medium text-yellow-600">
        {value}
      </span>
    );
  };



  return (
    <section id="features" className="py-16 sm:py-20 lg:py-18 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 为什么选择 Apiflow */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {t('为什么选择 Apiflow？')}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            {t('在同类产品中，Apiflow 也拥有强大的免费功能。')}
          </p>
          <p className="mx-auto mt-2 max-w-3xl text-lg text-gray-600">
            {t('部分竞品仅在付费版本中支持的功能，Apiflow 在免费版中也能体验。')}
          </p>
        </div>



        {/* 对比表格 */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-8 bg-gradient-to-r from-blue-600 to-purple-600">
            <h3 className="text-2xl font-bold text-white text-center">
              {t('功能对比')}
            </h3>
            <p className="text-blue-100 text-center mt-2">
              {t('我们持续追求卓越，致力于打造更好的产品体验。')}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-base font-semibold text-gray-900">
                    {t('功能')}
                  </th>
                  <th className="px-6 py-4 text-center text-base font-semibold text-blue-600">
                    Apiflow
                  </th>
                  <th className="px-6 py-4 text-center text-base font-semibold text-gray-600">
                    Postman
                  </th>
                  {shouldShowHoppscotch && (
                    <th className="px-6 py-4 text-center text-base font-semibold text-gray-600">
                      Hoppscotch
                    </th>
                  )}
                  <th className="px-6 py-4 text-center text-base font-semibold text-gray-600">
                    Apifox
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {features.map((category, categoryIndex) => (
                  <React.Fragment key={`category-group-${categoryIndex}`}>
                    <tr key={`category-${categoryIndex}`} className="bg-gray-50">
                      <td colSpan={shouldShowHoppscotch ? 5 : 4} className="px-6 py-3 text-sm font-semibold text-gray-700">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <tr key={`${categoryIndex}-${itemIndex}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {item.feature}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            {renderFeatureValue(item.apiflow)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            {renderFeatureValue(item.postman)}
                          </div>
                        </td>
                        {shouldShowHoppscotch && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              {renderFeatureValue(item.hoppscotch)}
                            </div>
                          </td>
                        )}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center">
                            {renderFeatureValue(item.apifox)}
                          </div>
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
              {t('注：部分功能因版本不同可能略有差异')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

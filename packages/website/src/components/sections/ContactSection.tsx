import { Mail, MessageSquare, Phone, MapPin, Clock, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function ContactSection() {
  const t = useTranslations();

  const contactMethods = [
    {
      icon: Mail,
      title: t('联系_方式_邮件_标题'),
      description: t('联系_方式_邮件_描述'),
      contact: 'support@apiflow.cn',
      availability: t('联系_方式_邮件_可用性')
    },
    {
      icon: MessageSquare,
      title: t('联系_方式_聊天_标题'),
      description: t('联系_方式_聊天_描述'),
      contact: t('联系_方式_聊天_联系方式'),
      availability: t('联系_方式_聊天_可用性')
    },
    {
      icon: Phone,
      title: t('联系_方式_电话_标题'),
      description: t('联系_方式_电话_描述'),
      contact: '+1 (555) 123-4567',
      availability: t('联系_方式_电话_可用性')
    },
    {
      icon: MapPin,
      title: t('联系_方式_办公室_标题'),
      description: t('联系_方式_办公室_描述'),
      contact: '123 Tech Street, San Francisco, CA',
      availability: t('联系_方式_办公室_可用性')
    }
  ];

  const faqs = [
    {
      question: t('联系_FAQ_Q1'),
      answer: t('联系_FAQ_A1')
    },
    {
      question: t('联系_FAQ_Q2'),
      answer: t('联系_FAQ_A2')
    },
    {
      question: t('联系_FAQ_Q3'),
      answer: t('联系_FAQ_A3')
    },
    {
      question: t('联系_FAQ_Q4'),
      answer: t('联系_FAQ_A4')
    },
    {
      question: t('联系_FAQ_Q5'),
      answer: t('联系_FAQ_A5')
    },
    {
      question: t('联系_FAQ_Q6'),
      answer: t('联系_FAQ_A6')
    }
  ];

  return (
    <section id="contact" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 版块标题 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {t('联系_标题')}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            {t('联系_副标题')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* 联系表单 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {t('联系_表单_标题')}
            </h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('联系_表单_名')}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                    placeholder={t('联系_表单_名_占位')}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('联系_表单_姓')}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                    placeholder={t('联系_表单_姓_占位')}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('联系_表单_邮箱')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                  placeholder={t('联系_表单_邮箱_占位')}
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('联系_表单_公司')}
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                  placeholder={t('联系_表单_公司_占位')}
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('联系_表单_主题')}
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                >
                  <option value="">{t('联系_主题_占位')}</option>
                  <option value="general">{t('联系_主题_通用咨询')}</option>
                  <option value="support">{t('联系_主题_技术支持')}</option>
                  <option value="sales">{t('联系_主题_产品咨询')}</option>
                  <option value="partnership">{t('联系_主题_合作')}</option>
                  <option value="feedback">{t('联系_主题_反馈')}</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('联系_表单_消息')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                  placeholder={t('联系_表单_消息_占位')}
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-200"
              >
                <Send className="mr-2 h-5 w-5" />
                {t('联系_表单_提交')}
              </button>
            </form>
          </div>

          {/* 联系方式和FAQ */}
          <div className="space-y-8">
            {/* 联系方式 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {t('联系_其他方式_标题')}
              </h3>
              <div className="space-y-6">
                {contactMethods.map((method, index) => {
                  const Icon = method.icon;
                  return (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <h4 className="text-lg font-semibold text-gray-900">{method.title}</h4>
                        <p className="text-gray-600 mb-1">{method.description}</p>
                        <p className="text-blue-600 font-medium">{method.contact}</p>
                        <p className="text-sm text-gray-500">{method.availability}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 快速开始CTA */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold text-white mb-4">
                {t('联系_CTA_标题')}
              </h3>
              <p className="text-blue-100 mb-6">
                {t('联系_CTA_描述')}
              </p>
              <button className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-lg hover:bg-gray-50 transition-all duration-200">
                {t('联系_CTA_按钮')}
              </button>
            </div>
          </div>
        </div>

        {/* FAQ版块 */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            {t('联系_FAQ_标题')}
          </h3>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    {faq.question}
                  </h4>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 营业时间 */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center rounded-full bg-blue-100 px-6 py-3 text-blue-800">
            <Clock className="mr-2 h-5 w-5" />
            <span className="font-medium">{t('联系_支持时间')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

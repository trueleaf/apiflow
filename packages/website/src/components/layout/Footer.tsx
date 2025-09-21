import Link from 'next/link';
import { GitBranch, MessageCircle, Users, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations();
  const footerLinks = {
    product: [
      { name: t('功能'), href: '#features' },
      { name: t('演示'), href: '#demo' },
      { name: t('文档'), href: '#docs' },
    ],
    company: [
      { name: t('关于我们'), href: '#about' },
      { name: t('博客'), href: '#blog' },
      { name: t('招聘'), href: '#careers' },
      { name: t('联系我们'), href: '#contact' },
    ],
    resources: [
      { name: t('帮助中心'), href: '#help' },
      { name: t('API 参考'), href: '#api' },
      { name: t('社区'), href: '#community' },
      { name: t('状态'), href: '#status' },
    ],
    legal: [
      { name: t('隐私政策'), href: '#privacy' },
      { name: t('服务条款'), href: '#terms' },
      { name: t('Cookie 政策'), href: '#cookies' },
      { name: t('安全'), href: '#security' },
    ],
  };

  const socialLinks = [
    { name: 'GitHub', icon: GitBranch, href: '#github' },
    { name: 'Twitter', icon: MessageCircle, href: '#twitter' },
    { name: 'LinkedIn', icon: Users, href: '#linkedin' },
    { name: 'Email', icon: Mail, href: 'mailto:contact@apiflow.com' },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* 品牌部分 */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold">Apiflow</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              {t('开发者喜爱的现代化 API 文档与测试工具。轻松构建、测试和记录您的 API。')}
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <Icon size={20} />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 产品链接 */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('产品')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 公司链接 */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('公司')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 资源链接 */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('资源')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 法律链接 */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('法律')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 底部部分 */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
            </p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">
              {t('为全世界的开发者用 ❤️ 构建')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

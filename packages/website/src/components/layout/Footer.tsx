import Link from 'next/link';
import { GitBranch, MessageCircle, Users, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');
  const footerLinks = {
    product: [
      { name: t('links.features'), href: '#features' },
      { name: t('links.demo'), href: '#demo' },
      { name: t('links.documentation'), href: '#docs' },
    ],
    company: [
      { name: t('links.about'), href: '#about' },
      { name: t('links.blog'), href: '#blog' },
      { name: t('links.careers'), href: '#careers' },
      { name: t('links.contact'), href: '#contact' },
    ],
    resources: [
      { name: t('links.helpCenter'), href: '#help' },
      { name: t('links.apiReference'), href: '#api' },
      { name: t('links.community'), href: '#community' },
      { name: t('links.status'), href: '#status' },
    ],
    legal: [
      { name: t('links.privacy'), href: '#privacy' },
      { name: t('links.terms'), href: '#terms' },
      { name: t('links.cookies'), href: '#cookies' },
      { name: t('links.security'), href: '#security' },
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
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold">APIFlow</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              {t('description')}
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

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('product')}
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

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('company')}
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

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('resources')}
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

          {/* Legal Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              {t('legal')}
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

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t('copyright')}
            </p>
            <p className="text-gray-400 text-sm mt-4 md:mt-0">
              {t('builtWith')}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

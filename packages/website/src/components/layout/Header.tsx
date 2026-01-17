'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import GitHubStars from '@/components/ui/GitHubStars';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations();
  const locale = useLocale();

  const navigation = [
    { name: t('首页'), href: `/${locale}` },
    // { name: t('产品展示'), href: `/${locale}/product-showcase` },
    // { name: t('使用文档'), href: `/${locale}/usage-docs` },
    // { name: t('部署教程'), href: `/${locale}/deployment-guide` },
  ];

  const repositoryLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/trueleaf/apiflow',
      icon: '/github.svg',
      showStars: true
    }
  ];

  return (
    <header className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-border z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-4">
          {/* 左侧 - Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Apiflow Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-foreground">Apiflow</span>
            </Link>
          </div>

          {/* 右侧 - 导航和操作 */}
          <div className="flex-1 flex justify-end items-center">
            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center space-x-8 mr-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 font-medium text-sm"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* 仓库链接和语言切换器 */}
            <div className="hidden md:flex items-center space-x-4">
              {/* 仓库链接 */}
              <div className="flex items-center space-x-3">
                {repositoryLinks.map((repo) => (
                  <Link
                    key={repo.name}
                    href={repo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 text-sm"
                  >
                    <Image 
                      src={repo.icon} 
                      alt={`${repo.name} icon`}
                      width={16} 
                      height={16} 
                      className="w-4 h-4" 
                    />
                    {repo.showStars && (
                      <GitHubStars repo="trueleaf/apiflow" className="ml-1" />
                    )}
                  </Link>
                ))}
              </div>

              {/* 语言切换器 */}
              <LanguageSwitcher />
            </div>

            {/* 移动端菜单按钮 */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* 移动端导航 */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* 移动端仓库链接 */}
              <div className="pt-4 border-t border-gray-200">
                <div className="px-3 py-2 text-sm font-medium text-gray-500">
                  Open Source
                </div>
                {repositoryLinks.map((repo) => (
                  <Link
                    key={repo.name}
                    href={repo.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Image 
                      src={repo.icon} 
                      alt={`${repo.name} icon`}
                      width={16} 
                      height={16} 
                      className="w-4 h-4" 
                    />
                    {repo.showStars && (
                      <GitHubStars repo="trueleaf/apiflow" className="ml-auto" />
                    )}
                  </Link>
                ))}
              </div>

              {/* 移动端语言切换器 */}
              <div className="pt-4 px-3">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

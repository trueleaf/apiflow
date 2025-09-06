'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import GitHubStars from '@/components/ui/GitHubStars';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const t = useTranslations('navigation');

  const navigation = [
    { name: t('features'), href: '#features' },
    { name: t('demo'), href: '#demo' },
    { name: t('about'), href: '#about' },
    { name: t('contact'), href: '#contact' },
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
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Apiflow Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="text-xl font-bold text-gray-900">Apiflow</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Repository Links & Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Repository Links */}
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

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
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

              {/* Mobile Repository Links */}
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

              {/* Mobile Language Switcher */}
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

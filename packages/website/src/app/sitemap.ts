import { MetadataRoute } from 'next'

// 定义所有有效的基础路由
const routes = ['', '/deployment-guide', '/product-showcase', '/usage-docs'];
const locales = ['zh', 'en'];
const baseUrl = 'https://apiflow.cn';

export default function sitemap(): MetadataRoute.Sitemap {
  const sitemapList: MetadataRoute.Sitemap = [];

  routes.forEach(route => {
    locales.forEach(locale => {
      sitemapList.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
      });
    });
  });

  return sitemapList;
}

import { Target, Users, Lightbulb, Award } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutSection() {
  const t = useTranslations();

  const values = [
    {
      icon: Target,
      title: t('关于区块_价值观_开发者优先_标题'),
      description: t('关于区块_价值观_开发者优先_描述')
    },
    {
      icon: Users,
      title: t('关于区块_价值观_社区驱动_标题'),
      description: t('关于区块_价值观_社区驱动_描述')
    },
    {
      icon: Lightbulb,
      title: t('关于区块_价值观_创新_标题'),
      description: t('关于区块_价值观_创新_描述')
    },
    {
      icon: Award,
      title: t('关于区块_价值观_卓越_标题'),
      description: t('关于区块_价值观_卓越_描述')
    }
  ];

  const team = [
    {
      name: t('关于区块_团队_成员1_姓名'),
      role: t('关于区块_团队_成员1_角色'),
      bio: t('关于区块_团队_成员1_简介'),
      image: '/api/placeholder/150/150'
    },
    {
      name: t('关于区块_团队_成员2_姓名'),
      role: t('关于区块_团队_成员2_角色'),
      bio: t('关于区块_团队_成员2_简介'),
      image: '/api/placeholder/150/150'
    },
    {
      name: t('关于区块_团队_成员3_姓名'),
      role: t('关于区块_团队_成员3_角色'),
      bio: t('关于区块_团队_成员3_简介'),
      image: '/api/placeholder/150/150'
    },
    {
      name: t('关于区块_团队_成员4_姓名'),
      role: t('关于区块_团队_成员4_角色'),
      bio: t('关于区块_团队_成员4_简介'),
      image: '/api/placeholder/150/150'
    }
  ];

  const milestones = [
    {
      year: '2022',
      title: t('关于区块_历程_2022_标题'),
      description: t('关于区块_历程_2022_描述')
    },
    {
      year: '2023',
      title: t('关于区块_历程_2023_标题'),
      description: t('关于区块_历程_2023_描述')
    },
    {
      year: '2024',
      title: t('关于区块_历程_2024_标题'),
      description: t('关于区块_历程_2024_描述')
    },
    {
      year: '2024',
      title: t('关于区块_历程_2024b_标题'),
      description: t('关于区块_历程_2024b_描述')
    }
  ];

  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 版块标题 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {t('关于区块_标题')}
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            {t('关于区块_简介')}
          </p>
        </div>

        {/* 使命宣言 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12 mb-16">
          <div className="text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              {t('关于区块_使命_标题')}
            </h3>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              {t('关于区块_使命_正文')}
            </p>
          </div>
        </div>

        {/* 价值观 */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            {t('关于区块_价值观_标题')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100 mb-6">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">{value.title}</h4>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 发展历程 */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            {t('关于区块_历程_标题')}
          </h3>
          <div className="relative">
            {/* 时间线 */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-blue-200"></div>
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                      <div className="text-blue-600 font-bold text-lg mb-2">{milestone.year}</div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-3">{milestone.title}</h4>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="relative flex items-center justify-center w-8 h-8">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 团队 */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            {t('关于区块_团队_标题')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative mb-6">
                  <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                    <Users className="w-12 h-12 text-gray-400" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h4>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 加入我们的CTA */}
        <div className="mt-20 text-center">
          <div className="bg-gray-900 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              {t('关于区块_CTA_标题')}
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              {t('关于区块_CTA_描述')}
            </p>
            <button className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-200">
              {t('关于区块_CTA_按钮')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

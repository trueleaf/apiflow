import { Target, Users, Lightbulb, Award } from 'lucide-react';

export default function AboutSection() {
  const values = [
    {
      icon: Target,
      title: 'Developer-First',
      description: 'Every feature is designed with developers in mind. We understand your workflow because we are developers too.'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Our roadmap is shaped by user feedback. We build what developers actually need, not what we think they need.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'We constantly push the boundaries of what\'s possible in API development and testing tools.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for perfection in every detail, from user experience to performance and reliability.'
    }
  ];

  const team = [
    {
      name: 'Alex Johnson',
      role: 'CEO & Co-founder',
      bio: 'Former lead engineer at major tech companies. Passionate about developer tools and API architecture.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Sarah Chen',
      role: 'CTO & Co-founder',
      bio: 'Full-stack developer with 10+ years experience. Expert in distributed systems and API design.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Michael Rodriguez',
      role: 'Head of Product',
      bio: 'Product manager with deep understanding of developer workflows and enterprise needs.',
      image: '/api/placeholder/150/150'
    },
    {
      name: 'Emily Davis',
      role: 'Lead Designer',
      bio: 'UX/UI designer focused on creating intuitive interfaces for complex technical tools.',
      image: '/api/placeholder/150/150'
    }
  ];

  const milestones = [
    {
      year: '2022',
      title: 'Company Founded',
      description: 'Started with a vision to simplify API development for everyone'
    },
    {
      year: '2023',
      title: 'First 1,000 Users',
      description: 'Reached our first milestone with positive feedback from the community'
    },
    {
      year: '2024',
      title: 'Series A Funding',
      description: 'Raised $10M to accelerate product development and team growth'
    },
    {
      year: '2024',
      title: '10,000+ Developers',
      description: 'Growing community of developers using APIFlow daily'
    }
  ];

  return (
    <section id="about" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 版块标题 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            About APIFlow
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            We're on a mission to make API development faster, easier, and more enjoyable 
            for developers around the world.
          </p>
        </div>

        {/* 使命宣言 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 lg:p-12 mb-16">
          <div className="text-center">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
              Our Mission
            </h3>
            <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed">
              To empower developers with the most intuitive, powerful, and collaborative API development 
              platform. We believe that great APIs are the foundation of great software, and we're here 
              to make building them a joy, not a chore.
            </p>
          </div>
        </div>

        {/* 价值观 */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Our Values
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
            Our Journey
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
            Meet Our Team
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
              Join Our Growing Team
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              We're always looking for talented individuals who share our passion for 
              developer tools and want to make a difference.
            </p>
            <button className="inline-flex items-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-200">
              View Open Positions
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Play, Code, Database, Zap, Shield, Users, GitBranch, BarChart3 } from 'lucide-react';

export default function ProductShowcase() {
  const features = [
    {
      icon: Code,
      title: 'Intuitive API Builder',
      description: 'Design and test APIs with our visual interface. No more complex configurations or steep learning curves.',
      image: '/api/placeholder/400/300'
    },
    {
      icon: Database,
      title: 'Smart Mock Servers',
      description: 'Generate realistic mock data automatically. Test your frontend before the backend is ready.',
      image: '/api/placeholder/400/300'
    },
    {
      icon: Zap,
      title: 'Lightning Fast Testing',
      description: 'Run comprehensive API tests in seconds. Automated testing workflows that scale with your team.',
      image: '/api/placeholder/400/300'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Built-in security testing and compliance features. Keep your APIs secure from day one.',
      image: '/api/placeholder/400/300'
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Work together seamlessly. Share collections, sync changes, and collaborate in real-time.',
      image: '/api/placeholder/400/300'
    },
    {
      icon: GitBranch,
      title: 'Version Control Integration',
      description: 'Native Git integration. Track changes, manage versions, and deploy with confidence.',
      image: '/api/placeholder/400/300'
    }
  ];

  const stats = [
    { value: '50%', label: 'Faster API Development' },
    { value: '99.9%', label: 'Uptime Guarantee' },
    { value: '10K+', label: 'Happy Developers' },
    { value: '24/7', label: 'Expert Support' }
  ];

  return (
    <section id="demo" className="py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 版块标题 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            See Apiflow in Action
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            Experience the power of modern API development. From design to deployment, 
            Apiflow streamlines every step of your workflow.
          </p>
        </div>

        {/* 主要演示视频/截图 */}
        <div className="mb-20">
          <div className="relative rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 shadow-2xl overflow-hidden">
            <div className="aspect-[16/9] flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Play className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Interactive Product Demo
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Watch how Apiflow transforms your API development workflow in just 3 minutes
                </p>
                <button className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
            </div>
            
            {/* 增加视觉趣味的浮动UI元素 */}
            <div className="absolute top-6 left-6 bg-white rounded-lg shadow-lg p-4 opacity-90 max-w-xs">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">API Test Passed</div>
                  <div className="text-xs text-gray-500">Response time: 45ms</div>
                </div>
              </div>
            </div>
            
            <div className="absolute top-6 right-6 bg-white rounded-lg shadow-lg p-4 opacity-90">
              <div className="flex items-center space-x-3">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Performance</div>
                  <div className="text-xs text-gray-500">Excellent</div>
                </div>
              </div>
            </div>
            
            <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 opacity-90">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">Team Sync</div>
                  <div className="text-xs text-gray-500">3 members online</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 统计数据 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* 功能展示 */}
        <div className="space-y-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;
            
            return (
              <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${!isEven ? 'lg:flex-row-reverse' : ''}`}>
                <div className="flex-1">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">{feature.description}</p>
                  <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                    Learn more
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="flex-1">
                  <div className="relative rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg overflow-hidden">
                    <div className="aspect-[4/3] flex items-center justify-center">
                      <div className="text-center">
                        <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">Feature Screenshot</p>
                        <p className="text-sm text-gray-400 mt-2">Coming Soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA版块 */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Ready to Transform Your API Workflow?
            </h3>
            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of developers who have already made the switch to Apiflow. 
              Start your free trial today and experience the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="inline-flex items-center rounded-lg bg-white px-8 py-3 text-base font-semibold text-blue-600 shadow-lg hover:bg-gray-50 transition-all duration-200">
                Start Free Trial
              </button>
              <button className="inline-flex items-center rounded-lg border-2 border-white px-8 py-3 text-base font-semibold text-white hover:bg-white hover:text-blue-600 transition-all duration-200">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

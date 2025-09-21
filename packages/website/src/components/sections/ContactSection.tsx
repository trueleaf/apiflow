import { Mail, MessageSquare, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function ContactSection() {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help from our support team',
      contact: 'support@apiflow.com',
      availability: '24/7 response within 4 hours'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with us in real-time',
      contact: 'Available in app',
      availability: 'Mon-Fri, 9 AM - 6 PM PST'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our team',
      contact: '+1 (555) 123-4567',
      availability: 'Enterprise customers only'
    },
    {
      icon: MapPin,
      title: 'Office',
      description: 'Visit us in person',
      contact: '123 Tech Street, San Francisco, CA',
      availability: 'By appointment only'
    }
  ];

  const faqs = [
    {
      question: 'How do I get started with Apiflow?',
      answer: 'Simply sign up for a free account and you can start using Apiflow immediately. No credit card required for the free plan.'
    },
    {
      question: 'Can I import my existing Postman collections?',
      answer: 'Yes! We provide easy import tools to migrate your collections from Postman, Insomnia, and other popular API tools.'
    },
    {
      question: 'Do you offer on-premise deployment?',
      answer: 'Yes, we offer on-premise and private cloud deployment options for Enterprise customers with specific security requirements.'
    },
    {
      question: 'What integrations do you support?',
      answer: 'We integrate with popular tools like GitHub, GitLab, Slack, Jira, and many more. Check our integrations page for the full list.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely. We use enterprise-grade security measures including encryption at rest and in transit, SOC 2 compliance, and regular security audits.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.'
    }
  ];

  return (
    <section id="contact" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 版块标题 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            Get in Touch
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-gray-600">
            Have questions? Need help getting started? Our team is here to support you 
            every step of the way.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* 联系表单 */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Send us a message
            </h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                    placeholder="Doe"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                  placeholder="john@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                  Company (Optional)
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                  placeholder="Your Company"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                >
                  <option value="">Select a topic</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="sales">Sales Question</option>
                  <option value="partnership">Partnership</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors duration-200"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg hover:bg-blue-700 transition-all duration-200"
              >
                <Send className="mr-2 h-5 w-5" />
                Send Message
              </button>
            </form>
          </div>

          {/* 联系方式和FAQ */}
          <div className="space-y-8">
            {/* 联系方式 */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Other ways to reach us
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
                Ready to Get Started?
              </h3>
              <p className="text-blue-100 mb-6">
                Don't wait! Start building better APIs today with our free plan.
              </p>
              <button className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-lg hover:bg-gray-50 transition-all duration-200">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>

        {/* FAQ版块 */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
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
            <span className="font-medium">Support Hours: Monday - Friday, 9 AM - 6 PM PST</span>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Check, Star } from 'lucide-react';

export default function PricingSection() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for individual developers and small projects',
      features: [
        'Up to 5 API collections',
        'Basic testing & documentation',
        'Community support',
        'Standard mock servers',
        'Basic collaboration (2 team members)',
        'API monitoring (basic)',
      ],
      limitations: [
        'Limited to 1,000 requests/month',
        'Basic templates only',
        'Community support only'
      ],
      cta: 'Get Started Free',
      popular: false,
      color: 'gray'
    },
    {
      name: 'Pro',
      price: '$29',
      period: 'per user/month',
      description: 'Ideal for growing teams and professional projects',
      features: [
        'Unlimited API collections',
        'Advanced testing & automation',
        'Priority email support',
        'Advanced mock servers',
        'Team collaboration (up to 10 members)',
        'Advanced API monitoring',
        'Custom environments',
        'Git integration',
        'Advanced reporting',
        'Custom themes',
      ],
      limitations: [],
      cta: 'Start Pro Trial',
      popular: true,
      color: 'blue'
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      description: 'For large organizations with advanced requirements',
      features: [
        'Everything in Pro',
        'Unlimited team members',
        'SSO integration',
        'Advanced security features',
        'Custom deployment options',
        'Dedicated account manager',
        'SLA guarantees',
        'Custom integrations',
        'Advanced compliance features',
        'Priority phone support',
        'Custom training & onboarding',
      ],
      limitations: [],
      cta: 'Contact Sales',
      popular: false,
      color: 'purple'
    }
  ];

  const faqs = [
    {
      question: 'Can I switch plans anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and billing is prorated.'
    },
    {
      question: 'Is there a free trial for paid plans?',
      answer: 'Yes, we offer a 14-day free trial for all paid plans. No credit card required to start.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and can arrange invoicing for enterprise customers.'
    },
    {
      question: 'Do you offer discounts for annual billing?',
      answer: 'Yes, save 20% when you choose annual billing on any paid plan.'
    }
  ];

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 版块标题 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
            Choose the plan that fits your needs. Start free and scale as you grow. 
            No hidden fees, no surprises.
          </p>
        </div>

        {/* 价格卡片 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl bg-card shadow-lg ring-1 ring-border transition-all duration-200 ${
                plan.popular ? 'ring-2 ring-primary scale-105 shadow-xl z-10' : 'hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm">
                    <Star className="mr-1 h-4 w-4 fill-current" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                <p className="mt-2 text-muted-foreground text-sm">{plan.description}</p>
                
                <div className="mt-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && (
                      <span className="ml-2 text-muted-foreground text-sm">/{plan.period}</span>
                    )}
                  </div>
                </div>

                <button
                  className={`mt-8 w-full rounded-lg px-6 py-3 text-base font-semibold transition-all duration-200 cursor-pointer ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:scale-[1.02]'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {plan.cta}
                </button>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.limitations.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm font-medium text-muted-foreground mb-3">Limitations:</p>
                    <ul className="space-y-2">
                      {plan.limitations.map((limitation, limitIndex) => (
                        <li key={limitIndex} className="text-sm text-muted-foreground/80">
                          • {limitation}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 企业版功能 */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Enterprise Features
            </h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Get advanced security, compliance, and support features designed for large organizations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              'Single Sign-On (SSO)',
              'Advanced Security',
              'Custom Deployment',
              'SLA Guarantees',
              'Dedicated Support',
              'Custom Integrations',
              'Compliance Ready',
              'Advanced Analytics'
            ].map((feature, index) => (
              <div key={index} className="flex items-center">
                <Check className="h-5 w-5 text-green-500 mr-3" />
                <span className="text-foreground text-sm font-medium">{feature}</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button className="inline-flex items-center rounded-lg bg-foreground text-background px-8 py-3 text-base font-semibold shadow-lg hover:bg-foreground/90 transition-all duration-200">
              Contact Enterprise Sales
            </button>
          </div>
        </div>

        {/* 常见问题 */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <h3 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h4 className="text-lg font-semibold text-foreground mb-3">
                  {faq.question}
                </h4>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 退款保证 */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center rounded-full bg-green-500/10 px-6 py-3 text-green-600 ring-1 ring-inset ring-green-500/20">
            <Check className="mr-2 h-5 w-5" />
            <span className="font-medium">30-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}

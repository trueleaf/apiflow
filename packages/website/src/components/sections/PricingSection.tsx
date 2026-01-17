import { Check, Star } from 'lucide-react';

export default function PricingSection() {
  const plans = [
    {
      name: 'Community',
      price: '$0',
      period: 'forever',
      description: 'Great for solo developers and small projects',
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
      cta: 'Get started free',
      popular: false,
      color: 'gray'
    },
    {
      name: 'Team',
      price: '$0',
      period: 'forever',
      description: 'For teams that want collaboration and consistency',
      features: [
        'Unlimited API collections',
        'Advanced testing & automation',
        'Community + GitHub support',
        'Advanced mock servers',
        'Team collaboration (up to 10 members)',
        'Advanced API monitoring',
        'Custom environments',
        'Git integration',
        'Advanced reporting',
        'Custom themes',
      ],
      limitations: [],
      cta: 'Get started free',
      popular: true,
      color: 'blue'
    },
    {
      name: 'Organization',
      price: '$0',
      period: 'forever',
      description: 'For larger orgs that need self-hosting and governance',
      features: [
        'Everything in Team',
        'Unlimited team members',
        'SSO integration',
        'Advanced security options',
        'Self-hosted deployment',
        'Custom integrations',
        'Compliance-ready configuration',
        'Documentation and migration guides',
      ],
      limitations: [],
      cta: 'Get started free',
      popular: false,
      color: 'purple'
    }
  ];

  const faqs = [
    {
      question: 'Is Apiflow really free forever?',
      answer: 'Yes. Apiflow is open source, and all core features are free to use—forever.'
    },
    {
      question: 'Do I need a credit card to get started?',
      answer: 'No. You can download Apiflow and start using it right away.'
    },
    {
      question: 'Can I self-host Apiflow?',
      answer: 'Yes. Apiflow supports local and Docker-based deployment so you can run it in your own stack.'
    },
    {
      question: 'How do I get help or support?',
      answer: 'Check the docs first, then reach out through the community channels or GitHub issues for help.'
    }
  ];

  return (
    <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 版块标题 */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Free forever
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
            Apiflow is open source and free to use. Pick the setup that fits your team.
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
                    Recommended
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
              Advanced features (still free)
            </h3>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              More powerful capabilities for teams that need scale, security, and self-hosting.
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
              View docs and deployment guides
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
            <span className="font-medium">Open source. Free forever.</span>
          </div>
        </div>
      </div>
    </section>
  );
}


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap, Star } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: 'Starter',
      price: '$29',
      period: '/month',
      description: 'Perfect for small businesses and startups',
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Up to 5 team members',
        'Basic AI automation',
        'Standard support',
        'Core business tools',
        '10GB storage'
      ],
      popular: false
    },
    {
      name: 'Professional',
      price: '$79',
      period: '/month',
      description: 'Best for growing businesses',
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Up to 25 team members',
        'Advanced AI features',
        'Priority support',
        'All business tools',
        '100GB storage',
        'Custom integrations'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$199',
      period: '/month',
      description: 'For large organizations',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      features: [
        'Unlimited team members',
        'Full AI suite',
        'Dedicated support',
        'Enterprise security',
        'Unlimited storage',
        'Custom development',
        'White-label options'
      ],
      popular: false
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Simple, Transparent Pricing
            </span>
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
            Choose the perfect plan for your business. All plans include our core AI features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card key={index} className={`group relative bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/15 transition-all duration-500 hover:-translate-y-2 ${plan.popular ? 'ring-2 ring-purple-400 transform scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </div>
                </div>
              )}
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <plan.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                <p className="text-white/70 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-white/70">{plan.period}</span>
                </div>

                <Button className={`w-full mb-8 bg-gradient-to-r ${plan.color} hover:opacity-90 transition-opacity`}>
                  Get Started
                </Button>

                <ul className="space-y-3 text-left">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-white/80">
                      <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-white/60 mb-4">Need a custom solution?</p>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white hover:text-slate-900">
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;

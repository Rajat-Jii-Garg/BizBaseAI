
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Rocket, Users, Building2 } from 'lucide-react';

const Solutions = () => {
  const solutions = [
    {
      icon: Rocket,
      title: 'For Startups',
      description: 'Scale your startup with AI-powered tools that grow with you. Get insights, automate processes, and focus on what matters most.',
      features: ['Smart CRM', 'Financial Planning', 'Team Collaboration', 'Growth Analytics'],
      gradient: 'from-blue-500 to-purple-500'
    },
    {
      icon: Users,
      title: 'For Freelancers',
      description: 'Manage clients, projects, and finances effortlessly. Professional tools designed for independent professionals.',
      features: ['Client Management', 'Project Tracking', 'Invoice Generation', 'Time Management'],
      gradient: 'from-green-500 to-teal-500'
    },
    {
      icon: Building2,
      title: 'For Enterprises',
      description: 'Enterprise-grade solutions with advanced AI capabilities. Scale operations and drive innovation across departments.',
      features: ['Advanced Analytics', 'Multi-team Management', 'Custom Workflows', 'Enterprise Security'],
      gradient: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <section id="solutions" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Solutions for{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Every Business
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Whether you're a solo entrepreneur or running a large enterprise, BizBase adapts to your needs.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {solutions.map((solution, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${solution.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <solution.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-gray-900">{solution.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{solution.description}</p>
                <ul className="space-y-2">
                  {solution.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solutions;

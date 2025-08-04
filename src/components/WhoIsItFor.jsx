
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Rocket, Users, Building2, User, Crown, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const WhoIsItFor = () => {
  const audiences = [
    {
      icon: User,
      title: 'Solo Entrepreneurs',
      description: 'Perfect for individual business owners who need to manage everything from one place.',
      features: ['Personal CRM', 'Invoice Management', 'Task Tracking', 'AI Assistant'],
      color: 'from-blue-500 to-cyan-500',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b8d5?w=400&h=300&fit=crop'
    },
    {
      icon: Users,
      title: 'Small Teams',
      description: 'Ideal for growing teams that need collaboration tools and streamlined workflows.',
      features: ['Team Collaboration', 'Project Management', 'Shared Dashboards', 'Team Analytics'],
      color: 'from-green-500 to-emerald-500',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop'
    },
    {
      icon: Rocket,
      title: 'Startups',
      description: 'Scale-ready solution for startups looking to optimize operations and growth.',
      features: ['Growth Analytics', 'Investor Reports', 'Scalable Infrastructure', 'Cost Optimization'],
      color: 'from-purple-500 to-violet-500',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop'
    },
    {
      icon: Building2,
      title: 'SMB & Enterprises',
      description: 'Enterprise-grade features for medium to large businesses with complex needs.',
      features: ['Advanced Security', 'Custom Workflows', 'Multi-department', 'Enterprise Support'],
      color: 'from-orange-500 to-red-500',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=300&fit=crop'
    },
    {
      icon: Crown,
      title: 'Freelancers',
      description: 'Professional tools for freelancers to manage clients and projects efficiently.',
      features: ['Client Portal', 'Time Tracking', 'Proposal Generator', 'Payment Integration'],
      color: 'from-pink-500 to-rose-500',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop'
    },
    {
      icon: Globe,
      title: 'Agencies',
      description: 'Multi-client management system designed for digital and creative agencies.',
      features: ['Client Management', 'Campaign Tracking', 'Resource Planning', 'Performance Reports'],
      color: 'from-indigo-500 to-blue-500',
      image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=300&fit=crop'
    }
  ];

  return (
    <section id="who-is-it-for" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            Who is{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BizBase
            </span>{' '}
            for?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From solo entrepreneurs to large enterprises, BizBase adapts to your business needs and scales with your growth.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {audiences.map((audience, index) => (
            <Card key={index} className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-4 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={audience.image} 
                  alt={audience.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${audience.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                <div className={`absolute top-4 left-4 w-12 h-12 rounded-xl bg-gradient-to-r ${audience.color} flex items-center justify-center shadow-lg`}>
                  <audience.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{audience.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{audience.description}</p>
                <ul className="space-y-2 mb-6">
                  {audience.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700">
                      <div className={`w-2 h-2 bg-gradient-to-r ${audience.color} rounded-full mr-3`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link to="/signup">
                  <Button className={`w-full bg-gradient-to-r ${audience.color} hover:opacity-90 text-white`}>
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoIsItFor;

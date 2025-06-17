
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Users, 
  UserCheck, 
  FolderOpen, 
  TrendingUp, 
  Calculator, 
  Brain,
  Zap,
  Target,
  Shield,
  Globe,
  BarChart3,
  Workflow
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: Users,
      title: 'Advanced CRM',
      description: 'AI-powered customer relationship management with predictive lead scoring and intelligent automation.',
      gradient: 'from-blue-500 to-cyan-500',
      category: 'Sales & Marketing'
    },
    {
      icon: UserCheck,
      title: 'Smart HR Suite',
      description: 'Complete human resources management with AI hiring, performance analytics, and automated workflows.',
      gradient: 'from-emerald-500 to-teal-500',
      category: 'Human Resources'
    },
    {
      icon: FolderOpen,
      title: 'Project Intelligence',
      description: 'Advanced project management with AI task prioritization, resource optimization, and timeline prediction.',
      gradient: 'from-purple-500 to-indigo-500',
      category: 'Project Management'
    },
    {
      icon: Calculator,
      title: 'Financial Analytics',
      description: 'Comprehensive financial management with automated accounting, expense tracking, and predictive budgeting.',
      gradient: 'from-orange-500 to-red-500',
      category: 'Finance & Accounting'
    },
    {
      icon: Brain,
      title: 'AI Business Assistant',
      description: 'Your intelligent business copilot providing insights, reports, and strategic recommendations.',
      gradient: 'from-pink-500 to-rose-500',
      category: 'AI & Analytics'
    },
    {
      icon: Workflow,
      title: 'Smart Automation',
      description: 'Intelligent workflow automation that learns from your business patterns and optimizes processes.',
      gradient: 'from-yellow-500 to-amber-500',
      category: 'Automation'
    },
    {
      icon: BarChart3,
      title: 'Business Intelligence',
      description: 'Advanced analytics and reporting with real-time dashboards and predictive business insights.',
      gradient: 'from-cyan-500 to-blue-500',
      category: 'Analytics & Reporting'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level security with advanced encryption, compliance management, and access controls.',
      gradient: 'from-slate-500 to-gray-600',
      category: 'Security & Compliance'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-br from-white via-slate-50 to-blue-50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-bold uppercase tracking-wider mb-6">
            Platform Features
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-transparent">
              Everything Your Business
            </span>
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Needs to Dominate
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Comprehensive suite of AI-powered tools designed to transform your business operations and drive unprecedented growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 overflow-hidden"
            >
              <CardContent className="p-8">
                <div className="mb-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {feature.category}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-slate-800 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
            <p className="text-xl mb-8 opacity-90">Join thousands of businesses already using BizBase to dominate their industry.</p>
            <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
              Start Your Free Trial
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;


import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, ArrowRight, CheckCircle, Star, Users, Building2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';

const Demo = () => {
  const demoVideos = [
    {
      title: "Complete Business Setup in 5 Minutes",
      description: "Watch how entrepreneurs set up their entire business infrastructure in minutes",
      duration: "5:23",
      views: "1.2M",
      thumbnail: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=250&fit=crop"
    },
    {
      title: "AI Assistant Managing Teams",
      description: "See how our AI manages global teams and automates workflows",
      duration: "8:45",
      views: "890K",
      thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop"
    },
    {
      title: "Revenue Generation on Autopilot",
      description: "Real-time demonstration of automated revenue streams",
      duration: "12:15",
      views: "2.1M",
      thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop"
    }
  ];

  const successStories = [
    {
      name: "Tech Startup",
      growth: "0 to $10M",
      time: "8 months",
      industry: "Technology"
    },
    {
      name: "E-commerce Store",
      growth: "0 to $5M",
      time: "6 months",
      industry: "Retail"
    },
    {
      name: "Consulting Firm",
      growth: "0 to $2M",
      time: "4 months",
      industry: "Services"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30">
      <SEOHead title="Demo - See BizBase AI in Action" description="Watch how entrepreneurs build businesses using BizBase AI. See live demos of networking, AI assistant, business management, and more." path="/demo" />
      {/* Hero Section */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-black mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                See BizBase in Action
              </span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Watch real entrepreneurs build million-dollar businesses using our AI-powered platform
            </p>
          </div>

          {/* Main Demo Video */}
          <div className="max-w-4xl mx-auto mb-20">
            <Card className="overflow-hidden shadow-2xl border-0">
              <div className="relative aspect-video bg-gradient-to-br from-blue-900 to-purple-900">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 backdrop-blur-sm rounded-full p-8">
                    <Play className="w-12 h-12 ml-2" />
                  </Button>
                </div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold">Complete Platform Overview</h3>
                  <p className="text-white/80">15:30 minutes • 5.2M views</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Demo Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {demoVideos.map((video, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="relative">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-3">{video.description}</p>
                  <p className="text-xs text-slate-500">{video.views} views</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Success Stories */}
          <div className="mb-20">
            <h2 className="text-3xl md:text-4xl font-black text-center mb-12">
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Real Success Stories
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {successStories.map((story, index) => (
                <Card key={index} className="text-center p-8 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">{story.name}</h3>
                  <p className="text-2xl font-black text-green-600 mb-2">{story.growth}</p>
                  <p className="text-slate-600 mb-1">in {story.time}</p>
                  <p className="text-sm text-slate-500">{story.industry}</p>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 rounded-2xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-black mb-6">Ready to Start Your Success Story?</h2>
            <p className="text-xl mb-8 opacity-90">Join thousands of entrepreneurs who transformed their lives with BizBase</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-bold">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-bold">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Demo;


import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const ScreenshotsCarousel = () => {
  const screenshots = [
    {
      title: 'Dashboard Overview',
      description: 'Get a complete overview of your business metrics and KPIs in one glance.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      category: 'Dashboard'
    },
    {
      title: 'CRM Management',
      description: 'Manage your customers and leads with our intelligent CRM system.',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      category: 'CRM'
    },
    {
      title: 'Project Tracking',
      description: 'Keep track of all your projects with advanced Kanban boards and timelines.',
      image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop',
      category: 'Projects'
    },
    {
      title: 'AI Assistant',
      description: 'Get instant insights and answers from your personal AI business assistant.',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop',
      category: 'AI'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Deep dive into your business analytics with beautiful, interactive charts.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      category: 'Analytics'
    },
    {
      title: 'Team Collaboration',
      description: 'Collaborate seamlessly with your team using our integrated communication tools.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      category: 'Team'
    }
  ];

  return (
    <section id="screenshots" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            See{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BizBase
            </span>{' '}
            in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Experience the power and elegance of our platform through these interactive screenshots and demos.
          </p>
        </div>
        
        <div className="relative">
          <Carousel className="w-full max-w-6xl mx-auto">
            <CarouselContent>
              {screenshots.map((screenshot, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-4">
                    <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
                      <div className="relative overflow-hidden">
                        <img 
                          src={screenshot.image} 
                          alt={screenshot.title}
                          className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-900">
                            {screenshot.category}
                          </span>
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold mb-3 text-gray-900">{screenshot.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{screenshot.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:bg-white" />
            <CarouselNext className="-right-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:bg-white" />
          </Carousel>
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full">
            <span className="text-sm font-medium text-blue-800">✨ Interactive demos available inside the platform</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScreenshotsCarousel;

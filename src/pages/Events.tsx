
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  Search,
  Filter,
  Video,
  Star,
  Share2,
  Bookmark,
  ExternalLink,
  Globe,
  Building2,
  Ticket,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  Award,
  Briefcase
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Events = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('upcoming');

  const events = [
    {
      id: 1,
      title: "Global Business Leaders Summit 2025",
      description: "Join industry leaders for insights on business transformation, innovation strategies, and networking opportunities.",
      date: "March 15, 2025",
      time: "9:00 AM - 6:00 PM",
      location: "New York Convention Center",
      type: "In-Person",
      category: "Conference",
      attendees: 2500,
      price: "$299",
      isPaid: true,
      isBookmarked: false,
      rating: 4.8,
      organizer: "Business Excellence Network",
      image: "/api/placeholder/300/200",
      tags: ["Leadership", "Innovation", "Networking"],
      status: "upcoming"
    },
    {
      id: 2,
      title: "AI & Future of Work Webinar",
      description: "Explore how artificial intelligence is reshaping the workplace and learn strategies for adaptation.",
      date: "February 28, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Virtual Event",
      type: "Online",
      category: "Webinar",
      attendees: 850,
      price: "Free",
      isPaid: false,
      isBookmarked: true,
      rating: 4.6,
      organizer: "Tech Innovation Hub",
      image: "/api/placeholder/300/200",
      tags: ["AI", "Technology", "Future of Work"],
      status: "upcoming"
    },
    {
      id: 3,
      title: "Sustainable Finance Forum",
      description: "Discussing sustainable investment strategies and ESG compliance in modern finance.",
      date: "March 8, 2025",
      time: "10:30 AM - 5:00 PM",
      location: "Chicago Business Center",
      type: "Hybrid",
      category: "Forum",
      attendees: 420,
      price: "$150",
      isPaid: true,
      isBookmarked: false,
      rating: 4.7,
      organizer: "Green Finance Association",
      image: "/api/placeholder/300/200",
      tags: ["Finance", "Sustainability", "ESG"],
      status: "upcoming"
    },
    {
      id: 4,
      title: "Digital Marketing Masterclass",
      description: "Master the latest digital marketing trends and strategies from industry experts.",
      date: "January 20, 2025",
      time: "1:00 PM - 6:00 PM",
      location: "Los Angeles Marketing Hub",
      type: "In-Person",
      category: "Workshop",
      attendees: 180,
      price: "$199",
      isPaid: true,
      isBookmarked: true,
      rating: 4.9,
      organizer: "Digital Growth Academy",
      image: "/api/placeholder/300/200",
      tags: ["Marketing", "Digital", "Strategy"],
      status: "past"
    }
  ];

  const myEvents = [
    {
      id: 5,
      title: "Startup Pitch Competition",
      description: "Present your startup idea to investors and industry experts.",
      date: "April 5, 2025",
      time: "6:00 PM - 9:00 PM",
      location: "Silicon Valley Innovation Center",
      type: "In-Person",
      attendees: 300,
      status: "registered"
    }
  ];

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEventsByTab = () => {
    switch (activeTab) {
      case 'upcoming':
        return filteredEvents.filter(event => event.status === 'upcoming');
      case 'past':
        return filteredEvents.filter(event => event.status === 'past');
      case 'my-events':
        return myEvents;
      default:
        return filteredEvents;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Calendar className="w-8 h-8 mr-3" />
                Professional Events
              </h1>
              <p className="text-purple-100">Discover and attend events to grow your professional network</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search events by name, category, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 border-white/30 text-white placeholder-white/70 rounded-full focus:bg-white/30"
            />
          </div>
        </div>

        {/* Event Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                  <p className="text-2xl font-bold text-blue-600">12</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Events Attended</p>
                  <p className="text-2xl font-bold text-green-600">8</p>
                </div>
                <Ticket className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bookmarked</p>
                  <p className="text-2xl font-bold text-purple-600">5</p>
                </div>
                <Bookmark className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Networking Score</p>
                  <p className="text-2xl font-bold text-orange-600">9.2</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
            <TabsTrigger value="my-events">My Events</TabsTrigger>
            <TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getEventsByTab().map((event) => (
                <Card key={event.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg"></div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <Badge className={`${event.type === 'Online' ? 'bg-green-500' : event.type === 'Hybrid' ? 'bg-orange-500' : 'bg-blue-500'} text-white`}>
                        {event.type}
                      </Badge>
                      <Button variant="ghost" size="icon" className="bg-white/20 hover:bg-white/30 text-white">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <Badge className="bg-white/90 text-gray-900">
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{event.description}</p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        {event.date}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-green-500" />
                        {event.time}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-red-500" />
                        {event.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-purple-500" />
                        {event.attendees} attendees
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        {event.rating} rating
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-green-600">{event.price}</span>
                        {event.isPaid && (
                          <Badge variant="outline" className="text-xs">
                            Paid
                          </Badge>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Details
                        </Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Ticket className="w-4 h-4 mr-2" />
                          Register
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getEventsByTab().map((event) => (
                <Card key={event.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.date}</p>
                      </div>
                      <Badge className="bg-gray-100 text-gray-600">
                        Attended
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Star className="w-4 h-4 mr-2" />
                        Rate Event
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="my-events" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {getEventsByTab().map((event) => (
                <Card key={event.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{event.title}</h3>
                        <p className="text-sm text-gray-600">{event.date}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-600">
                        Registered
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                    <div className="flex space-x-2">
                      <Button size="sm">
                        <Calendar className="w-4 h-4 mr-2" />
                        Add to Calendar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bookmarked" className="space-y-6">
            <div className="text-center py-12">
              <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Bookmarked Events</h3>
              <p className="text-gray-600">Bookmark events you're interested in to find them easily later.</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* Featured Events */}
        <Card className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-white/90" />
              <h2 className="text-2xl font-bold mb-3">Featured Professional Events</h2>
              <p className="text-white/90 mb-6">
                Don't miss these exclusive networking and learning opportunities
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Global Summit
                </Button>
                
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Virtual Conferences
                </Button>

                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Briefcase className="w-4 h-4 mr-2" />
                  Industry Meetups
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Events;

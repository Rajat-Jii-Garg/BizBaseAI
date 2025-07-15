import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Plus,
  Filter,
  Search,
  ExternalLink,
  BookmarkPlus,
  Share2,
  Video,
  Globe,
  Briefcase,
  TrendingUp,
  Star
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Events = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTab, setSelectedTab] = useState('discover');

  // Mock events data - replace with Supabase integration
  const events = [
    {
      id: 1,
      title: "AI in Business 2024: Future Trends",
      description: "Explore how AI is transforming business operations and discover the latest trends in artificial intelligence.",
      date: "2024-02-15",
      time: "14:00",
      location: "Virtual Event",
      type: "webinar",
      attendees: 1247,
      price: "Free",
      category: "Technology",
      organizer: {
        name: "TechForward",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150"
      },
      tags: ["AI", "Business", "Innovation"],
      featured: true
    },
    {
      id: 2,
      title: "Networking Mixer: Startup Founders",
      description: "Connect with fellow entrepreneurs and startup founders in this exclusive networking event.",
      date: "2024-02-18",
      time: "18:30",
      location: "Innovation Hub, NYC",
      type: "networking",
      attendees: 85,
      price: "$25",
      category: "Networking",
      organizer: {
        name: "Startup Network",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
      },
      tags: ["Networking", "Startups", "Entrepreneurship"]
    },
    {
      id: 3,
      title: "Digital Marketing Masterclass",
      description: "Learn advanced digital marketing strategies from industry experts.",
      date: "2024-02-20",
      time: "10:00",
      location: "Virtual Event",
      type: "workshop",
      attendees: 356,
      price: "$49",
      category: "Marketing",
      organizer: {
        name: "Marketing Pro",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150"
      },
      tags: ["Marketing", "Digital", "Strategy"]
    },
    {
      id: 4,
      title: "Investment Strategies Workshop",
      description: "Learn from successful investors about portfolio management and investment strategies.",
      date: "2024-02-22",
      time: "15:00",
      location: "Financial District, London",
      type: "workshop",
      attendees: 127,
      price: "$75",
      category: "Finance",
      organizer: {
        name: "InvestWise",
        avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150"
      },
      tags: ["Investment", "Finance", "Strategy"]
    }
  ];

  const categories = ['all', 'Technology', 'Networking', 'Marketing', 'Finance', 'Leadership'];
  const eventTypes = [
    { id: 'webinar', label: 'Webinars', icon: Video },
    { id: 'networking', label: 'Networking', icon: Users },
    { id: 'workshop', label: 'Workshops', icon: Briefcase },
    { id: 'conference', label: 'Conferences', icon: Globe }
  ];

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleJoinEvent = (eventId: number) => {
    toast({
      title: "Event Joined!",
      description: "You've successfully registered for this event. Check your email for details."
    });
  };

  const handleBookmarkEvent = (eventId: number) => {
    toast({
      title: "Event Bookmarked",
      description: "Event saved to your bookmarks."
    });
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-blue-600" />
              Professional Events
            </h1>
            <p className="text-gray-600 mt-2">Discover networking events, workshops, and conferences to advance your career</p>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['discover', 'my-events', 'bookmarked'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                selectedTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'discover' && 'Discover Events'}
              {tab === 'my-events' && 'My Events'}
              {tab === 'bookmarked' && 'Bookmarked'}
            </button>
          ))}
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search events, topics, or organizers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded-lg px-3 py-2 bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className={`hover:shadow-lg transition-shadow ${event.featured ? 'ring-2 ring-yellow-200' : ''}`}>
              {event.featured && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-1 text-xs font-bold">
                  ⭐ FEATURED EVENT
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={event.organizer.avatar} />
                      <AvatarFallback>{event.organizer.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600">by {event.organizer.name}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleBookmarkEvent(event.id)}
                  >
                    <BookmarkPlus className="w-4 h-4" />
                  </Button>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg text-green-600">{event.price}</span>
                    <Badge variant="outline">{event.category}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleJoinEvent(event.id)}
                    >
                      {event.price === 'Free' ? 'Join Event' : 'Register'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEvents.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600">Try adjusting your search terms or browse different categories.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Events;
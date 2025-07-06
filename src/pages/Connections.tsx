
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  MessageSquare, 
  Mail, 
  Phone,
  MapPin,
  Briefcase,
  Building2,
  Star,
  UserCheck,
  UserPlus,
  Send,
  MoreHorizontal,
  Eye,
  Heart,
  Share2,
  Network,
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Connections = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const connections = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Product Manager",
      company: "TechCorp Solutions",
      location: "San Francisco, CA",
      mutualConnections: 45,
      industry: "Technology",
      profileImage: "/api/placeholder/40/40",
      isConnected: true,
      lastActive: "2 hours ago",
      endorsements: 24,
      rating: 4.8
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Digital Marketing Director",
      company: "Growth Ventures",
      location: "New York, NY",
      mutualConnections: 32,
      industry: "Marketing",
      profileImage: "/api/placeholder/40/40",
      isConnected: true,
      lastActive: "1 day ago",
      endorsements: 18,
      rating: 4.9
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "Business Development Lead",
      company: "InnovateLab",
      location: "Austin, TX",
      mutualConnections: 28,
      industry: "Business Development",
      profileImage: "/api/placeholder/40/40",
      isConnected: false,
      lastActive: "3 hours ago",
      endorsements: 31,
      rating: 4.7
    },
    {
      id: 4,
      name: "David Kim",
      title: "Software Engineer",
      company: "DevTech Inc",
      location: "Seattle, WA",
      mutualConnections: 19,
      industry: "Technology",
      profileImage: "/api/placeholder/40/40",
      isConnected: true,
      lastActive: "5 hours ago",
      endorsements: 15,
      rating: 4.6
    },
    {
      id: 5,
      name: "Lisa Thompson",
      title: "Finance Manager",
      company: "Capital Group",
      location: "Chicago, IL",
      mutualConnections: 37,
      industry: "Finance",
      profileImage: "/api/placeholder/40/40",
      isConnected: false,
      lastActive: "1 hour ago",
      endorsements: 22,
      rating: 4.8
    }
  ];

  const suggestions = [
    {
      id: 6,
      name: "Alex Turner",
      title: "UX Designer",
      company: "DesignStudio",
      location: "Los Angeles, CA",
      mutualConnections: 12,
      industry: "Design",
      profileImage: "/api/placeholder/40/40",
      reason: "Works in similar industry"
    },
    {
      id: 7,
      name: "Maria Garcia",
      title: "HR Director",
      company: "PeopleFirst",
      location: "Miami, FL",
      mutualConnections: 8,
      industry: "Human Resources",
      profileImage: "/api/placeholder/40/40",
      reason: "Mutual connections suggest"
    }
  ];

  const recentActivity = [
    {
      type: "connection",
      user: "John Smith",
      action: "accepted your connection request",
      time: "30 minutes ago"
    },
    {
      type: "endorsement",
      user: "Anna Wilson",
      action: "endorsed you for Project Management",
      time: "2 hours ago"
    },
    {
      type: "message",
      user: "Robert Brown",
      action: "sent you a message",
      time: "4 hours ago"
    }
  ];

  const filteredConnections = connections.filter(conn =>
    conn.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conn.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getConnectionsByTab = () => {
    switch (activeTab) {
      case 'connected':
        return filteredConnections.filter(conn => conn.isConnected);
      case 'pending':
        return filteredConnections.filter(conn => !conn.isConnected);
      default:
        return filteredConnections;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Network className="w-8 h-8 mr-3" />
                Professional Connections
              </h1>
              <p className="text-blue-100">Expand your professional network and grow your business</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Badge className="bg-white/20 text-white border-white/30">
                {connections.filter(c => c.isConnected).length} Connected
              </Badge>
              <Badge className="bg-white/20 text-white border-white/30">
                {connections.filter(c => !c.isConnected).length} Pending
              </Badge>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search connections by name, company, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 border-white/30 text-white placeholder-white/70 rounded-full focus:bg-white/30"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="all">All Connections</TabsTrigger>
            <TabsTrigger value="connected">Connected</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getConnectionsByTab().map((connection) => (
                <Card key={connection.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16 ring-2 ring-blue-200">
                          <AvatarImage src={connection.profileImage} />
                          <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold text-lg">
                            {connection.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{connection.name}</h3>
                          <p className="text-sm text-gray-600">{connection.title}</p>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Building2 className="w-3 h-3 mr-1" />
                            {connection.company}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {connection.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {connection.mutualConnections} mutual connections
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        {connection.rating} • {connection.endorsements} endorsements
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        Active {connection.lastActive}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {connection.isConnected ? (
                        <div className="flex space-x-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Profile
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <UserPlus className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {connection.industry}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="connected" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getConnectionsByTab().map((connection) => (
                <Card key={connection.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={connection.profileImage} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                          {connection.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{connection.name}</h3>
                        <p className="text-sm text-gray-600">{connection.title}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Connected
                      </Badge>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getConnectionsByTab().map((connection) => (
                <Card key={connection.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={connection.profileImage} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                          {connection.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{connection.name}</h3>
                        <p className="text-sm text-gray-600">{connection.title}</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-700">
                        Pending
                      </Badge>
                    </div>
                    <Button size="sm" className="w-full bg-green-600 hover:bg-green-700">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Send Request
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={suggestion.profileImage} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700">
                          {suggestion.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{suggestion.name}</h3>
                        <p className="text-sm text-gray-600">{suggestion.title}</p>
                        <p className="text-xs text-gray-500">{suggestion.reason}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Recent Activity */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Connections;

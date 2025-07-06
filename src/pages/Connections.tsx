
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Filter,
  MessageCircle,
  UserPlus,
  Star,
  MapPin,
  Building2,
  Calendar,
  Eye,
  Share2,
  Network,
  TrendingUp,
  Award,
  Globe,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  LinkedinIcon,
  Twitter,
  Plus,
  UserCheck,
  UserX
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

const Connections = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all-connections');

  const connections = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "Senior Marketing Manager",
      company: "TechCorp Solutions",
      location: "New York, NY",
      avatar: "/api/placeholder/64/64",
      connections: 500,
      isOnline: true,
      lastActive: "2 hours ago",
      connectionDate: "Connected 2 months ago",
      rating: 4.9,
      skills: ["Digital Marketing", "Brand Strategy", "Content Creation"],
      mutual: 15,
      verified: true
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Full Stack Developer",
      company: "InnovateHub",
      location: "San Francisco, CA",
      avatar: "/api/placeholder/64/64",
      connections: 750,
      isOnline: false,
      lastActive: "1 day ago",
      connectionDate: "Connected 3 weeks ago",
      rating: 4.8,
      skills: ["React", "Node.js", "Python"],
      mutual: 23,
      verified: true
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      title: "Business Development Executive",
      company: "Growth Partners LLC",
      location: "Chicago, IL",
      avatar: "/api/placeholder/64/64",
      connections: 320,
      isOnline: true,
      lastActive: "30 minutes ago",
      connectionDate: "Connected 1 week ago",
      rating: 4.7,
      skills: ["Business Strategy", "Sales", "Partnership"],
      mutual: 8,
      verified: false
    },
    {
      id: 4,
      name: "David Park",
      title: "Product Manager",
      company: "StartupXYZ",
      location: "Austin, TX",
      avatar: "/api/placeholder/64/64",
      connections: 890,
      isOnline: false,
      lastActive: "3 days ago",
      connectionDate: "Connected 1 month ago",
      rating: 4.9,
      skills: ["Product Strategy", "Agile", "User Experience"],
      mutual: 31,
      verified: true
    }
  ];

  const recommendations = [
    {
      id: 5,
      name: "Jennifer Smith",
      title: "HR Director",
      company: "People First Inc",
      location: "Boston, MA",
      avatar: "/api/placeholder/64/64",
      connections: 445,
      reason: "Works at similar companies",
      mutual: 12,
      skills: ["HR Management", "Talent Acquisition", "Leadership"]
    },
    {
      id: 6,
      name: "Alex Thompson",
      title: "Data Scientist",
      company: "Analytics Pro",
      location: "Seattle, WA",
      avatar: "/api/placeholder/64/64",
      connections: 623,
      reason: "Shares 5 mutual connections",
      mutual: 5,
      skills: ["Machine Learning", "Python", "Statistics"]
    }
  ];

  const pendingRequests = [
    {
      id: 7,
      name: "Lisa Wang",
      title: "Content Strategist",
      company: "Digital Agency Co",
      location: "Los Angeles, CA",
      avatar: "/api/placeholder/64/64",
      message: "Hi! I'd love to connect and share insights about content marketing strategies.",
      requestDate: "2 days ago"
    },
    {
      id: 8,
      name: "Robert Martinez",
      title: "Financial Analyst",
      company: "Finance Solutions",
      location: "Miami, FL",
      avatar: "/api/placeholder/64/64",
      message: "Interested in connecting to discuss fintech innovations.",
      requestDate: "1 week ago"
    }
  ];

  const filteredConnections = connections.filter(connection =>
    connection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    connection.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConnect = (id: number) => {
    console.log('Connecting to user:', id);
    // TODO: Implement connection functionality
  };

  const handleMessage = (id: number) => {
    console.log('Messaging user:', id);
    // TODO: Implement messaging functionality
  };

  const handleAcceptRequest = (id: number) => {
    console.log('Accepting request from:', id);
    // TODO: Implement accept request functionality
  };

  const handleDeclineRequest = (id: number) => {
    console.log('Declining request from:', id);
    // TODO: Implement decline request functionality
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center">
                <Network className="w-8 h-8 mr-3" />
                Professional Network
              </h1>
              <p className="text-blue-100">Build meaningful connections that drive your career forward</p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Contacts
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search connections by name, title, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/20 border-white/30 text-white placeholder-white/70 rounded-full focus:bg-white/30"
            />
          </div>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Connections</p>
                  <p className="text-2xl font-bold text-blue-600">1,247</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-2xl font-bold text-green-600">3,684</p>
                </div>
                <Eye className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-orange-600">12</p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Network Score</p>
                  <p className="text-2xl font-bold text-purple-600">9.2/10</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="all-connections">All Connections</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="sent">Sent Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="all-connections" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredConnections.map((connection) => (
                <Card key={connection.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Avatar className="h-16 w-16 ring-2 ring-blue-200">
                            <AvatarImage src={connection.avatar} />
                            <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 font-semibold">
                              {connection.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {connection.isOnline && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-bold text-gray-900">{connection.name}</h3>
                            {connection.verified && (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{connection.title}</p>
                          <p className="text-sm text-blue-600 mb-2">{connection.company}</p>
                          <div className="flex items-center text-xs text-gray-500 space-x-3">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              {connection.location}
                            </div>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {connection.connections} connections
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm font-medium">{connection.rating}</span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex flex-wrap gap-2">
                        {connection.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>{connection.connectionDate}</p>
                        <p>{connection.mutual} mutual connections</p>
                        <p>Last active: {connection.lastActive}</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleMessage(connection.id)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => console.log('View profile', connection.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((person) => (
                <Card key={person.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <Avatar className="h-16 w-16 ring-2 ring-purple-200">
                        <AvatarImage src={person.avatar} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold">
                          {person.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{person.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">{person.title}</p>
                        <p className="text-sm text-blue-600 mb-2">{person.company}</p>
                        <div className="flex items-center text-xs text-gray-500 space-x-3 mb-2">
                          <div className="flex items-center">
                            <MapPin className="w-3 h-3 mr-1" />
                            {person.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {person.connections} connections
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs mb-2">
                          {person.reason}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {person.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                        onClick={() => handleConnect(person.id)}
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Connect
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Avatar className="h-12 w-12 ring-2 ring-orange-200">
                          <AvatarImage src={request.avatar} />
                          <AvatarFallback className="bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-700 font-semibold">
                            {request.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1">{request.name}</h3>
                          <p className="text-sm text-gray-600 mb-1">{request.title}</p>
                          <p className="text-sm text-blue-600 mb-2">{request.company}</p>
                          <div className="flex items-center text-xs text-gray-500 mb-3">
                            <MapPin className="w-3 h-3 mr-1" />
                            {request.location} • {request.requestDate}
                          </div>
                          {request.message && (
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <p className="text-sm text-gray-700">{request.message}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAcceptRequest(request.id)}
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeclineRequest(request.id)}
                        >
                          <UserX className="w-4 h-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sent" className="space-y-6">
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sent Requests</h3>
              <p className="text-gray-600 mb-4">You haven't sent any connection requests recently.</p>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Find People to Connect
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Networking Tips */}
        <Card className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="p-8">
            <div className="text-center">
              <Award className="w-12 h-12 mx-auto mb-4 text-white/90" />
              <h2 className="text-2xl font-bold mb-3">Professional Networking Tips</h2>
              <p className="text-white/90 mb-6">
                Build authentic relationships that drive mutual growth and success
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Engage Regularly
                </Button>
                
                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Knowledge
                </Button>

                <Button 
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Global Reach
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Connections;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  Plus, 
  MapPin, 
  Calendar,
  Eye,
  Users,
  ArrowRight,
  ExternalLink,
  MoreVertical,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DashboardLayout from '@/components/DashboardLayout';
import LaunchingSoonOverlay from '@/components/LaunchingSoonOverlay';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const MyBusinesses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBusinesses();
    }
  }, [user]);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast({
        title: "Error",
        description: "Could not load your businesses.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <LaunchingSoonOverlay
        title="My Businesses — Launching Soon"
        subtitle="The business workspace is almost ready. Until then, grow your personal brand & connections on BizBase."
      >
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              My Businesses
            </h1>
            <p className="text-gray-600 mt-1">Manage all your registered businesses</p>
          </div>
          <Button onClick={() => navigate('/business-setup')} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Register New Business
          </Button>
        </div>

        {/* Business Cards */}
        {businesses.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Building2 className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">No Businesses Yet</h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Register your first business to start managing it on BizBase. 
                Get access to powerful tools and grow your network.
              </p>
              <Button onClick={() => navigate('/business-setup')} size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Plus className="w-5 h-5 mr-2" />
                Register Your First Business
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <Card key={business.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                {/* Banner */}
                <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                  {business.banner_url && (
                    <img src={business.banner_url} alt="Banner" className="w-full h-full object-cover" />
                  )}
                  
                  {/* Menu */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => navigate(`/business/${business.id}/dashboard`)}>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Open Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Business
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <CardContent className="relative pt-10 pb-4">
                  {/* Logo */}
                  <div className="absolute -top-8 left-4">
                    <Avatar className="w-16 h-16 border-4 border-white shadow-md">
                      <AvatarImage src={business.logo_url} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xl font-bold">
                        {business.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-4">
                    <Badge className={getStatusColor(business.status)}>
                      {business.status}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                        {business.name}
                      </h3>
                      <p className="text-sm text-gray-500">{business.category}</p>
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2">{business.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {business.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(business.created_at)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {business.views_count || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {business.followers_count || 0} followers
                      </span>
                    </div>
                    
                    <Button 
                      className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      onClick={() => navigate(`/business/${business.id}/dashboard`)}
                    >
                      Open Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </LaunchingSoonOverlay>
    </DashboardLayout>
  );
};

export default MyBusinesses;

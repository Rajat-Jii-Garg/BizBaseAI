
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MapPin, UserPlus, MessageCircle, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface NetworkingCardProps {
  profile: any;
  connectionStatus?: 'none' | 'pending' | 'connected';
  onConnect?: () => void;
}

const NetworkingCard: React.FC<NetworkingCardProps> = ({ 
  profile, 
  connectionStatus = 'none',
  onConnect 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(connectionStatus);

  const handleConnect = async () => {
    if (!user || status !== 'none') return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          addressee_id: profile.id,
          status: 'pending'
        });

      if (error) throw error;

      setStatus('pending');
      toast({
        title: "Connection Request Sent",
        description: `Connection request sent to ${profile.full_name}`,
      });
      
      onConnect?.();
    } catch (error: any) {
      console.error('Error sending connection request:', error);
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getConnectionButton = () => {
    switch (status) {
      case 'pending':
        return (
          <Button disabled size="sm" variant="outline">
            <Check className="w-4 h-4 mr-2" />
            Request Sent
          </Button>
        );
      case 'connected':
        return (
          <Button size="sm" variant="outline">
            <MessageCircle className="w-4 h-4 mr-2" />
            Message
          </Button>
        );
      default:
        return (
          <Button 
            size="sm" 
            onClick={handleConnect} 
            disabled={loading}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {loading ? 'Connecting...' : 'Connect'}
          </Button>
        );
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>
              {profile.full_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{profile.full_name}</h3>
            {profile.current_position && (
              <p className="text-sm text-gray-600 truncate">
                {profile.current_position}
                {profile.company_name && ` at ${profile.company_name}`}
              </p>
            )}
            
            {profile.location && (
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {profile.location}
              </div>
            )}
            
            {profile.skills && profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {profile.skills.slice(0, 3).map((skill: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {profile.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{profile.skills.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            
            <div className="mt-3">
              {getConnectionButton()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetworkingCard;


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Plus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SkillEndorsementsProps {
  profileId: string;
  skills: string[];
  isOwnProfile: boolean;
}

interface Endorsement {
  id: string;
  skill: string;
  endorser_id: string;
  endorser_name: string;
  endorser_avatar?: string;
  created_at: string;
}

const SkillEndorsements: React.FC<SkillEndorsementsProps> = ({ 
  profileId, 
  skills, 
  isOwnProfile 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEndorsements();
  }, [profileId]);

  const fetchEndorsements = async () => {
    try {
      const { data, error } = await supabase
        .from('endorsements')
        .select(`
          *,
          endorser:profiles!endorsements_endorser_id_fkey(full_name, avatar_url)
        `)
        .eq('endorsed_user_id', profileId);

      if (error) throw error;

      const formattedEndorsements = data?.map(item => ({
        id: item.id,
        skill: item.skill,
        endorser_id: item.endorser_id,
        endorser_name: (item.endorser as any)?.full_name || 'Unknown User',
        endorser_avatar: (item.endorser as any)?.avatar_url,
        created_at: item.created_at
      })) || [];

      setEndorsements(formattedEndorsements);
    } catch (error) {
      console.error('Error fetching endorsements:', error);
    }
  };

  const handleEndorse = async (skill: string) => {
    if (!user || isOwnProfile) return;
    
    setLoading(true);
    try {
      // Check if already endorsed
      const existingEndorsement = endorsements.find(
        e => e.skill === skill && e.endorser_id === user.id
      );

      if (existingEndorsement) {
        // Remove endorsement
        const { error } = await supabase
          .from('endorsements')
          .delete()
          .eq('id', existingEndorsement.id);

        if (error) throw error;

        toast({
          title: "Endorsement Removed",
          description: `You've removed your endorsement for ${skill}`,
        });
      } else {
        // Add endorsement
        const { error } = await supabase
          .from('endorsements')
          .insert({
            endorser_id: user.id,
            endorsed_user_id: profileId,
            skill: skill
          });

        if (error) throw error;

        toast({
          title: "Skill Endorsed",
          description: `You've endorsed ${skill}`,
        });
      }

      await fetchEndorsements();
    } catch (error) {
      console.error('Error handling endorsement:', error);
      toast({
        title: "Error",
        description: "Failed to update endorsement. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSkillEndorsements = (skill: string) => {
    return endorsements.filter(e => e.skill === skill);
  };

  const isEndorsedByUser = (skill: string) => {
    return endorsements.some(e => e.skill === skill && e.endorser_id === user?.id);
  };

  if (!skills || skills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Skills & Endorsements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">No skills added yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Skills & Endorsements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {skills.map((skill) => {
          const skillEndorsements = getSkillEndorsements(skill);
          const isEndorsed = isEndorsedByUser(skill);
          
          return (
            <div key={skill} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-base px-3 py-1">
                    {skill}
                  </Badge>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {skillEndorsements.length}
                  </Badge>
                </div>
                
                {!isOwnProfile && user && (
                  <Button
                    variant={isEndorsed ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleEndorse(skill)}
                    disabled={loading}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    {isEndorsed ? 'Endorsed' : 'Endorse'}
                  </Button>
                )}
              </div>

              {skillEndorsements.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">
                    Endorsed by:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {skillEndorsements.slice(0, 5).map((endorsement) => (
                      <div key={endorsement.id} className="flex items-center gap-2 bg-gray-50 rounded-full px-3 py-1">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={endorsement.endorser_avatar} />
                          <AvatarFallback className="text-xs">
                            {endorsement.endorser_name?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-700">
                          {endorsement.endorser_name}
                        </span>
                      </div>
                    ))}
                    {skillEndorsements.length > 5 && (
                      <Badge variant="secondary" className="text-xs">
                        +{skillEndorsements.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SkillEndorsements;

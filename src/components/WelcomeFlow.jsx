import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Briefcase, 
  MapPin, 
  Mail, 
  Phone, 
  Sparkles,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const WelcomeFlow = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    current_position: '',
    company_name: '',
    location: '',
    phone: '',
    bio: '',
    industry: ''
  });

  useEffect(() => {
    if (user?.id) {
      checkIfNewUser();
    }
  }, [user]);

  const checkIfNewUser = async () => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, profile_completion_score, created_at')
        .eq('id', user.id)
        .single();

      if (error && error.code === 'PGRST116') {
        // No profile exists - new user
        setOpen(true);
        return;
      }

      if (profile) {
        // Check if user signed up recently and has low completion score
        const createdAt = new Date(profile.created_at);
        const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysSinceCreation <= 1 && (profile.profile_completion_score || 0) < 30) {
          setOpen(true);
        }
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Welcome to BizBase AI!",
        description: "Your profile has been created successfully."
      });

      setOpen(false);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Let's Get to Know You</h3>
              <p className="text-gray-600">Tell us about yourself to get started</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Your Professional Info</h3>
              <p className="text-gray-600">Help others understand your expertise</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="current_position">Current Position</Label>
                <Input
                  id="current_position"
                  value={profileData.current_position}
                  onChange={(e) => setProfileData({...profileData, current_position: e.target.value})}
                  placeholder="e.g. Senior Product Manager"
                />
              </div>
              
              <div>
                <Label htmlFor="company_name">Company</Label>
                <Input
                  id="company_name"
                  value={profileData.company_name}
                  onChange={(e) => setProfileData({...profileData, company_name: e.target.value})}
                  placeholder="e.g. TechCorp Inc."
                />
              </div>
              
              <div>
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  value={profileData.industry}
                  onChange={(e) => setProfileData({...profileData, industry: e.target.value})}
                  placeholder="e.g. Technology, Finance, Healthcare"
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Tell Your Story</h3>
              <p className="text-gray-600">Share what makes you unique</p>
            </div>
            
            <div>
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={profileData.bio}
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Write a brief description about your professional background, interests, and what you're passionate about..."
                rows={4}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return profileData.full_name.trim() && profileData.email.trim();
      case 2:
        return true; // Optional fields
      case 3:
        return true; // Optional fields
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" hideClose>
        <DialogHeader>
          <DialogTitle className="text-center">
            Welcome to BizBase AI! 🚀
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="flex justify-center mb-6">
            <Progress value={(step / 3) * 100} className="w-full max-w-xs" />
          </div>
          
          {renderStep()}
          
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setOpen(false)}
              >
                Skip for now
              </Button>
              
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || loading}
              >
                {loading ? (
                  "Creating..."
                ) : step === 3 ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Complete
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              Step {step} of 3 • You can always update this later
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeFlow;
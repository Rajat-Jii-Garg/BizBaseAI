
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  TrendingUp, 
  Target, 
  Award, 
  Brain,
  Zap,
  Trophy,
  CheckCircle,
  ArrowUp,
  Edit,
  Camera,
  MapPin,
  Briefcase,
  Users,
  Eye,
  Crown
} from 'lucide-react';

const EnhancedProfile = ({ profile }) => {
  const [profileScore] = useState(85);
  const [skillProgress] = useState([
    { skill: 'Leadership', progress: 90, trending: true },
    { skill: 'Communication', progress: 75, trending: false },
    { skill: 'Strategy', progress: 80, trending: true },
    { skill: 'Innovation', progress: 70, trending: true }
  ]);

  const achievements = [
    { title: 'Top Performer', icon: Trophy, color: 'text-gold-500' },
    { title: 'Mentor Elite', icon: Star, color: 'text-blue-500' },
    { title: 'Innovation Leader', icon: Brain, color: 'text-purple-500' },
    { title: 'Network Builder', icon: Users, color: 'text-green-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Profile Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-xl">
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-t-lg"></div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </div>
        
        <CardContent className="p-8 -mt-16 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-2xl font-bold">
                  {profile?.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-3 h-3 text-white" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {profile?.full_name || 'Professional User'}
                </h2>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Crown className="w-3 h-3 mr-1" />
                  Pro Elite
                </Badge>
              </div>
              
              <p className="text-lg text-gray-600 mb-3">
                Senior Full Stack Developer & Tech Innovation Leader
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Mumbai, India
                </div>
                <div className="flex items-center">
                  <Briefcase className="w-4 h-4 mr-1" />
                  5+ Years Experience
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  2.5K+ Connections
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  View as Others
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Score & Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Professional Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-green-600 mb-2">{profileScore}/100</div>
              <div className="flex items-center justify-center text-sm text-gray-600">
                <ArrowUp className="w-4 h-4 mr-1 text-green-500" />
                +12 points this month
              </div>
            </div>
            <Progress value={profileScore} className="h-3 mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Profile Completeness</span>
                <span className="font-semibold">95%</span>
              </div>
              <div className="flex justify-between">
                <span>Network Strength</span>
                <span className="font-semibold">88%</span>
              </div>
              <div className="flex justify-between">
                <span>Content Quality</span>
                <span className="font-semibold">82%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-500" />
              Skill Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillProgress.map((skill, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{skill.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{skill.progress}%</span>
                      {skill.trending && (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  </div>
                  <Progress value={skill.progress} className="h-2" />
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4 text-purple-600">
              <Brain className="w-4 h-4 mr-2" />
              AI Skill Assessment
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Professional Achievements */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-orange-500" />
            Professional Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <achievement.icon className={`w-8 h-8 mx-auto mb-2 ${achievement.color}`} />
                <p className="text-sm font-medium">{achievement.title}</p>
              </div>
            ))}
          </div>
          <Button variant="ghost" className="w-full mt-4 text-orange-600">
            <Zap className="w-4 h-4 mr-2" />
            Unlock More Achievements
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedProfile;

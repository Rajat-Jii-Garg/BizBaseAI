import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Languages, 
  Camera,
  Plus,
  Edit3
} from 'lucide-react';

const QuickProfileActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      icon: User,
      title: "Update Profile",
      description: "Edit your basic information",
      action: () => navigate('/user-profile'),
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      icon: Briefcase,
      title: "Add Experience",
      description: "Showcase your work history",
      action: () => navigate('/user-profile'),
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      icon: GraduationCap,
      title: "Add Education",
      description: "Share your academic background",
      action: () => navigate('/user-profile'),
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      icon: Award,
      title: "Add Skills",
      description: "Highlight your expertise",
      action: () => navigate('/user-profile'),
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ];

  return (
    <Card className="bg-white shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-blue-600" />
          Quick Profile Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="ghost"
            className="w-full justify-start h-auto p-3 hover:bg-gray-50"
            onClick={action.action}
          >
            <div className={`p-2 rounded-lg ${action.bgColor} mr-3`}>
              <action.icon className={`w-4 h-4 ${action.color}`} />
            </div>
            <div className="text-left">
              <div className="font-medium text-gray-900">{action.title}</div>
              <div className="text-xs text-gray-500">{action.description}</div>
            </div>
          </Button>
        ))}
        
        <div className="pt-2 border-t">
          <Button
            onClick={() => navigate('/user-profile')}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <User className="w-4 h-4 mr-2" />
            View Full Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickProfileActions;
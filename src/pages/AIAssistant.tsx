import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageSquare, 
  Zap, 
  Star,
  TrendingUp,
  Users,
  Send,
  Bot,
  Sparkles,
  User
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const AIAssistant = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState('');

  const aiTools = [
    {
      title: "Content Generator",
      description: "Get AI-powered post ideas",
      icon: MessageSquare,
      color: "bg-blue-500"
    },
    {
      title: "Profile Optimizer", 
      description: "Improve your profile",
      icon: Star,
      color: "bg-purple-500"
    },
    {
      title: "Networking Strategy",
      description: "Get networking advice",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Career Insights",
      description: "Career guidance",
      icon: TrendingUp,
      color: "bg-orange-500"
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            AI Professional Assistant
          </h1>
          <p className="text-gray-600 mt-2">Your intelligent companion for professional growth</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Quick AI Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {aiTools.map((tool, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${tool.color} text-white`}>
                        <tool.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-gray-900">{tool.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-blue-600" />
                  AI Chat Assistant
                  <Badge variant="secondary" className="ml-auto">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Online
                  </Badge>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Assistant Ready</h3>
                  <p className="text-gray-600">Start a conversation to get personalized professional advice!</p>
                </div>
              </CardContent>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask me anything about your professional growth..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;
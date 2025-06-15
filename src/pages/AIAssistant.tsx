import React, { useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Send, Sparkles, TrendingUp, FileText, Users } from 'lucide-react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";

const AIAssistant = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m BizCopilot, your AI business assistant. I can help you with business insights, generate reports, analyze data, and answer questions about your operations. What would you like to know?',
      timestamp: '10:30 AM'
    }
  ]);

  const quickActions = [
    {
      title: 'Business Summary',
      description: 'Get today\'s business overview',
      icon: TrendingUp,
      prompt: 'Give me a summary of today\'s business performance'
    },
    {
      title: 'Generate Report',
      description: 'Create a monthly business report',
      icon: FileText,
      prompt: 'Generate a comprehensive monthly business report'
    },
    {
      title: 'Customer Analysis',
      description: 'Analyze customer behavior trends',
      icon: Users,
      prompt: 'Analyze our customer behavior and provide insights'
    },
    {
      title: 'Sales Forecast',
      description: 'Predict next month\'s sales',
      icon: TrendingUp,
      prompt: 'Create a sales forecast for next month'
    }
  ];

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setMessages([...messages, newMessage]);
      setMessage('');
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          content: 'I understand your request. Based on your current business data, here are the key insights I can provide...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <AppSidebar />
        <div className="flex-1 min-w-0">
          <DashboardHeader />
          <main className="ml-0 md:ml-64 p-4 md:p-8 max-w-6xl mx-auto w-full">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
                <Brain className="w-8 h-8 mr-3 text-purple-600" />
                BizCopilot AI Assistant
              </h1>
              <p className="text-gray-600">Your intelligent business companion for insights and automation</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
              {/* Quick Actions */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {quickActions.map((action, index) => (
                      <div
                        key={index}
                        onClick={() => handleQuickAction(action.prompt)}
                        className="p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-200 cursor-pointer transition-all duration-200"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <action.icon className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{action.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              {/* Chat Interface */}
              <Card className="lg:col-span-2 flex flex-col">
                <CardHeader>
                  <CardTitle>Chat with BizCopilot</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <div className="flex-1 space-y-4 mb-4 overflow-y-auto max-h-96">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.type === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Input */}
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ask me anything about your business..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AIAssistant;

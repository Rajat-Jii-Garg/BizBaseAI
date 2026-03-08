import DashboardLayout from '@/components/DashboardLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Bot,
  Brain,
  MessageSquare,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Users,
  Zap,
  Target,
  Lightbulb,
  BookOpen,
  Briefcase
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const AIAssistant = () => {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('general');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const aiTools = [
    { title: "Career Coach", description: "Get personalized career advice", icon: Target, color: "bg-green-500", mode: 'career-coach' },
    { title: "Content Ideas", description: "AI-powered post suggestions", icon: Lightbulb, color: "bg-blue-500", mode: 'general' },
    { title: "Profile Tips", description: "Optimize your profile", icon: Star, color: "bg-purple-500", mode: 'career-coach' },
    { title: "Industry Trends", description: "Latest market insights", icon: TrendingUp, color: "bg-orange-500", mode: 'general' },
  ];

  const quickPrompts = [
    "How can I improve my professional profile?",
    "Give me networking tips for my industry",
    "Suggest skills I should learn in 2026",
    "Help me write a professional post",
    "What career moves should I make?",
    "How to build my personal brand?"
  ];

  const sendMessage = async (text) => {
    const userMessage = text || message.trim();
    if (!userMessage || isLoading) return;

    setMessage('');
    setIsLoading(true);

    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const context = `User: ${profile?.full_name || user?.email || 'Anonymous'}, Position: ${profile?.current_position || 'Not set'}, Industry: ${profile?.industry || 'Not set'}, Company: ${profile?.company_name || 'Not set'}, Skills: ${JSON.stringify(profile?.skills || [])}, Experience: ${profile?.experience_years || 0} years`;

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: userMessage, context, mode }
      });

      if (error) throw error;

      const aiResponse = data?.response || "I'm having trouble responding. Please try again!";
      setChatHistory(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('Error:', error);
      if (error.message?.includes('429')) {
        toast.error('Rate limit exceeded. Please wait a moment.');
      }
      setChatHistory(prev => [
        ...prev,
        { role: 'assistant', content: "I'm having trouble responding right now. Please try again in a moment." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="text-center">
          <Badge className="mb-3 bg-purple-100 text-purple-700">
            <Sparkles className="w-3 h-3 mr-1" />
            Powered by BizAI
          </Badge>
          <h1 className="text-3xl font-black text-foreground flex items-center justify-center gap-3">
            <Brain className="w-8 h-8 text-purple-600" />
            BizAI Assistant
          </h1>
          <p className="text-muted-foreground mt-2">Your intelligent companion for professional growth</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {/* Mode Selector */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  AI Mode
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant={mode === 'general' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setMode('general')}
                >
                  <Bot className="w-4 h-4 mr-2" />
                  General Assistant
                </Button>
                <Button
                  variant={mode === 'career-coach' ? 'default' : 'outline'}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setMode('career-coach')}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Career Coach
                </Button>
              </CardContent>
            </Card>

            {/* Quick Tools */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Quick Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {quickPrompts.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-auto py-2 text-left"
                    onClick={() => sendMessage(prompt)}
                  >
                    <Sparkles className="w-3 h-3 mr-2 shrink-0 text-purple-500" />
                    <span className="truncate">{prompt}</span>
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* AI Tools */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  AI Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {aiTools.map((tool, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer hover:border-primary/30"
                    onClick={() => {
                      setMode(tool.mode);
                      sendMessage(`Help me with: ${tool.title} - ${tool.description}`);
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-1.5 rounded-lg ${tool.color} text-white`}>
                        <tool.icon className="w-3 h-3" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-xs text-foreground">{tool.title}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-[700px] flex flex-col border-0 shadow-lg">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="w-5 h-5 text-blue-600" />
                  BizAI Chat
                  <Badge variant="secondary" className="ml-auto text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {mode === 'career-coach' ? 'Career Coach' : 'General'}
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-1 overflow-y-auto p-4">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                        <Brain className="w-10 h-10 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">BizAI Ready</h3>
                      <p className="text-muted-foreground text-sm mb-4">Ask me anything about your career, networking, or business!</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickPrompts.slice(0, 3).map((p, i) => (
                          <Button key={i} variant="outline" size="sm" className="text-xs" onClick={() => sendMessage(p)}>
                            {p}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatHistory.map((msg, index) => (
                      <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        }`}>
                          <div className="flex items-start gap-2">
                            {msg.role === 'assistant' && <Bot className="w-4 h-4 mt-0.5 text-purple-600 shrink-0" />}
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-2xl rounded-bl-sm">
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4 text-purple-600" />
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </CardContent>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder={mode === 'career-coach' ? "Ask BizAI about your career..." : "Ask BizAI anything..."}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={!message.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
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

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
  Send,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
  Target,
  Lightbulb,
} from 'lucide-react';
import SEOHead from '@/components/SEOHead';
import { useState, useRef, useEffect } from 'react';

const AIAssistant = () => {
  const { user, profile } = useAuth();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('general');
  const [showTools, setShowTools] = useState(false);
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
      <SEOHead title="AI Assistant" description="Get AI-powered career coaching and business advice on BizBase AI." path="/ai-assistant" />
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-0 flex flex-col" style={{ height: 'calc(100vh - 100px)' }}>
        
        {/* Chat Card - takes all available space */}
        <Card className="flex-1 flex flex-col border-0 shadow-lg min-h-0 overflow-hidden">
          <CardHeader className="border-b py-3 px-3 sm:px-4 shrink-0">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Bot className="w-5 h-5 text-blue-600" />
              BizAI Chat
              <div className="ml-auto flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px] sm:text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {mode === 'career-coach' ? 'Career Coach' : 'General'}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[10px] sm:text-xs px-2"
                  onClick={() => setShowTools(!showTools)}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Tools
                </Button>
              </div>
            </CardTitle>
          </CardHeader>

          {/* Collapsible tools panel */}
          {showTools && (
            <div className="border-b px-3 py-2 sm:px-4 sm:py-3 bg-muted/30 shrink-0 space-y-2">
              {/* Mode selector */}
              <div className="flex gap-2">
                <Button
                  variant={mode === 'general' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-[10px] sm:text-xs flex-1"
                  onClick={() => setMode('general')}
                >
                  <Bot className="w-3 h-3 mr-1" />
                  General
                </Button>
                <Button
                  variant={mode === 'career-coach' ? 'default' : 'outline'}
                  size="sm"
                  className="h-7 text-[10px] sm:text-xs flex-1"
                  onClick={() => setMode('career-coach')}
                >
                  <Target className="w-3 h-3 mr-1" />
                  Career Coach
                </Button>
              </div>
              {/* AI Tools grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {aiTools.map((tool, index) => (
                  <button
                    key={index}
                    className="p-2 rounded-lg border bg-background hover:shadow-sm transition-all text-left"
                    onClick={() => {
                      setMode(tool.mode);
                      sendMessage(`Help me with: ${tool.title} - ${tool.description}`);
                      setShowTools(false);
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded ${tool.color} text-white`}>
                        <tool.icon className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] sm:text-xs font-medium text-foreground truncate">{tool.title}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages area */}
          <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
            {chatHistory.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center px-2">
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 flex items-center justify-center">
                    <Brain className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
                  </div>
                  <h3 className="text-base sm:text-xl font-bold text-foreground mb-1">BizAI Ready</h3>
                  <p className="text-muted-foreground text-xs sm:text-sm mb-3">Ask me anything about your career, networking, or business!</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {quickPrompts.slice(0, 3).map((p, i) => (
                      <Button key={i} variant="outline" size="sm" className="text-[10px] sm:text-xs h-7 sm:h-8" onClick={() => sendMessage(p)}>
                        {p}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[80%] p-2.5 sm:p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-foreground rounded-bl-sm'
                    }`}>
                      <div className="flex items-start gap-2">
                        {msg.role === 'assistant' && <Bot className="w-4 h-4 mt-0.5 text-purple-600 shrink-0" />}
                        <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
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

          {/* Input area - always at bottom */}
          <div className="p-3 sm:p-4 border-t shrink-0">
            <div className="flex gap-2">
              <Input
                placeholder={mode === 'career-coach' ? "Ask about your career..." : "Ask BizAI anything..."}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex-1 h-10 rounded-[10px] text-sm"
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!message.trim() || isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 h-10 w-10 p-0 rounded-[10px]"
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
    </DashboardLayout>
  );
};

export default AIAssistant;

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CircleUserRound, MessageSquare, Settings, Lightbulb, Book, Code, FileText, Image, Youtube, Link as LucideLink } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const AIAssistant = () => {
  const [prompt, setPrompt] = React.useState("");
  const [response, setResponse] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResponse(`AI Response: ${prompt}`);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex">
      <AppSidebar isCollapsed={false} />
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex space-x-4">
            <Textarea
              placeholder="Enter your prompt here..."
              className="flex-1"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Generating..." : "Generate"}
            </Button>
          </div>
        </form>
        {response && (
          <Card>
            <CardContent>
              <p>{response}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;

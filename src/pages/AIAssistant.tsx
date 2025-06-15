import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '@/components/AppSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, User, Code, File } from 'lucide-react';

const AIAssistant = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 min-w-0 md:ml-64">
          <DashboardHeader />
          <main className="p-4 md:p-8 max-w-5xl mx-auto w-full">
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Assistant</h1>
                <p className="text-gray-600">Your AI-powered business assistant</p>
              </div>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Generate Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chat Interface */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Chat</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">You</p>
                        <p className="text-sm text-gray-700">What are the sales trends for the last quarter?</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      {/* Replacing 化 with User as Assistant avatar */}
                      <User className="w-5 h-5 text-blue-500 mt-1" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">AI Assistant</p>
                        <p className="text-sm text-gray-700">Sales have increased by 15% compared to the previous quarter, with significant growth in the tech sector.</p>
                      </div>
                    </div>
                    <Input type="text" placeholder="Ask me anything..." />
                  </div>
                </CardContent>
              </Card>

              {/* Code Generation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-4 h-4 text-purple-600" />
                    <span>Code Generation</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-700">Need help with code? Describe what you need, and I'll generate it for you.</p>
                    <Input type="text" placeholder="Generate a React component for..." />
                    <Button className="w-full">Generate Code</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* File Analysis */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="w-4 h-4 text-green-600" />
                  <span>File Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-700">Upload a file (CSV, TXT) and I'll analyze it for key insights.</p>
                  <Input type="file" />
                  <Button>Analyze File</Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
export default AIAssistant;

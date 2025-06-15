import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '@/components/AppSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, KanbanSquare, Calendar as CalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const projects = [
  {
    id: 1,
    name: "Website Redesign",
    status: "In Progress",
    lead: "Sarah Johnson",
    due: "2025-07-10",
    tasks: 9,
    completed: 6
  },
  {
    id: 2,
    name: "Mobile App Launch",
    status: "Planning",
    lead: "Mike Chen",
    due: "2025-08-01",
    tasks: 12,
    completed: 4
  },
  {
    id: 3,
    name: "Brand Refresh",
    status: "Done",
    lead: "Emily R.",
    due: "2025-06-25",
    tasks: 5,
    completed: 5
  }
];

const statusColor = {
  "Planning": "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "Done": "bg-green-100 text-green-800"
};

const Projects = () => {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <AppSidebar />
      <div className="flex-1 min-w-0 md:ml-64">
        <DashboardHeader />
        <main className="p-4 md:p-8 max-w-6xl mx-auto w-full">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
              <p className="text-gray-600">Collaborate & Track Progress with AI-driven Insights</p>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Planning", "In Progress", "Done"].map((status) => (
              <Card key={status}>
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {status === "Planning" && <KanbanSquare className="text-yellow-600 w-4 h-4" />}
                    {status === "In Progress" && <KanbanSquare className="text-blue-600 w-4 h-4" />}
                    {status === "Done" && <KanbanSquare className="text-green-600 w-4 h-4" />}
                    {status}
                  </CardTitle>
                  <span className="text-gray-400 text-sm">{projects.filter(p => p.status === status).length}</span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projects.filter(p => p.status === status).map(project => (
                      <div key={project.id} className="p-4 rounded-lg bg-gradient-to-r from-white to-gray-50 border border-gray-100 hover-scale shadow transition cursor-pointer">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{project.name}</span>
                          <span className={`text-xs px-3 py-1 rounded ${statusColor[project.status]}`}>{project.status}</span>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>Lead: <b>{project.lead}</b></span>
                          <span><CalIcon className="inline w-4 h-4" /> {project.due}</span>
                        </div>
                        <div className="flex space-x-2 mt-2">
                          <span className="text-green-600">{project.completed} / {project.tasks} done</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Projects;

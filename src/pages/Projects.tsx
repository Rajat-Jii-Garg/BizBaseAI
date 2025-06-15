import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '@/components/AppSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card } from '@/components/ui/card';
import { Plus, KanbanSquare, Calendar as CalIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Project data
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

// Status color utility
const statusStyles = {
  "Planning": "bg-yellow-100 text-yellow-800 border border-yellow-200",
  "In Progress": "bg-blue-100 text-blue-800 border border-blue-200",
  "Done": "bg-green-100 text-green-800 border border-green-200"
};
const statusBadge = {
  "Planning": "bg-yellow-50 text-yellow-700 border border-yellow-200",
  "In Progress": "bg-blue-50 text-blue-700 border border-blue-200",
  "Done": "bg-green-50 text-green-700 border border-green-200"
};
const statusIcon = {
  "Planning": <KanbanSquare className="w-5 h-5 text-yellow-600 inline" />,
  "In Progress": <KanbanSquare className="w-5 h-5 text-blue-600 inline" />,
  "Done": <KanbanSquare className="w-5 h-5 text-green-600 inline" />,
};

const Projects = () => {
  const projectStatuses = ["Planning", "In Progress", "Done"];
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <AppSidebar />
        <div className="flex-1 ml-0 md:ml-64 bg-gray-50">
          <DashboardHeader />
          <main className="py-10 px-2 md:px-8 max-w-7xl mx-auto w-full">
            <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-1 leading-tight">Projects</h1>
                <p className="text-lg text-gray-500 font-medium tracking-tight">Collaborate & Track Progress with AI-driven Insights</p>
              </div>
              <Button className="bg-gradient-to-tr from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 px-6 py-2 rounded-lg text-base shadow-lg animate-fade-in">
                <Plus className="w-5 h-5" />
                New Project
              </Button>
            </div>

            {/* Project Boards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projectStatuses.map((status) => {
                const theseProjects = projects.filter(p => p.status === status);
                return (
                  <div key={status}>
                    <div className="flex items-center gap-2 mb-4 pl-2">
                      {statusIcon[status]}
                      <h2 className="text-xl font-bold">{status}</h2>
                      <span className="ml-auto text-gray-400 text-sm font-medium">{theseProjects.length}</span>
                    </div>
                    <div className="flex flex-col gap-6">
                      {theseProjects.map(project => (
                        <Card key={project.id} className={`p-6 bg-white border-2 border-gray-100 rounded-2xl hover:shadow-xl transition-shadow duration-200 cursor-pointer hover-scale`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-lg">{project.name}</span>
                            <span className={`px-3 py-1 text-xs font-medium rounded-lg ${statusBadge[project.status]}`}>
                              {project.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 items-center text-xs mb-2">
                            <span className="text-gray-500">
                              Lead: <b className="text-gray-700">{project.lead}</b>
                            </span>
                            <span className="text-gray-400 flex items-center gap-1">
                              <CalIcon className="w-4 h-4" />
                              {project.due}
                            </span>
                          </div>
                          <div className="mt-2 text-sm font-semibold">
                            <span className={`${
                              project.completed === project.tasks
                                ? 'text-green-600'
                                : 'text-blue-600'
                            }`}>
                              {project.completed} / {project.tasks} done
                            </span>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Projects;

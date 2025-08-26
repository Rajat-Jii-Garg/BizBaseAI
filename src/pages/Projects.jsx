import AppSidebar from "@/components/AppSidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  Archive,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  MoreHorizontal,
  PlusCircle,
  Search,
  Users
} from "lucide-react";

const Projects = () => {
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      description: "Complete overhaul of company website with new branding",
      progress: 75,
      status: "In Progress",
      dueDate: "Oct 15, 2023",
      team: [
        { name: "Alex Johnson", avatar: "https://i.pravatar.cc/150?img=1" },
        { name: "Maria Garcia", avatar: "https://i.pravatar.cc/150?img=2" },
        { name: "David Kim", avatar: "https://i.pravatar.cc/150?img=3" },
      ],
      tasks: { completed: 24, total: 32 }
    },
    {
      id: 2,
      name: "Mobile App Development",
      description: "iOS and Android app for customer engagement",
      progress: 45,
      status: "In Progress",
      dueDate: "Nov 30, 2023",
      team: [
        { name: "Sarah Wilson", avatar: "https://i.pravatar.cc/150?img=4" },
        { name: "James Lee", avatar: "https://i.pravatar.cc/150?img=5" },
      ],
      tasks: { completed: 18, total: 40 }
    },
    {
      id: 3,
      name: "Q4 Marketing Campaign",
      description: "Holiday season promotional activities",
      progress: 20,
      status: "Planning",
      dueDate: "Dec 1, 2023",
      team: [
        { name: "Emily Chen", avatar: "https://i.pravatar.cc/150?img=6" },
        { name: "Robert Taylor", avatar: "https://i.pravatar.cc/150?img=7" },
        { name: "Lisa Wong", avatar: "https://i.pravatar.cc/150?img=8" },
      ],
      tasks: { completed: 5, total: 25 }
    },
    {
      id: 4,
      name: "CRM Integration",
      description: "Connect sales data with new CRM system",
      progress: 90,
      status: "Review",
      dueDate: "Oct 5, 2023",
      team: [
        { name: "Michael Brown", avatar: "https://i.pravatar.cc/150?img=9" },
        { name: "Jennifer Davis", avatar: "https://i.pravatar.cc/150?img=10" },
      ],
      tasks: { completed: 27, total: 30 }
    },
    {
      id: 5,
      name: "Product Launch",
      description: "New product line introduction to market",
      progress: 100,
      status: "Completed",
      dueDate: "Sep 15, 2023",
      team: [
        { name: "Daniel Martinez", avatar: "https://i.pravatar.cc/150?img=11" },
        { name: "Sophia Anderson", avatar: "https://i.pravatar.cc/150?img=12" },
        { name: "William Johnson", avatar: "https://i.pravatar.cc/150?img=13" },
      ],
      tasks: { completed: 45, total: 45 }
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-500";
      case "In Progress": return "bg-blue-500";
      case "Planning": return "bg-purple-500";
      case "Review": return "bg-amber-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "Completed": return "text-green-500";
      case "In Progress": return "text-blue-500";
      case "Planning": return "text-purple-500";
      case "Review": return "text-amber-500";
      default: return "text-gray-500";
    }
  };

  return (
    <div className="flex">
      <AppSidebar isCollapsed={false} />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage and track your team projects</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button className="gap-2">
              <Filter size={18} />
              Filter
            </Button>
            <Button className="gap-2">
              <PlusCircle size={18} />
              New Project
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className={`h-2 ${getStatusColor(project.status)}`}></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-xl">{project.name}</h3>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal size={18} />
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{project.dueDate}</span>
                        </div>
                        <Badge variant={project.status === "Completed" ? "outline" : "default"} 
                          className={getStatusTextColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {project.team.map((member, i) => (
                            <Avatar key={i} className="border-2 border-background w-8 h-8">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CheckCircle2 size={14} />
                          <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Card className="border-dashed flex items-center justify-center h-[300px]">
                <Button variant="ghost" className="flex flex-col gap-2 h-auto py-8">
                  <PlusCircle size={24} />
                  <span>Add New Project</span>
                </Button>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(p => p.status !== "Completed").map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className={`h-2 ${getStatusColor(project.status)}`}></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-xl">{project.name}</h3>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal size={18} />
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{project.dueDate}</span>
                        </div>
                        <Badge variant="default" className={getStatusTextColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {project.team.map((member, i) => (
                            <Avatar key={i} className="border-2 border-background w-8 h-8">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CheckCircle2 size={14} />
                          <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.filter(p => p.status === "Completed").map((project) => (
                <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-0">
                    <div className={`h-2 ${getStatusColor(project.status)}`}></div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-xl">{project.name}</h3>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal size={18} />
                        </Button>
                      </div>
                      <p className="text-muted-foreground text-sm mb-4">{project.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{project.dueDate}</span>
                        </div>
                        <Badge variant="outline" className="text-green-500">
                          {project.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex -space-x-2">
                          {project.team.map((member, i) => (
                            <Avatar key={i} className="border-2 border-background w-8 h-8">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <CheckCircle2 size={14} />
                          <span>{project.tasks.completed}/{project.tasks.total} tasks</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="archived">
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <Archive className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium mb-2">No archived projects</h3>
              <p className="text-muted-foreground mb-4">You haven't archived any projects yet.</p>
              <Button variant="outline">View All Projects</Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <h3 className="text-2xl font-bold">{projects.length}</h3>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users size={20} className="text-blue-600" />
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpRight size={14} className="mr-1" />
                <span>12% increase</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <h3 className="text-2xl font-bold">{projects.filter(p => p.status === "In Progress").length}</h3>
                </div>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Clock size={20} className="text-amber-600" />
                </div>
              </div>
              <div className="flex items-center text-sm text-amber-600">
                <span>Active projects</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <h3 className="text-2xl font-bold">{projects.filter(p => p.status === "Completed").length}</h3>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle2 size={20} className="text-green-600" />
                </div>
              </div>
              <div className="flex items-center text-sm text-green-600">
                <ArrowUpRight size={14} className="mr-1" />
                <span>23% increase</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">At Risk</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle size={20} className="text-red-600" />
                </div>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>No projects at risk</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Projects;

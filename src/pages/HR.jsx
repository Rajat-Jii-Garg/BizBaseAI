import React from 'react';
import AppSidebar from "@/components/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Plus, 
  UserPlus, 
  Calendar, 
  FileText, 
  BarChart3, 
  Clock, 
  Award, 
  Briefcase,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock3
} from "lucide-react";

const HR = () => {
  return (
    <div className="flex">
      <AppSidebar isCollapsed={false} />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Human Resources</h1>
            <p className="text-gray-500">Manage your team, recruitment, and HR operations</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input className="pl-10 w-[280px]" placeholder="Search employees, positions..." />
            </div>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </div>

        <Tabs defaultValue="employees" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="employees">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Total Employees</p>
                        <p className="text-2xl font-bold">124</p>
                      </div>
                    </div>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">+4% ↑</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-8 w-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Active</p>
                        <p className="text-2xl font-bold">118</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">95%</Badge>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock3 className="h-8 w-8 text-amber-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Time Off Requests</p>
                        <p className="text-2xl font-bold">7</p>
                      </div>
                    </div>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">Employee Directory</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="mr-2 h-4 w-4" />
                      Export
                    </Button>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add New
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Alex Johnson",
                      role: "Senior Developer",
                      department: "Engineering",
                      avatar: "/avatars/01.png",
                      status: "active"
                    },
                    {
                      name: "Sarah Williams",
                      role: "Product Manager",
                      department: "Product",
                      avatar: "/avatars/02.png",
                      status: "active"
                    },
                    {
                      name: "Michael Chen",
                      role: "UI/UX Designer",
                      department: "Design",
                      avatar: "/avatars/03.png",
                      status: "active"
                    },
                    {
                      name: "Emily Rodriguez",
                      role: "Marketing Specialist",
                      department: "Marketing",
                      avatar: "/avatars/04.png",
                      status: "leave"
                    },
                    {
                      name: "David Kim",
                      role: "Data Analyst",
                      department: "Analytics",
                      avatar: "/avatars/05.png",
                      status: "active"
                    },
                    {
                      name: "Lisa Patel",
                      role: "HR Coordinator",
                      department: "Human Resources",
                      avatar: "/avatars/06.png",
                      status: "active"
                    }
                  ].map((employee, i) => (
                    <Card key={i} className="overflow-hidden">
                      <div className="h-2 bg-blue-500"></div>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-14 w-14">
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold">{employee.name}</h4>
                            <p className="text-sm text-gray-500">{employee.role}</p>
                            <div className="flex items-center mt-2">
                              <Badge variant={employee.status === "active" ? "default" : "outline"} className="text-xs">
                                {employee.status === "active" ? "Active" : "On Leave"}
                              </Badge>
                              <span className="text-xs text-gray-500 ml-2">{employee.department}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button variant="outline" size="sm" className="w-full">Profile</Button>
                          <Button variant="outline" size="sm" className="w-full">Message</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="recruitment">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Briefcase className="h-8 w-8 text-purple-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Open Positions</p>
                        <p className="text-2xl font-bold">12</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-8 w-8 text-indigo-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Total Applicants</p>
                        <p className="text-2xl font-bold">87</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-8 w-8 text-teal-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Interviews Scheduled</p>
                        <p className="text-2xl font-bold">24</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <div className="p-6">
                <h3 className="font-semibold text-lg mb-4">Recent Applications</h3>
                <div className="space-y-4">
                  {[
                    {
                      name: "Jennifer Lee",
                      position: "Frontend Developer",
                      date: "2 days ago",
                      status: "review"
                    },
                    {
                      name: "Robert Martinez",
                      position: "Product Designer",
                      date: "3 days ago",
                      status: "interview"
                    },
                    {
                      name: "Amanda Wilson",
                      position: "Marketing Manager",
                      date: "1 week ago",
                      status: "review"
                    }
                  ].map((applicant, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>{applicant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{applicant.name}</h4>
                          <p className="text-sm text-gray-500">{applicant.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">{applicant.date}</span>
                        <Badge variant={applicant.status === "review" ? "outline" : "default"}>
                          {applicant.status === "review" ? "In Review" : "Interview Scheduled"}
                        </Badge>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendance">
            <Card>
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg">Attendance Overview</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-8 w-8 text-green-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Present Today</p>
                          <p className="text-2xl font-bold">112</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <AlertCircle className="h-8 w-8 text-red-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Absent</p>
                          <p className="text-2xl font-bold">6</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Clock className="h-8 w-8 text-amber-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Late</p>
                          <p className="text-2xl font-bold">8</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">On Leave</p>
                          <p className="text-2xl font-bold">4</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Attendance Chart Placeholder</p>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <Card>
              <div className="p-6 border-b">
                <h3 className="font-semibold text-lg">Performance Reviews</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Award className="h-8 w-8 text-amber-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Reviews Completed</p>
                          <p className="text-2xl font-bold">78</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Average Score</p>
                          <p className="text-2xl font-bold">4.2/5</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Calendar className="h-8 w-8 text-purple-500 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Upcoming Reviews</p>
                          <p className="text-2xl font-bold">12</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Performance Metrics Placeholder</p>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="documents">
            <Card>
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">HR Documents</h3>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      name: "Employee Handbook 2023",
                      type: "PDF",
                      size: "2.4 MB",
                      updated: "2 months ago"
                    },
                    {
                      name: "Onboarding Checklist",
                      type: "DOCX",
                      size: "540 KB",
                      updated: "1 month ago"
                    },
                    {
                      name: "Benefits Overview",
                      type: "PDF",
                      size: "1.8 MB",
                      updated: "3 months ago"
                    },
                    {
                      name: "Company Policies",
                      type: "PDF",
                      size: "3.2 MB",
                      updated: "2 months ago"
                    }
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 p-2 rounded">
                          <FileText className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-gray-500">{doc.type} • {doc.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">Updated {doc.updated}</span>
                        <Button variant="outline" size="sm">Download</Button>
                        <Button variant="ghost" size="sm">View</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HR;

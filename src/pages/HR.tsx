import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '@/components/AppSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, UserPlus, Mail, Calendar } from 'lucide-react';

const team = [
  {
    id: 1, name: "Sarah Johnson", email: "sarah@company.com", role: "Product Lead", since: "2022", avatar: "https://randomuser.me/api/portraits/women/1.jpg"
  },
  {
    id: 2, name: "Mike Chen", email: "mike@company.com", role: "Engineer", since: "2023", avatar: "https://randomuser.me/api/portraits/men/2.jpg"
  },
  {
    id: 3, name: "Emily R.", email: "emily@company.com", role: "UX Designer", since: "2023", avatar: "https://randomuser.me/api/portraits/women/3.jpg"
  }
];

const HR = () => {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <AppSidebar />
      <div className="flex-1 min-w-0 md:ml-64">
        <DashboardHeader />
        <main className="p-4 md:p-8 max-w-5xl mx-auto w-full">
          <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Team & HR</h1>
              <p className="text-gray-600">Manage your team, leaves, and invites seamlessly</p>
            </div>
            <Button className="flex gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white">
              <UserPlus className="w-4 h-4" />
              Invite Member
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid xs:grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {team.map(member => (
                  <div key={member.id} className="flex items-center gap-4 bg-white shadow rounded-lg p-4 hover-scale transition w-full">
                    <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" />
                    <div>
                      <div className="font-medium">{member.name}</div>
                      <div className="text-xs text-gray-400">{member.role}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 flex-wrap">
                        <Mail className="w-3 h-3" /> {member.email}
                        <Calendar className="w-3 h-3" /> Since {member.since}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default HR;

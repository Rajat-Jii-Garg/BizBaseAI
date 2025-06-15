import React from "react";
import AppSidebar from "@/components/AppSidebar";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Total Revenue",
      value: "$24,345",
      change: "+12.5%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Active Users",
      value: "1,293",
      change: "+18.2%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Pending Tasks",
      value: "48",
      change: "-5.1%",
      icon: CheckCircle,
      trend: "down",
    },
    {
      title: "Open Tickets",
      value: "23",
      change: "+3.7%",
      icon: AlertCircle,
      trend: "up",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "New client onboarded",
      time: "2 hours ago",
      user: "Sarah Johnson",
    },
    {
      id: 2,
      action: "Invoice #3452 paid",
      time: "5 hours ago",
      user: "Finance Team",
    },
    {
      id: 3,
      action: "Project milestone completed",
      time: "Yesterday",
      user: "Dev Team",
    },
    {
      id: 4,
      action: "New feature request submitted",
      time: "Yesterday",
      user: "Customer Support",
    },
    {
      id: 5,
      action: "Weekly report generated",
      time: "2 days ago",
      user: "System",
    },
  ];

  return (
    <div className="flex">
      <AppSidebar isCollapsed={false} />
      <div className="flex-1 p-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="border-none shadow-md">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                    </div>
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <stat.icon className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div
                    className={`flex items-center mt-4 text-sm ${
                      stat.trend === "up"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>{stat.change} from last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Section */}
            <Card className="lg:col-span-2 border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Performance Overview</h2>
                  <select className="border rounded px-2 py-1 text-sm">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                  </select>
                </div>
                <div className="h-80 flex items-center justify-center bg-gray-100 rounded-lg">
                  <BarChart3 className="h-16 w-16 text-gray-400" />
                  <p className="ml-4 text-gray-500">Chart visualization goes here</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-full mr-4">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{activity.action}</p>
                        <div className="flex text-xs text-gray-500 mt-1">
                          <span>{activity.user}</span>
                          <span className="mx-2">•</span>
                          <span>{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 text-center text-sm text-blue-600 hover:text-blue-800">
                  View all activity
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Section */}
          <div className="mt-8">
            <Card className="border-none shadow-md">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold">Upcoming Schedule</h2>
                  <button className="text-blue-600 text-sm hover:text-blue-800">
                    + Add Event
                  </button>
                </div>
                <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                  <Calendar className="h-16 w-16 text-gray-400" />
                  <p className="ml-4 text-gray-500">Calendar view goes here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

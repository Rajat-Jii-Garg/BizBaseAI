
import React from 'react';
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from '@/components/AppSidebar';
import DashboardHeader from '@/components/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Receipt, Wallet, DollarSign } from 'lucide-react';

const finances = [
  { type: "Income", icon: DollarSign, value: "$32,000", desc: "This Month", color: "text-green-600" },
  { type: "Expense", icon: Wallet, value: "$18,400", desc: "This Month", color: "text-red-500" },
  { type: "Invoice Generated", icon: Receipt, value: "16", desc: "Invoices sent", color: "text-blue-600" },
  { type: "AI Insights", icon: TrendingUp, value: "+14%", desc: "Profit Growth", color: "text-purple-600" }
];

const Finance = () => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <AppSidebar />
        <div className="flex-1 min-w-0">
          <DashboardHeader />
          <main className="ml-0 md:ml-64 p-4 md:p-8 max-w-5xl mx-auto w-full">
            <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Finance & Accounting</h1>
                <p className="text-gray-600">Track your financial pulse with live insights</p>
              </div>
              <button className="bg-gradient-to-r from-green-600 to-purple-600 px-5 py-2 rounded-lg text-white text-sm shadow hover:scale-105 transition">
                Add Transaction
              </button>
            </div>
            <div className="grid xs:grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              {finances.map(item => (
                <Card key={item.type}>
                  <CardContent className="flex items-center p-6 gap-4">
                    <item.icon className={`w-8 h-8 ${item.color}`} />
                    <div>
                      <div className="text-lg font-bold text-gray-900">{item.value}</div>
                      <div className="text-xs text-gray-500">{item.desc}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="w-full min-h-[140px] bg-gradient-to-r from-green-100/50 via-white to-purple-100/50 rounded-xl flex items-center justify-center text-2xl text-purple-700 font-bold shadow animate-fade-in p-4 text-center">
              AI Smart: “Your monthly burn rate decreased 9% vs last month. Try reducing unused SaaS subscriptions for more savings.”
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Finance;

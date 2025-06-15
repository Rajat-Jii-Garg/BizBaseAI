import React from "react";
import AppSidebar from "@/components/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  DollarSign,
  Download,
  LineChart,
  PieChart,
  Plus,
  Receipt,
  TrendingUp,
  Upload,
  Wallet,
} from "lucide-react";

const Finance = () => {
  return (
    <div className="flex">
      <AppSidebar isCollapsed={false} />
      <div className="flex-1 p-8 pt-6 bg-gradient-to-br from-[#f8fafc] to-[#eef2f7]">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Finance Dashboard</h1>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              New Transaction
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Balance</p>
                  <h3 className="text-2xl font-bold text-gray-900">$24,563.00</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +2.5% from last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Income</p>
                  <h3 className="text-2xl font-bold text-gray-900">$12,580.00</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +8.2% from last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Expenses</p>
                  <h3 className="text-2xl font-bold text-gray-900">$8,120.00</h3>
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +3.1% from last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Investments</p>
                  <h3 className="text-2xl font-bold text-gray-900">$6,240.00</h3>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    +12.3% from last month
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mb-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-gray-500" />
                    Revenue vs Expenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center text-gray-500">
                  [Revenue vs Expenses Chart]
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium flex items-center">
                    <PieChart className="h-5 w-5 mr-2 text-gray-500" />
                    Expense Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80 flex items-center justify-center text-gray-500">
                  [Expense Breakdown Chart]
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                          {i % 2 === 0 ? (
                            <Upload className={`h-5 w-5 text-green-600`} />
                          ) : (
                            <Download className={`h-5 w-5 text-red-600`} />
                          )}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900">
                            {i % 2 === 0 ? 'Payment Received' : 'Software Subscription'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {i % 2 === 0 ? '+$1,200.00' : '-$49.99'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {i % 2 === 0 ? 'Income' : 'Expense'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="transactions">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-10 text-gray-500">
                  Transactions content
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="invoices">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-10 text-gray-500">
                  Invoices content
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="reports">
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-10 text-gray-500">
                  Reports content
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Finance;

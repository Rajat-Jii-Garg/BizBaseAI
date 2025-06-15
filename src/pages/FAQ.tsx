
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";

const faqs = [
  {
    q: "How do I add a new team member?",
    a: "Go to HR > Invite Member. (Requires admin access.)"
  },
  {
    q: "How to change my profile photo?",
    a: "Settings > Profile section. (Upload is UI-only for now.)"
  },
  {
    q: "Is the data persistent?",
    a: "No, this is a frontend-only demo. Backend integration coming soon."
  },
  {
    q: "I found a bug! Where do I report?",
    a: "Use the Contact/Support link, or email support@example.com"
  }
];

const FAQ = () => (
  <SidebarProvider>
    <div className="flex h-screen bg-gray-50 w-full">
      <AppSidebar />
      <div className="flex-1">
        <DashboardHeader />
        <main className="ml-64 p-6 max-w-2xl">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">🔥 FAQ & Support</h1>
          <div className="space-y-5">
            {faqs.map((f, i) =>
              <div key={i} className="bg-white shadow rounded-lg p-4 border">
                <div className="font-semibold text-blue-600">{f.q}</div>
                <div className="text-gray-700 mt-1">{f.a}</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  </SidebarProvider>
);

export default FAQ;

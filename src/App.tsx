import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import AIAssistant from "./pages/AIAssistant";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import HR from "./pages/HR";
import Finance from "./pages/Finance";
import Settings from "./pages/Settings";
import Loader from "@/components/Loader";
import * as React from "react";
import { useLocation } from "react-router-dom";

const queryClient = new QueryClient();

const App = () => {
  const location = useLocation();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 350); // Simulate route transition, remove in real app
    return () => clearTimeout(t);
  }, [location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {loading && <Loader />}
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/crm" element={<CRM />} />
            <Route path="/dashboard/projects" element={<Projects />} />
            <Route path="/dashboard/hr" element={<HR />} />
            <Route path="/dashboard/finance" element={<Finance />} />
            <Route path="/dashboard/ai-assistant" element={<AIAssistant />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

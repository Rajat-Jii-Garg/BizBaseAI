
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import PublicProfile from "./pages/PublicProfile";
import Feed from "./pages/Feed";
import Network from "./pages/Network";
import Analytics from "./pages/Analytics";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Connections from "./pages/Connections";
import Communities from "./pages/Communities";
import Community from "./pages/Community";
import Settings from "./pages/Settings";
import Events from "./pages/Events";
import Insights from "./pages/Insights";
import AIAssistant from "./pages/AIAssistant";
import BusinessSetup from "./pages/BusinessSetup";
import Jobs from "./pages/Jobs";
import CRM from "./pages/CRM";
import Projects from "./pages/Projects";
import HR from "./pages/HR";
import Finance from "./pages/Finance";
import NotFound from "./pages/NotFound";
import Demo from "./pages/Demo";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import ProfileDashboard from "./pages/ProfileDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/network" element={<Network />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/connections" element={
              <ProtectedRoute>
                <Connections />
              </ProtectedRoute>
            } />
            <Route path="/communities" element={
              <ProtectedRoute>
                <Communities />
              </ProtectedRoute>
            } />
            <Route path="/communities/:id" element={
              <ProtectedRoute>
                <Community />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/events" element={
              <ProtectedRoute>
                <Events />
              </ProtectedRoute>
            } />
            <Route path="/insights" element={
              <ProtectedRoute>
                <Insights />
              </ProtectedRoute>
            } />
            <Route path="/ai-assistant" element={
              <ProtectedRoute>
                <AIAssistant />
              </ProtectedRoute>
            } />
            <Route path="/business-setup" element={
              <ProtectedRoute>
                <BusinessSetup />
              </ProtectedRoute>
            } />
            <Route path="/jobs" element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/crm" element={
              <ProtectedRoute>
                <CRM />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/projects" element={
              <ProtectedRoute>
                <Projects />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/hr" element={
              <ProtectedRoute>
                <HR />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/finance" element={
              <ProtectedRoute>
                <Finance />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/business-setup" element={
              <ProtectedRoute>
                <BusinessSetup />
              </ProtectedRoute>
            } />
            <Route path="/demo" element={<Demo />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/profile-dashboard" element={
              <ProtectedRoute>
                <ProfileDashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

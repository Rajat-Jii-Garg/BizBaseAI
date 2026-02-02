// Build version: v4
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { BusinessProvider } from "@/contexts/BusinessContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
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
import BusinessLayout from "@/components/BusinessLayout";
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
import ProfilePreviewPage from "./pages/ProfilePreviewPage";

// Business pages
import { 
  BusinessDashboard, 
  MyBusinesses,
  BusinessCRM,
  BusinessFinance,
  BusinessRedirect,
  BusinessTeam,
  BusinessServices,
  BusinessProjects,
  BusinessSettings
} from "./pages/Businesses";
// Username profile resolver
import UsernameProfile from "./pages/UsernameProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <BusinessProvider>
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
              {/* View other user profile */}
              <Route path="/profile/:userId" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/profile/preview/:userId" element={
                <ProtectedRoute>
                  <ProfilePreviewPage />
                </ProtectedRoute>
              }/>
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
              <Route path="/demo" element={<Demo />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/profile-dashboard" element={
                <ProtectedRoute>
                  <ProfileDashboard />
                </ProtectedRoute>
              } />
              
              {/* Business Routes */}
              <Route path="/my-businesses" element={
                <ProtectedRoute>
                  <MyBusinesses />
                </ProtectedRoute>
              } />
              <Route path="/business" element={
                <ProtectedRoute>
                  <BusinessRedirect />
                </ProtectedRoute>
              } />

              <Route path="/business/:slug" element={
                <ProtectedRoute>
                  <BusinessLayout />
                </ProtectedRoute>
              }>

              <Route index element={<BusinessDashboard />} />

              <Route path="dashboard" element={
                <ProtectedRoute>
                  <BusinessDashboard />
                </ProtectedRoute>
              } />
              <Route path="crm" element={
                <ProtectedRoute>
                  <BusinessCRM />
                </ProtectedRoute>
              } />
              <Route path="finance" element={
                <ProtectedRoute>
                  <BusinessFinance />
                </ProtectedRoute>
              } />
              <Route path="team" element={
                <ProtectedRoute>
                  <BusinessTeam />
                </ProtectedRoute>
              } />
              <Route path="services" element={
                <ProtectedRoute>
                  <BusinessServices />
                </ProtectedRoute>
              } />
              <Route path="projects" element={
                <ProtectedRoute>
                  <BusinessProjects />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute>
                  <BusinessSettings />
                </ProtectedRoute>
              } />
              
              {/* Username-based profile route - must be LAST to avoid conflicts */}
              <Route path="/@:username" element={<UsernameProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

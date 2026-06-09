// Build version: v4
import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from '@/contexts/AuthContext';
import { BusinessProvider } from '@/contexts/BusinessContext';
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import { Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
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
import BusinessLayout from "./components/BusinessLayout";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
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
import Leaderboard from "./pages/Leaderboard";
import Referrals from "./pages/Referrals";
import Blog from "./pages/Blog";

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
import SinglePostPage from "./pages/SinglePostPage";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminPosts from "./pages/admin/AdminPosts";
import AdminBusinesses from "./pages/admin/AdminBusinesses";
import AdminJobs from "./pages/admin/AdminJobs";
import AdminCommunities from "./pages/admin/AdminCommunities";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";

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
              <Route path="/forget-password" element={<ForgetPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/network" element={<Network />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              {/* View other user profile */}
              {/* <Route path="/profile/:userId" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } /> */}
              {/* <Route path="/profile/preview/:userId" element={
                <ProtectedRoute>
                  <ProfilePreviewPage />
                </ProtectedRoute>
              }/> */}
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
              <Route path="/communities" element={<Communities />} />
              <Route path="/communities/:id" element={<Community />} />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/events" element={<Events />} />
              <Route path="/insights" element={
                <ProtectedRoute>
                  <Insights />
                </ProtectedRoute>
              } />
              <Route path="/ai-assistant" element={<AIAssistant />} />
              <Route path="/business-setup" element={
                <ProtectedRoute>
                  <BusinessSetup />
                </ProtectedRoute>
              } />
              <Route path="/jobs" element={<Jobs />} />
              {/* Public job detail page (SEO indexable) */}
              <Route path="/jobs/:slug" element={<JobDetail />} />
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
              <Route path="/blog" element={<Blog />} />
              
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              } />
              <Route path="/referrals" element={
                <ProtectedRoute>
                  <Referrals />
                </ProtectedRoute>
              } />
              {/* <Route path="/profile-dashboard" element={
                <ProtectedRoute>
                  <ProfileDashboard />
                </ProtectedRoute>
              } /> */}
              
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
                <Route path="dashboard" element={<BusinessDashboard />} />
                <Route path="crm" element={<BusinessCRM />} />
                <Route path="finance" element={<BusinessFinance />} />
                <Route path="team" element={<BusinessTeam />} />
                <Route path="projects" element={<BusinessProjects />} />
                <Route path="settings" element={<BusinessSettings />} />
                <Route path="services" element={<BusinessServices />} />
              </Route>
              {/* Admin Panel Routes */}
              <Route path="/admin-panel" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="posts" element={<AdminPosts />} />
                <Route path="businesses" element={<AdminBusinesses />} />
                <Route path="jobs" element={<AdminJobs />} />
                <Route path="communities" element={<AdminCommunities />} />
                <Route path="events" element={<AdminEvents />} />
                <Route path="analytics" element={<AdminAnalytics />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
              <Route path="/admin-login" element={<AdminLogin />} />

              {/* Username-based profile route - must be LAST to avoid conflicts */}
              <Route path="/:username/post/:postId" element={<SinglePostPage />} />
              <Route path="/:username" element={<UsernameProfile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BusinessProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

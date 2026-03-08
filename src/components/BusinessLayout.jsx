import React, { useEffect, useState, createContext, useContext } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BusinessSidebar from './BusinessSidebar';
import BusinessHeader from './BusinessHeader';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const SidebarContext = createContext();
export const useBusinessSidebar = () => useContext(SidebarContext);

const BusinessLayout = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { switchBusiness, currentBusiness, loading, isBusinessOwner } = useBusinessContext();
  const [initializing, setInitializing] = useState(true);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [slug, isMobile]);

  useEffect(() => {
    const initBusiness = async () => {
      if (!user) { navigate('/login'); return; }
      if (slug && (!currentBusiness || currentBusiness.username !== slug)) {
        await switchBusiness(slug);
      }
      setInitializing(false);
    };
    initBusiness();
  }, [slug, user, currentBusiness, switchBusiness, navigate]);

  useEffect(() => {
    if (!loading && !initializing && slug && currentBusiness && !isBusinessOwner(slug)) {
      navigate('/dashboard');
    }
  }, [loading, initializing, slug, isBusinessOwner, navigate]);

  if (loading || initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-2">Business not found</h2>
          <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline text-sm">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header - full width on top */}
        <BusinessHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

        {/* Below header: sidebar + content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile overlay */}
          {isMobile && sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <div className={`
            ${isMobile
              ? `fixed top-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
              : 'relative flex-shrink-0'
            }
          `}>
            <BusinessSidebar onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default BusinessLayout;

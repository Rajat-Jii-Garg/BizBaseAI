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
  const { switchBusiness, currentBusiness, loading } = useBusinessContext();
  const [initializing, setInitializing] = useState(true);
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [syncVersion, setSyncVersion] = useState(0);

  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [slug, isMobile]);

  useEffect(() => {
    let timer;
    const onChange = () => { clearTimeout(timer); timer = setTimeout(() => setSyncVersion((v) => v + 1), 450); };
    window.addEventListener('bizbase:business-data-changed', onChange);
    return () => { clearTimeout(timer); window.removeEventListener('bizbase:business-data-changed', onChange); };
  }, []);

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
    if (!loading && !initializing && slug && !currentBusiness) {
      navigate('/dashboard');
    }
  }, [loading, initializing, slug, currentBusiness, navigate]);

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
        {/* Header - fixed full width on top */}
        <BusinessHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />

        {/* Below header: sidebar + content with top padding for fixed header */}
        <div className="flex flex-1 pt-[41px]">
          {/* Mobile overlay */}
          {isMobile && sidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setSidebarOpen(false)} />
          )}

          {/* Sidebar */}
          <div className={`
            ${isMobile
              ? `fixed top-0 left-0 z-50 h-full transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
              : 'sticky top-[41px] h-[calc(100vh-41px)] flex-shrink-0'
            }
          `}>
            <BusinessSidebar onClose={() => setSidebarOpen(false)} />
          </div>

          {/* Main Content */}
          <main className="flex-1 min-w-0 overflow-x-clip overflow-y-auto h-[calc(100vh-41px)] pb-[env(safe-area-inset-bottom)]">
            <Outlet key={`${slug}-${syncVersion}`} />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default BusinessLayout;

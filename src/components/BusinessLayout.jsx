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

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [slug, isMobile]);

  useEffect(() => {
    const initBusiness = async () => {
      if (!user) {
        navigate('/login');
        return;
      }
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
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading business...</p>
        </div>
      </div>
    );
  }

  if (!currentBusiness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Business not found</h2>
          <p className="text-muted-foreground mb-4">The business you're looking for doesn't exist or you don't have access.</p>
          <button onClick={() => navigate('/dashboard')} className="text-primary hover:underline">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      <div className="min-h-screen bg-background">
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          ${isMobile 
            ? `fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`
            : 'fixed inset-y-0 left-0 z-40'
          }
        `}>
          <BusinessSidebar onClose={() => setSidebarOpen(false)} />
        </div>

        <div className={`${isMobile ? '' : 'ml-64'} flex flex-col min-h-screen`}>
          <BusinessHeader onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
};

export default BusinessLayout;

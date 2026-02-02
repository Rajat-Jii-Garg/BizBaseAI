import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import BusinessSidebar from './BusinessSidebar';
import BusinessHeader from './BusinessHeader';
import { useBusinessContext } from '@/contexts/BusinessContext';
import { useAuth } from '@/contexts/AuthContext';

const BusinessLayout = ({ children }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { switchBusiness, currentBusiness, loading, isBusinessOwner } = useBusinessContext();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initBusiness = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      if (businessId && (!currentBusiness || currentBusiness.id !== businessId)) {
        await switchBusiness(slug);
      }
      setInitializing(false);
    };

    initBusiness();
  }, [businessId, user, currentBusiness, switchBusiness, navigate]);

  // Check if user owns this business
  useEffect(() => {
    if (!loading && !initializing && businessId && !isBusinessOwner(businessId)) {
      // User doesn't own this business - redirect
      navigate('/dashboard');
    }
  }, [loading, initializing, businessId, isBusinessOwner, navigate]);

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
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-primary hover:underline"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <BusinessSidebar />
      <div className="ml-64 flex flex-col min-h-screen">
        <BusinessHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default BusinessLayout;

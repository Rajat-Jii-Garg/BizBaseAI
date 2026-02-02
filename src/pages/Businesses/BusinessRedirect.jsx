import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Briefcase,
  Plus,
  Search,
  MoreHorizontal,
  Loader2,
  DollarSign,
  Image
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import BusinessLayout from '@/components/BusinessLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const BusinessRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const checkBusiness = async () => {
      // 🔑 BACKEND / DB CHECK
      const business = await fetchUserBusiness(user.id);

      if (!business) {
        // ❌ NO BUSINESS → DIRECT SETUP (NO SPLASH)
        navigate('/business-setup');
        return;
      }

      // ✅ BUSINESS EXISTS → SHOW SPLASH
      setShowSplash(true);

      setTimeout(() => {
        if (data?.id) {
          navigate(`/business/${data.id}/dashboard`);
        } else {
          navigate('/business-setup');
        }
      }, 3000);
    };

    checkBusiness();
  }, []);

  if (!showSplash) return null;

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="text-center animate-pulse">
        <h1 className="text-3xl font-bold mb-2">
          Welcome to Business Dashboard
        </h1>
        <p className="text-sm opacity-90">
          Loading your business workspace...
        </p>
      </div>
    </div>
  );
};

export default BusinessRedirect;
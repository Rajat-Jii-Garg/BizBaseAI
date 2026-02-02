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

  useEffect(() => {
    if (!user) return;

    const resolveBusiness = async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_user_id', user.id)
        .limit(1)
        .single();

      setTimeout(() => {
        if (data?.id) {
          navigate(`/business/${data.id}/dashboard`);
        } else {
          navigate('/business-setup');
        }
      }, 3000);
    };

    resolveBusiness();
  }, [user]);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="text-center animate-pulse">
        <h1 className="text-3xl font-bold">
          Welcome to Business Dashboard
        </h1>
        <p className="mt-2 text-sm opacity-90">
          Setting up your business workspace...
        </p>
      </div>
    </div>
  );
};

export default BusinessRedirect;













const BusinessRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const resolveBusiness = async () => {
      // 🔹 YAHAN tu DB / API call karega
      // Example:
      const businesses = await getUserBusiness(user.id);

      setTimeout(() => {
        if (businesses) {
          navigate(`/business/:businessId/dashboard`);
        } else {
          navigate('/dashboard/business-setup');
        }
      }, 5000); // splash delay
    };

    resolveBusiness();
  }, []);

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="text-center animate-pulse">
        <h1 className="text-3xl font-bold">
          Welcome to Business Dashboard
        </h1>
        <p className="mt-2 text-sm opacity-90">
          Setting up your business workspace...
        </p>
      </div>
    </div>
  );
};

export default BusinessRedirect;

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  sendOTP: (email: string, purpose: string) => Promise<{ error: any }>;
  verifyOTP: (email: string, otp: string, purpose: string) => Promise<{ error: any; success?: boolean }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      // Don't create user account yet, just store signup data temporarily
      // We'll create the account only after OTP verification
      console.log('Signup data prepared:', { email, password, fullName, phone });
      
      return { error: null };
    } catch (error: any) {
      console.error('Signup preparation error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast({
          title: 'Login Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Welcome Back!',
          description: 'Successfully signed in to BizBase.',
        });
      }

      return { error };
    } catch (error: any) {
      console.error('Login catch error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'Successfully signed out from BizBase.',
      });
    } catch (error: any) {
      console.error('Signout error:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out.',
        variant: 'destructive',
      });
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Password Reset',
          description: 'Check your email for reset instructions.',
        });
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const sendOTP = async (email: string, purpose: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email, purpose }
      });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      return { error };
    }
  };

  const verifyOTP = async (email: string, otp: string, purpose: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, otp, purpose }
      });

      if (error) {
        throw error;
      }

      return { error: null, success: data?.success };
    } catch (error: any) {
      console.error('Verify OTP error:', error);
      return { error, success: false };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendOTP,
    verifyOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

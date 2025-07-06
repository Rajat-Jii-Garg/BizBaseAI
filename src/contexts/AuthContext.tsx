
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
  sendOTP: (email: string, purpose: string) => Promise<{ error: any; otp?: string }>;
  verifyOTP: (email: string, otp: string, purpose: string) => Promise<{ error: any; success?: boolean }>;
  completeSignup: (email: string, password: string, fullName: string, phone: string) => Promise<{ error: any }>;
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
      // Store signup data temporarily for OTP verification
      localStorage.setItem('pendingSignup', JSON.stringify({
        email,
        password,
        fullName,
        phone
      }));
      
      console.log('Signup data stored for OTP verification');
      return { error: null };
    } catch (error: any) {
      console.error('Signup preparation error:', error);
      return { error };
    }
  };

  const completeSignup = async (email: string, password: string, fullName: string, phone: string) => {
    try {
      console.log('Creating user account after OTP verification...');
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: fullName,
            phone: phone,
          }
        }
      });

      if (error) {
        console.error('Account creation error:', error);
        toast({
          title: 'Account Creation Error',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      toast({
        title: "Account Created Successfully!",
        description: "Welcome to BizBase. You're now signed in.",
      });
      
      return { error: null };
    } catch (error: any) {
      console.error('Complete signup error:', error);
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

      console.log('OTP Response:', data);

      // Show OTP in console and toast for testing
      if (data?.otp) {
        console.log(`🔑 TESTING OTP for ${email}: ${data.otp}`);
        toast({
          title: "OTP Sent!",
          description: data.message || `Verification code sent to ${email}`,
          duration: 5000,
        });
      }

      return { error: null, otp: data?.otp };
    } catch (error: any) {
      console.error('Send OTP error:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
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
    completeSignup,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

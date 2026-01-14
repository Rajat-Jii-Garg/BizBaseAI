
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 2. NEW FUNCTION: Profile table से data fetch करने के लिए -------------------------------------------------------------------------
  const fetchUserProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, current_position, email, username, profile_completion_score, bio, banner_url')
        .eq('id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') { 
        console.error('Error fetching profile:', error);
      }
      
      setProfile(data || {
        full_name: user?.user_metadata?.full_name || "",
        avatar_url: user?.user_metadata?.avatar_url || "",
        email: user?.email || "",
        current_position: ""
      });
    } catch (err) {
      console.error('Catch error fetching profile:', err);
      setProfile(null);
    }
  };

  // Function to manually refresh profile (e.g., after username update)
  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };
  // END NEW FUNCTION ---------------------------------------------------------------------------------------------------------------

  useEffect(() => {
    let mounted = true;
    
    const handleAuthChange = (event, session) => {
      if (!mounted) return;
      
      const currentUser = session?.user ?? null;
      setSession(session);
      setUser(currentUser);
      
      if (currentUser) {
        // Defer profile fetch with setTimeout to avoid deadlock
        setTimeout(() => {
          if (mounted) {
            fetchUserProfile(currentUser.id).finally(() => {
              if (mounted) setLoading(false);
            });
          }
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        
        const currentUser = session?.user ?? null;
        setSession(session);
        setUser(currentUser);
        
        if (currentUser) {
          // Fetch profile before marking as loaded
          fetchUserProfile(currentUser.id).finally(() => {
            if (mounted) setLoading(false);
          });
        } else {
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("Session fetch error:", err);
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Failsafe: ensure loading doesn't get stuck
  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(false);
    }, 5000); // Increased timeout for slower connections
    return () => clearTimeout(t);
  }, []);

  const signUp = async (email, password, fullName, phone) => {
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
    } catch (error) {
      console.error('Signup preparation error:', error);
      return { error };
    }
  };

  const completeSignup = async (email, password, fullName, phone) => {
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
        toast.error('Account Creation Error', { description: error.message });
        return { error };
      }

      // Send welcome email after successful signup
      try {
        const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: {
            email: email,
            fullName: fullName
          }
        });
        
        if (emailError) {
          console.error('Welcome email error:', emailError);
        } else {
          console.log('Welcome email sent successfully');
        }
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
      }

      toast.success("Account Created Successfully!", { 
        description: "Welcome to BizBase! Check your email for a welcome message." 
      });
      
      return { error: null };
    } catch (error) {
      console.error('Complete signup error:', error);
      return { error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error('Login Error', { description: error.message });
      } else {
        toast.success('Welcome Back!', { description: 'Successfully signed in to BizBase.' });
      }

      return { error };
    } catch (error) {
      console.error('Login catch error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Signed Out', { description: 'Successfully signed out from BizBase.' });
    } catch (error) {
      console.error('Signout error:', error);
      toast.error('Error', { description: 'Failed to sign out.' });
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error('Error', { description: error.message });
      } else {
        toast.success('Password Reset', { description: 'Check your email for reset instructions.' });
      }

      return { error };
    } catch (error) {
      return { error };
    }
  };

  const sendOTP = async (email, purpose) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email, purpose }
      });

      if (error) {
        throw error;
      }

      console.log('OTP Response:', data);

      return { error: null };
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error("Error", { description: "Failed to send OTP. Please try again." });
      return { error };
    }
  };

  const verifyOTP = async (email, otp, purpose) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, otp, purpose }
      });

      if (error) {
        throw error;
      }

      return { error: null, success: data?.success };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return { error, success: false };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    sendOTP,
    verifyOTP,
    completeSignup,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

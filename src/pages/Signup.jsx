import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, AtSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import FeatureHighlight from '@/components/auth/FeatureHighlight';
import { supabase } from '@/integrations/supabase/client';
import SEOHead from '@/components/SEOHead';
import OTPVerificationModal from '@/components/auth/OTPVerificationModal';

const Signup = () => {
  const [signupData, setSignupData] = useState({
    fullName: '', username: '', email: '', phone: '', password: '', confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  const { user } = useAuth();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateUsername = (username) => username.length >= 3 && /^[a-z0-9_]+$/.test(username);

  const checkUsernameAvailability = useCallback(async (username) => {
    if (!username || username.length < 3) { setUsernameAvailable(null); return; }
    setCheckingUsername(true);
    try {
      const { data, error } = await supabase.rpc('is_username_available', { check_username: username });
      if (error) throw error;
      setUsernameAvailable(data);
    } catch { setUsernameAvailable(null); }
    finally { setCheckingUsername(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (signupData.username) checkUsernameAvailability(signupData.username);
    }, 500);
    return () => clearTimeout(timer);
  }, [signupData.username, checkUsernameAvailability]);

  const handleUsernameChange = (value) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setSignupData(prev => ({ ...prev, username: sanitized }));
    if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
  };

  // Step 1: Validate form and send OTP email via Resend
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const newErrors = {};
    if (!signupData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!signupData.username) newErrors.username = 'Username is required';
    else if (!validateUsername(signupData.username)) newErrors.username = 'Invalid username';
    else if (usernameAvailable === false) newErrors.username = 'Username taken';
    if (!signupData.email) newErrors.email = 'Email required';
    else if (!validateEmail(signupData.email)) newErrors.email = 'Invalid email';
    if (!signupData.phone) newErrors.phone = 'Phone required';
    if (!signupData.password) newErrors.password = 'Password required';
    else if (signupData.password.length < 8) newErrors.password = 'Min 8 characters';
    if (signupData.password !== signupData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Send OTP to user's email via Resend API
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email: signupData.email, purpose: 'signup' }
      });

      if (error) throw new Error('Failed to send verification email. Please try again.');

      if (data?.error) throw new Error(data.error);

      // Show OTP modal
      setShowOTPModal(true);
      toast.success("Verification code sent!", {
        description: `Check your email at ${signupData.email}`,
      });

    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error("Failed to send verification email", {
        description: error.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: After OTP verified & account created
  const handleOTPVerified = async () => {
    // Handle referral tracking (non-blocking)
    const userId = localStorage.getItem('newUserId');
    if (userId && refCode) {
      supabase.from('profiles').select('id, bizcoins').eq('referral_code', refCode).single()
        .then(({ data: referrer }) => {
          if (referrer && referrer.id !== userId) {
            supabase.from('referrals').insert({
              referrer_id: referrer.id, referred_user_id: userId,
              referral_code: refCode, referred_email: signupData.email,
              status: 'completed', coins_awarded: true, completed_at: new Date().toISOString()
            }).catch(e => console.warn('Referral insert failed:', e));
            supabase.from('profiles').update({ bizcoins: (referrer.bizcoins || 0) + 10 })
              .eq('id', referrer.id).catch(e => console.warn('Referral coins failed:', e));
          }
        }).catch(e => console.warn('Referral lookup failed:', e));
    }

    // Welcome email (non-blocking)
    supabase.functions.invoke('send-welcome-email', {
      body: { email: signupData.email, fullName: signupData.fullName }
    }).catch(err => console.warn('Welcome email failed:', err));

    localStorage.removeItem('newUserId');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      <SEOHead title="Sign Up - Create Your Account" description="Join BizBase AI - the AI-powered professional networking platform." path="/signup" />
      <div className="hidden lg:flex lg:w-1/2">
        <FeatureHighlight />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-7 h-7 text-white animate-pulse" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BizBase
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">Join thousands of professionals growing with BizBase</p>
          </div>

          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-center text-xl">Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="fullName" type="text" placeholder="Enter your full name" value={signupData.fullName}
                      onChange={(e) => { setSignupData(prev => ({ ...prev, fullName: e.target.value })); if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' })); }}
                      className={`pl-10 ${errors.fullName ? 'border-destructive' : 'focus:border-primary'}`} required />
                  </div>
                  {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="username" type="text" placeholder="Choose a unique username" value={signupData.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className={`pl-10 pr-10 ${errors.username ? 'border-destructive' : usernameAvailable === true ? 'border-green-500' : usernameAvailable === false ? 'border-destructive' : 'focus:border-primary'}`} required />
                    <div className="absolute right-3 top-3">
                      {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {!checkingUsername && usernameAvailable === true && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {!checkingUsername && usernameAvailable === false && <XCircle className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Your profile URL: bizbase.com/@{signupData.username || 'username'}</p>
                  {errors.username && <p className="text-destructive text-xs mt-1">{errors.username}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="Enter your email" value={signupData.email}
                      onChange={(e) => { setSignupData(prev => ({ ...prev, email: e.target.value })); if (errors.email) setErrors(prev => ({ ...prev, email: '' })); }}
                      className={`pl-10 ${errors.email ? 'border-destructive' : 'focus:border-primary'}`} required />
                  </div>
                  {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" placeholder="+91 98765 43210" value={signupData.phone}
                      onChange={(e) => { setSignupData(prev => ({ ...prev, phone: e.target.value })); if (errors.phone) setErrors(prev => ({ ...prev, phone: '' })); }}
                      className={`pl-10 ${errors.phone ? 'border-destructive' : 'focus:border-primary'}`} required />
                  </div>
                  {errors.phone && <p className="text-destructive text-xs mt-1">{errors.phone}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 8 characters"
                      value={signupData.password}
                      onChange={(e) => { setSignupData(prev => ({ ...prev, password: e.target.value })); if (errors.password) setErrors(prev => ({ ...prev, password: '' })); }}
                      className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : 'focus:border-primary'}`} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password"
                      value={signupData.confirmPassword}
                      onChange={(e) => { setSignupData(prev => ({ ...prev, confirmPassword: e.target.value })); if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                      className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : 'focus:border-primary'}`} required />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
                
                <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]" disabled={loading}>
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending Verification...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <SocialLoginButtons />

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:text-primary/80 font-medium">Sign in here</Link>
                </p>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-muted-foreground">
                  By signing up, you agree to our{' '}
                  <Link to="/terms" className="text-primary hover:text-primary/80">Terms of Service</Link>{' '}and{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary/80">Privacy Policy</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* OTP Verification Modal */}
      <OTPVerificationModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        purpose="signup"
        email={signupData.email}
        signupData={signupData}
        onVerified={handleOTPVerified}
      />
    </div>
  );
};

export default Signup;
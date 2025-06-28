
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, Shield, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import OTPVerificationModal from '@/components/auth/OTPVerificationModal';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import FeatureHighlight from '@/components/auth/FeatureHighlight';

const Auth = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [signupData, setSignupData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    signupMethod: 'email' // 'email' or 'phone'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpPurpose, setOtpPurpose] = useState<'signup' | 'forgot'>('signup');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  const navigate = useNavigate();
  const { signIn, signUp, resetPassword, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const clearErrors = () => setErrors({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    
    if (!loginData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(loginData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!loginData.password) {
      newErrors.password = 'Password is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    
    const { error } = await signIn(loginData.email, loginData.password);
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setErrors({ general: 'Invalid email or password. Please try again.' });
      } else if (error.message.includes('Email not confirmed')) {
        setErrors({ general: 'Please verify your email before signing in.' });
      } else {
        setErrors({ general: error.message });
      }
    } else {
      toast({
        title: "Welcome back!",
        description: "Successfully signed in to BizBase.",
      });
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);
    
    // Validation
    const newErrors: { [key: string]: string } = {};
    
    if (!signupData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (signupData.signupMethod === 'email') {
      if (!signupData.email) {
        newErrors.email = 'Email is required';
      } else if (!validateEmail(signupData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    } else {
      if (!signupData.phone) {
        newErrors.phone = 'Phone number is required';
      } else if (!validatePhone(signupData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }
    
    if (!signupData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(signupData.password)) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
    if (signupData.password !== signupData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }
    
    const { error } = await signUp(signupData.email, signupData.password, signupData.fullName, signupData.phone);
    
    if (error) {
      if (error.message.includes('already registered')) {
        setErrors({ general: 'This email is already registered. Please try signing in.' });
      } else {
        setErrors({ general: error.message });
      }
    } else {
      setOtpPurpose('signup');
      setShowOTPModal(true);
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!loginData.email) {
      setErrors({ email: 'Please enter your email address first' });
      return;
    }
    
    setLoading(true);
    const { error } = await resetPassword(loginData.email);
    
    if (error) {
      setErrors({ general: error.message });
    } else {
      toast({
        title: "Reset link sent!",
        description: "Please check your email for password reset instructions.",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Feature Highlight Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2">
        <FeatureHighlight />
      </div>

      {/* Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-7 h-7 text-white animate-pulse" />
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BizBase
              </span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your Business Hub</h1>
            <p className="text-gray-600">Transform your business with our all-in-one platform</p>
          </div>

          {/* Error Display */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Auth Card */}
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90 glass">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-center text-xl">Get Started Today</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100">
                  <TabsTrigger value="login" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Sign In
                  </TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                    Sign Up
                  </TabsTrigger>
                </TabsList>
                
                {/* Login Tab */}
                <TabsContent value="login" className="space-y-6">
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="Enter your email"
                          value={loginData.email}
                          onChange={(e) => {
                            setLoginData(prev => ({ ...prev, email: e.target.value }));
                            if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                          }}
                          className={`pl-10 transition-all duration-200 ${errors.email ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                          required
                        />
                      </div>
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginData.password}
                          onChange={(e) => {
                            setLoginData(prev => ({ ...prev, password: e.target.value }));
                            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                          }}
                          className={`pl-10 pr-10 transition-all duration-200 ${errors.password ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500'}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    {/* Remember Me & Forgot Password */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="remember-me"
                          checked={loginData.rememberMe}
                          onCheckedChange={(checked) => setLoginData(prev => ({ ...prev, rememberMe: checked }))}
                        />
                        <Label htmlFor="remember-me" className="text-sm text-gray-600">Remember me</Label>
                      </div>
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Signing In...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>

                  {/* Social Login */}
                  <SocialLoginButtons />
                </TabsContent>
                
                {/* Signup Tab */}
                <TabsContent value="signup" className="space-y-6">
                  <form onSubmit={handleSignup} className="space-y-6">
                    {/* Signup Method Toggle */}
                    <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setSignupData(prev => ({ ...prev, signupMethod: 'email' }))}
                        className={`flex-1 py-2 px-3 text-sm rounded-md transition-all ${
                          signupData.signupMethod === 'email' 
                            ? 'bg-white shadow text-blue-600' 
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        Email Signup
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignupData(prev => ({ ...prev, signupMethod: 'phone' }))}
                        className={`flex-1 py-2 px-3 text-sm rounded-md transition-all ${
                          signupData.signupMethod === 'phone' 
                            ? 'bg-white shadow text-blue-600' 
                            : 'text-gray-600 hover:text-blue-600'
                        }`}
                      >
                        Phone Signup
                      </button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={signupData.fullName}
                          onChange={(e) => {
                            setSignupData(prev => ({ ...prev, fullName: e.target.value }));
                            if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                          }}
                          className={`pl-10 transition-all duration-200 ${errors.fullName ? 'border-red-500' : 'focus:border-blue-500'}`}
                          required
                        />
                      </div>
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>
                    
                    {signupData.signupMethod === 'email' ? (
                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email Address</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="Enter your email"
                            value={signupData.email}
                            onChange={(e) => {
                              setSignupData(prev => ({ ...prev, email: e.target.value }));
                              if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                            }}
                            className={`pl-10 transition-all duration-200 ${errors.email ? 'border-red-500' : 'focus:border-blue-500'}`}
                            required
                          />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="signup-phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            id="signup-phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={signupData.phone}
                            onChange={(e) => {
                              setSignupData(prev => ({ ...prev, phone: e.target.value }));
                              if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                            }}
                            className={`pl-10 transition-all duration-200 ${errors.phone ? 'border-red-500' : 'focus:border-blue-500'}`}
                            required
                          />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={signupData.password}
                          onChange={(e) => {
                            setSignupData(prev => ({ ...prev, password: e.target.value }));
                            if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                          }}
                          className={`pl-10 pr-10 transition-all duration-200 ${errors.password ? 'border-red-500' : 'focus:border-blue-500'}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={signupData.confirmPassword}
                          onChange={(e) => {
                            setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }));
                            if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                          }}
                          className={`pl-10 pr-10 transition-all duration-200 ${errors.confirmPassword ? 'border-red-500' : 'focus:border-blue-500'}`}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Creating Account...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>Create Account</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      )}
                    </Button>
                  </form>

                  {/* Social Login */}
                  <SocialLoginButtons />
                </TabsContent>
              </Tabs>
              
              {/* Legal Links */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  By continuing, you agree to our{' '}
                  <Link to="/terms" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Privacy Policy
                  </Link>
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
        purpose={otpPurpose}
        email={signupData.email || loginData.email}
        phone={signupData.phone}
      />
    </div>
  );
};

export default Auth;

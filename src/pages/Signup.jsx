import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, AtSign, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
import FeatureHighlight from '@/components/auth/FeatureHighlight';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams } from 'react-router-dom';

const Signup = () => {
  const [signupData, setSignupData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');
  const { signUp, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const validateUsername = (username) => {
    return username.length >= 3 && /^[a-z0-9_]+$/.test(username);
  };

  // Check username availability with debounce
  const checkUsernameAvailability = useCallback(async (username) => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    
    setCheckingUsername(true);
    try {
      const { data, error } = await supabase.rpc('is_username_available', { 
        check_username: username 
      });
      
      if (error) throw error;
      setUsernameAvailable(data);
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  }, []);

  // Debounced username check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (signupData.username) {
        checkUsernameAvailability(signupData.username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [signupData.username, checkUsernameAvailability]);

  const handleUsernameChange = (value) => {
    const sanitized = value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setSignupData(prev => ({ ...prev, username: sanitized }));
    if (errors.username) setErrors(prev => ({ ...prev, username: '' }));
  };

  const clearErrors = () => setErrors({});

  const handleSignup = async (e) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);
    
    // Validation
    const newErrors = {};
    
    if (!signupData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!signupData.username) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(signupData.username)) {
      newErrors.username = 'Username must be at least 3 characters (letters, numbers, underscore only)';
    } else if (usernameAvailable === false) {
      newErrors.username = 'This username is already taken';
    }
    
    if (!signupData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signupData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!signupData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(signupData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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

    try {
      // Create user account with Supabase (email verification auto)
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            full_name: signupData.fullName,
            phone: signupData.phone,
            username: signupData.username,
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
        setLoading(false);
        return;
      }

      toast({
        title: "Verification Email Sent!",
        description: "Please check your inbox and verify your email before logging in.",
      });
      
      // After signup, redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Feature Highlight Sidebar - Hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2">
        <FeatureHighlight />
      </div>

      {/* Signup Form */}
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
            <p className="text-gray-600">Join thousands of professionals growing with BizBase</p>
          </div>

          {/* Error Display */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Signup Card */}
          <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-center text-xl">Sign Up</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignup} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={signupData.fullName}
                      onChange={(e) => {
                        setSignupData(prev => ({ ...prev, fullName: e.target.value }));
                        if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
                      }}
                      className={`pl-10 transition-all duration-200 ${errors.fullName ? 'border-destructive' : 'focus:border-primary'}`}
                      required
                    />
                  </div>
                  {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a unique username"
                      value={signupData.username}
                      onChange={(e) => handleUsernameChange(e.target.value)}
                      className={`pl-10 pr-10 transition-all duration-200 ${
                        errors.username ? 'border-destructive' : 
                        usernameAvailable === true ? 'border-green-500' : 
                        usernameAvailable === false ? 'border-destructive' : 
                        'focus:border-primary'
                      }`}
                      required
                    />
                    <div className="absolute right-3 top-3">
                      {checkingUsername && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                      {!checkingUsername && usernameAvailable === true && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {!checkingUsername && usernameAvailable === false && <XCircle className="h-4 w-4 text-destructive" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your profile URL: bizbase.com/@{signupData.username || 'username'}
                  </p>
                  {errors.username && <p className="text-destructive text-xs mt-1">{errors.username}</p>}
                </div>
                
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
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

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
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
                
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password (min 8 characters)"
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
                
                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
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

              {/* Link to Login */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
              
              {/* Legal Links */}
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  By signing up, you agree to our{' '}
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
    </div>
  );
};

export default Signup;
























// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Link, useNavigate } from 'react-router-dom';
// import { Sparkles, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import { useToast } from '@/hooks/use-toast';
// import EnhancedOTPModal from '@/components/auth/EnhancedOTPModal';
// import SocialLoginButtons from '@/components/auth/SocialLoginButtons';
// import FeatureHighlight from '@/components/auth/FeatureHighlight';
// import { supabase } from '@/integrations/supabase/client';

// const Signup = () => {
//   const [signupData, setSignupData] = useState({
//     fullName: '',
//     email: '',
//     phone: '',
//     password: '',
//     confirmPassword: ''
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [showOTPModal, setShowOTPModal] = useState(false);
//   const [errors, setErrors] = useState({});
  
//   const navigate = useNavigate();
//   const { signUp, user } = useAuth();
//   const { toast } = useToast();

//   // Redirect if already logged in
//   useEffect(() => {
//     if (user) {
//       navigate('/dashboard');
//     }
//   }, [user, navigate]);

//   const validateEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const validatePhone = (phone) => {
//     const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
//     return phoneRegex.test(phone);
//   };

//   const validatePassword = (password) => {
//     return password.length >= 8;
//   };

//   const clearErrors = () => setErrors({});

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     clearErrors();
//     setLoading(true);
    
//     // Validation
//     const newErrors = {};
    
//     if (!signupData.fullName.trim()) {
//       newErrors.fullName = 'Full name is required';
//     }
    
//     if (!signupData.email) {
//       newErrors.email = 'Email is required';
//     } else if (!validateEmail(signupData.email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }
    
//     if (!signupData.phone) {
//       newErrors.phone = 'Phone number is required';
//     } else if (!validatePhone(signupData.phone)) {
//       newErrors.phone = 'Please enter a valid phone number';
//     }
    
//     if (!signupData.password) {
//       newErrors.password = 'Password is required';
//     } else if (!validatePassword(signupData.password)) {
//       newErrors.password = 'Password must be at least 8 characters long';
//     }
    
//     if (signupData.password !== signupData.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//     }
    
//     if (Object.keys(newErrors).length > 0) {
//       setErrors(newErrors);
//       setLoading(false);
//       return;
//     }
    
//     // Store signup data temporarily in localStorage
//     localStorage.setItem('pendingSignup', JSON.stringify(signupData));
    
//     // Show OTP modal immediately
//     setShowOTPModal(true);
//     setLoading(false);
    
//     toast({
//       title: "Verification Required",
//       description: "Please check your email for the verification code.",
//     });
//   };

//   const handleOTPVerified = async () => {
//     try {
//       // Get stored signup data
//       const storedData = localStorage.getItem('pendingSignup');
//       if (!storedData) {
//         toast({
//           title: "Error",
//           description: "Signup data not found. Please try again.",
//           variant: "destructive"
//         });
//         return;
//       }
      
//       const pendingSignup = JSON.parse(storedData);
      
//       console.log('Creating user account after OTP verification...');
      
//       // Now create the actual user account
//       const { error } = await supabase.auth.signUp({
//         email: pendingSignup.email,
//         password: pendingSignup.password,
//         options: {
//           emailRedirectTo: `${window.location.origin}/dashboard`,
//           data: {
//             full_name: pendingSignup.fullName,
//             phone: pendingSignup.phone,
//           }
//         }
//       });

//       if (error) {
//         console.error('Account creation error:', error);
//         toast({
//           title: 'Account Creation Error',
//           description: error.message,
//           variant: 'destructive',
//         });
//         return;
//       }

//       // Clear stored data
//       localStorage.removeItem('pendingSignup');
      
//       toast({
//         title: "Welcome to BizBase!",
//         description: "Your account has been created successfully.",
//       });
      
//       // Navigate to dashboard
//       setTimeout(() => {
//         navigate('/dashboard');
//       }, 1000);
      
//     } catch (error) {
//       console.error('Signup completion error:', error);
//       toast({
//         title: "Error",
//         description: "Failed to complete signup. Please try again.",
//         variant: "destructive"
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
//       {/* Feature Highlight Sidebar - Hidden on mobile */}
//       <div className="hidden lg:flex lg:w-1/2">
//         <FeatureHighlight />
//       </div>

//       {/* Signup Form */}
//       <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
//         <div className="w-full max-w-md">
//           {/* Header */}
//           <div className="text-center mb-8">
//             <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
//               <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
//                 <Sparkles className="w-7 h-7 text-white animate-pulse" />
//               </div>
//               <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//                 BizBase
//               </span>
//             </Link>
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Your Account</h1>
//             <p className="text-gray-600">Join thousands of professionals growing with BizBase</p>
//           </div>

//           {/* Error Display */}
//           {errors.general && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
//               <p className="text-red-600 text-sm">{errors.general}</p>
//             </div>
//           )}

//           {/* Signup Card */}
//           <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90">
//             <CardHeader className="space-y-1 pb-4">
//               <CardTitle className="text-center text-xl">Sign Up</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <form onSubmit={handleSignup} className="space-y-6">
//                 <div className="space-y-2">
//                   <Label htmlFor="fullName">Full Name *</Label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="fullName"
//                       type="text"
//                       placeholder="Enter your full name"
//                       value={signupData.fullName}
//                       onChange={(e) => {
//                         setSignupData(prev => ({ ...prev, fullName: e.target.value }));
//                         if (errors.fullName) setErrors(prev => ({ ...prev, fullName: '' }));
//                       }}
//                       className={`pl-10 transition-all duration-200 ${errors.fullName ? 'border-red-500' : 'focus:border-blue-500'}`}
//                       required
//                     />
//                   </div>
//                   {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
//                 </div>
                
//                 <div className="space-y-2">
//                   <Label htmlFor="email">Email Address *</Label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="email"
//                       type="email"
//                       placeholder="Enter your email"
//                       value={signupData.email}
//                       onChange={(e) => {
//                         setSignupData(prev => ({ ...prev, email: e.target.value }));
//                         if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
//                       }}
//                       className={`pl-10 transition-all duration-200 ${errors.email ? 'border-red-500' : 'focus:border-blue-500'}`}
//                       required
//                     />
//                   </div>
//                   {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
//                 </div>

//                 <div className="space-y-2">
//                   <Label htmlFor="phone">Phone Number *</Label>
//                   <div className="relative">
//                     <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="phone"
//                       type="tel"
//                       placeholder="+1 (555) 123-4567"
//                       value={signupData.phone}
//                       onChange={(e) => {
//                         setSignupData(prev => ({ ...prev, phone: e.target.value }));
//                         if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
//                       }}
//                       className={`pl-10 transition-all duration-200 ${errors.phone ? 'border-red-500' : 'focus:border-blue-500'}`}
//                       required
//                     />
//                   </div>
//                   {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
//                 </div>
                
//                 <div className="space-y-2">
//                   <Label htmlFor="password">Password *</Label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="password"
//                       type={showPassword ? "text" : "password"}
//                       placeholder="Create a strong password (min 8 characters)"
//                       value={signupData.password}
//                       onChange={(e) => {
//                         setSignupData(prev => ({ ...prev, password: e.target.value }));
//                         if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
//                       }}
//                       className={`pl-10 pr-10 transition-all duration-200 ${errors.password ? 'border-red-500' : 'focus:border-blue-500'}`}
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowPassword(!showPassword)}
//                       className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
//                     >
//                       {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                     </button>
//                   </div>
//                   {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
//                 </div>
                
//                 <div className="space-y-2">
//                   <Label htmlFor="confirmPassword">Confirm Password *</Label>
//                   <div className="relative">
//                     <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       id="confirmPassword"
//                       type={showConfirmPassword ? "text" : "password"}
//                       placeholder="Confirm your password"
//                       value={signupData.confirmPassword}
//                       onChange={(e) => {
//                         setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }));
//                         if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
//                       }}
//                       className={`pl-10 pr-10 transition-all duration-200 ${errors.confirmPassword ? 'border-red-500' : 'focus:border-blue-500'}`}
//                       required
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                       className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
//                     >
//                       {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                     </button>
//                   </div>
//                   {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
//                 </div>
                
//                 <Button 
//                   type="submit" 
//                   className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
//                   disabled={loading}
//                 >
//                   {loading ? (
//                     <div className="flex items-center space-x-2">
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       <span>Creating Account...</span>
//                     </div>
//                   ) : (
//                     <div className="flex items-center space-x-2">
//                       <span>Create Account</span>
//                       <ArrowRight className="w-4 h-4" />
//                     </div>
//                   )}
//                 </Button>
//               </form>

//               {/* Social Login */}
//               <SocialLoginButtons />

//               {/* Link to Login */}
//               <div className="mt-6 text-center">
//                 <p className="text-sm text-gray-600">
//                   Already have an account?{' '}
//                   <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
//                     Sign in here
//                   </Link>
//                 </p>
//               </div>
              
//               {/* Legal Links */}
//               <div className="mt-4 text-center">
//                 <p className="text-sm text-gray-600">
//                   By signing up, you agree to our{' '}
//                   <Link to="/terms" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
//                     Terms of Service
//                   </Link>{' '}
//                   and{' '}
//                   <Link to="/privacy" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
//                     Privacy Policy
//                   </Link>
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>

//       {/* Enhanced OTP Verification Modal */}
//       <EnhancedOTPModal 
//         isOpen={showOTPModal}
//         onClose={() => {
//           setShowOTPModal(false);
//           // Clear any stored signup data if user closes modal
//           localStorage.removeItem('pendingSignup');
//         }}
//         onVerified={handleOTPVerified}
//         email={signupData.email}
//         purpose="signup"
//       />
//     </div>
//   );
// };

// export default Signup;


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import SEOHead from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';

const Login = () => {
  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();
  const { signIn, user } = useAuth();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    async function handleExistingUser() {
      if (!user) return;

      if (redirect) {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          const url =
            redirect +
            (redirect.includes("?") ? "&" : "?") +
            "access_token=" +
            encodeURIComponent(session.access_token) +
            "&refresh_token=" +
            encodeURIComponent(session.refresh_token);

          window.location.href = url;
          return;
        }
      }

      navigate("/dashboard");
    }

    handleExistingUser();
  }, [user, redirect, navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const clearErrors = () => setErrors({});

  const handleLogin = async (e) => {
    e.preventDefault();
    clearErrors();
    setLoading(true);
    
    const newErrors = {};
    
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
        setErrors({ general: 'Please verify your email before signing in. Check your inbox for the verification link.' });
      } else {
        setErrors({ general: error.message });
      }
    } else {
        toast.success("Welcome back!", {
          description: "Successfully signed in to BizBase."
        });

        if (redirect) {
          const {
            data: { session }
          } = await supabase.auth.getSession();

          const url =
            redirect +
            (redirect.includes("?") ? "&" : "?") +
            "access_token=" +
            encodeURIComponent(session.access_token) +
            "&refresh_token=" +
            encodeURIComponent(session.refresh_token);

          window.location.href = url;

          return;
        } else {
          navigate('/dashboard');
        }
      }
    setLoading(false);
  };

  return (
    <>
      <SEOHead title="Login" description="Sign in to your BizBase AI account. Access your professional network, manage businesses, and grow your career." path="/login" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 -mt-4 md:mt-0">
          <Link to="/" className="inline-flex items-center space-x-2 mb-4 md:mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-7 h-7 text-white animate-pulse" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BizBase
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Login to your BizBase account</p>
        </div>

        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl">Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={loginData.email}
                    onChange={(e) => {
                      setLoginData(prev => ({ ...prev, email: e.target.value }));
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`pl-10 text-sm placeholder:text-[13px] md:placeholder:text-sm transition-all duration-200 h-10 md:h-11${
                      errors.email
                        ? 'border-red-500 focus:border-red-500'
                        : 'focus:border-blue-500'
                    }`}
                    required
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginData.password}
                    onChange={(e) => {
                      setLoginData(prev => ({ ...prev, password: e.target.value }));
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    className={`pl-10 pr-12 md:pr-11 text-sm placeholder:text-[13px] md:placeholder:text-sm transition-all duration-200 h-10 md:h-11${
                      errors.password
                        ? 'border-red-500 focus:border-red-500'
                        : 'focus:border-blue-500'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="scale-90 md:scale-100 origin-left">
                    <Switch
                      id="remember-me"
                      checked={loginData.rememberMe}
                      onCheckedChange={(checked) =>
                        setLoginData(prev => ({
                          ...prev,
                          rememberMe: checked,
                        }))
                      }
                    />
                  </div>
                  <Label htmlFor="remember-me" className="text-[12px] md:text-sm text-gray-600 leading-none">Remember me</Label>
                </div>
                <Link to="/forget-password" className="text-[12px] md:text-sm text-blue-600 hover:text-blue-800 leading-none whitespace-nowrap">Forget password?</Link>
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
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                  Register here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { X, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BizBaseMark from '@/components/BizBaseMark';
import { toast } from 'sonner';

const LoginModal = ({ onClose }) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    const newErrors = {};
    if (!loginData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(loginData.email)) newErrors.email = 'Please enter a valid email address';
    if (!loginData.password) newErrors.password = 'Password is required';

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
      toast.success("Login Successfully!");
      onClose();
      navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-border/50 max-h-[95vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header - jaisa Login page pe hai */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <BizBaseMark className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">BizBase</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">Welcome Back</h2>
          <p className="text-sm text-gray-600">Login to your BizBase account</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-gray-900">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) => {
                  setLoginData(prev => ({ ...prev, email: e.target.value }));
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`w-full pl-10 pr-3 h-11 text-sm rounded-lg border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-indigo-500`}
                required
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-gray-900">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={loginData.password}
                onChange={(e) => {
                  setLoginData(prev => ({ ...prev, password: e.target.value }));
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                className={`w-full pl-10 pr-10 h-11 text-sm rounded-lg border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-indigo-500`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLoginData(prev => ({ ...prev, rememberMe: !prev.rememberMe }))}
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${loginData.rememberMe ? "bg-indigo-600 border-indigo-600" : "bg-white border-gray-300"}`}
              >
                {loginData.rememberMe && <Check className="w-3 h-3 text-white stroke-[3]" />}
              </button>
              <span className="text-xs text-gray-600">Remember me</span>
            </div>
            <button
              type="button"
              onClick={() => { onClose(); navigate('/forget-password'); }}
              className="text-xs text-indigo-600 hover:text-indigo-700"
            >
              Forget password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-11 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => { onClose(); navigate('/signup'); }}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Register here
            </button>
          </p>
          <button onClick={onClose} className="text-xs text-muted-foreground mt-3 hover:text-foreground">
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
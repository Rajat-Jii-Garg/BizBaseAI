import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import SEOHead from '@/components/SEOHead';

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Handle BOTH the PKCE flow (?code=...) and the legacy hash flow (#access_token=...)
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");
        const errorDescription =
          url.searchParams.get("error_description") ||
          new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error_description");

        if (errorDescription) {
          toast.error("Reset link invalid or expired", { description: errorDescription });
          navigate("/forget-password");
          return;
        }

        // 1) PKCE flow — Supabase sends ?code=... after the email link redirect
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            toast.error("Reset link invalid or expired", { description: error.message });
            navigate("/forget-password");
            return;
          }
          // Clean the URL
          window.history.replaceState({}, document.title, "/reset-password");
          if (!cancelled) {
            setSessionReady(true);
            setVerifying(false);
          }
          return;
        }

        // 2) Legacy implicit flow — tokens in the hash fragment
        if (window.location.hash.includes("access_token")) {
          // detectSessionInUrl will pick this up; just confirm we have a session
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            window.history.replaceState({}, document.title, "/reset-password");
            if (!cancelled) {
              setSessionReady(true);
              setVerifying(false);
            }
            return;
          }
        }

        // 3) Maybe the user already has a recovery session (e.g. from onAuthStateChange)
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (!cancelled) {
            setSessionReady(true);
            setVerifying(false);
          }
          return;
        }

        // No code, no hash, no session → invalid entry
        toast.error("Invalid or expired reset link");
        navigate("/forget-password");
      } catch (err) {
        console.error("Recovery init error:", err);
        toast.error("Recovery session error");
        navigate("/forget-password");
      }
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        if (!cancelled) {
          setSessionReady(true);
          setVerifying(false);
        }
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!sessionReady) {
      setError("Recovery session not ready yet. Please wait a moment.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Both fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      toast.error("Failed to update password", { description: error.message });
      setLoading(false);
      return;
    }

    toast.success("Password updated successfully", {
      description: "Please sign in with your new password.",
    });
    // Sign out the recovery session so the user logs in fresh
    await supabase.auth.signOut();
    navigate("/login");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <SEOHead title="Reset Password" description="Set a new password for your BizBase AI account." path="/reset-password" noIndex />
      <div className="w-full max-w-md">
        {/* Logo + Heading */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6 group">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sparkles className="w-7 h-7 text-white animate-pulse" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BizBase
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Set new password</h1>
          <p className="text-gray-600">Create a strong password to secure your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Card className="border-0 shadow-2xl backdrop-blur-sm bg-white/90">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-xl">Reset Password</CardTitle>
          </CardHeader>

          <CardContent>
            {verifying ? (
              <div className="py-10 flex flex-col items-center justify-center text-gray-600">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p>Verifying reset link...</p>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-[1.02]"
                  disabled={loading || !sessionReady}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Update Password</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <Link to="/login" className="text-sm text-blue-600 hover:text-blue-800 transition-colors">
                Back to login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;

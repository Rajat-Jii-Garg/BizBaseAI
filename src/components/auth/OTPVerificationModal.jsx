import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield, Mail, CheckCircle, X, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const OTPVerificationModal = ({
  isOpen,
  onClose,
  purpose,
  email,
  signupData,
  onVerified,
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);
  
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    setOtp('');
    setVerified(false);
    setTimeLeft(60);
    setCanResend(false);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Invalid Code", { description: "Please enter the complete 6-digit code." });
      return;
    }

    setLoading(true);

    try {
      if (purpose === 'signup' && signupData) {
        // Call the signup-with-verification edge function
        const { data, error } = await supabase.functions.invoke('signup-with-verification', {
          body: {
            email: signupData.email,
            password: signupData.password,
            fullName: signupData.fullName,
            phone: signupData.phone,
            username: signupData.username,
            otp: otp,
          }
        });

        if (error) {
          const errorMsg = error.message || 'Verification failed';
          // Try to parse error from response body
          try {
            const parsed = JSON.parse(error.context?.body || '{}');
            throw new Error(parsed.error || errorMsg);
          } catch (parseErr) {
            if (parseErr.message !== errorMsg) throw parseErr;
            throw new Error(errorMsg);
          }
        }

        if (data?.error) {
          throw new Error(data.error);
        }

        // Store userId for post-signup tasks
        if (data?.userId) {
          localStorage.setItem('newUserId', data.userId);
        }

        setVerified(true);
        toast.success("Account Created Successfully!", {
          description: "Welcome to BizBase! Logging you in...",
        });

        // Now sign in the user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: signupData.email,
          password: signupData.password,
        });

        if (signInError) {
          console.error('Auto sign-in failed:', signInError);
          toast.info("Account created! Please login with your credentials.");
          setTimeout(() => { onClose(); navigate('/login'); }, 2000);
        } else {
          // Run post-signup tasks
          if (onVerified) onVerified();
          setTimeout(() => { onClose(); navigate('/dashboard'); }, 1500);
        }

      } else {
        // Generic OTP verification (password reset, etc.)
        const { data, error } = await supabase.functions.invoke('verify-otp', {
          body: { email, otp, purpose }
        });

        if (error) throw error;

        if (data?.success) {
          setVerified(true);
          toast.success("Verification Successful!");
          if (onVerified) onVerified();
          setTimeout(() => onClose(), 2000);
        } else {
          toast.error("Invalid Code", { description: "The code you entered is incorrect or expired." });
        }
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast.error("Verification Failed", { 
        description: error.message || "Please check the code and try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-otp', {
        body: { email, purpose: purpose || 'signup' }
      });
      
      if (error) throw error;
      
      toast.success("Code Resent", { description: `New verification code sent to ${email}` });
      setTimeLeft(60);
      setCanResend(false);
      setOtp('');
      
      // Restart timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { setCanResend(true); clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Resend OTP error:', error);
      toast.error("Error", { description: "Failed to resend code. Please try again." });
    } finally {
      setResendLoading(false);
    }
  };

  if (!isOpen) return null;

  if (verified) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {purpose === 'signup' ? 'Account Created!' : 'Verification Complete!'}
            </h3>
            <p className="text-muted-foreground">
              {purpose === 'signup' 
                ? "Welcome to BizBase! Redirecting to your dashboard..." 
                : "You can now proceed."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in fade-in zoom-in duration-300">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={onClose}><ArrowLeft className="w-4 h-4" /></Button>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
          
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          
          <CardTitle className="text-xl">Verify Your Email</CardTitle>
          <p className="text-muted-foreground text-sm mt-2">
            We've sent a 6-digit verification code to
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">{email}</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map(i => (
                    <InputOTPSlot key={i} index={i} className="w-12 h-12 text-lg border-2 focus:border-primary" />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Enter the 6-digit code from your email
            </p>
          </div>

          <Button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{purpose === 'signup' ? 'Creating Account...' : 'Verifying...'}</span>
              </div>
            ) : (
              purpose === 'signup' ? 'Verify & Create Account' : 'Verify Code'
            )}
          </Button>

          <div className="text-center">
            {canResend ? (
              <Button variant="ghost" onClick={handleResendOTP} disabled={resendLoading} className="text-primary hover:text-primary/80">
                {resendLoading ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Sending...</> : 'Resend Code'}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Resend code in {timeLeft}s</p>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Check your spam folder if you don't see the email
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerificationModal;

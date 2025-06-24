
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield, Mail, Phone, CheckCircle, X, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface OTPVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  purpose: 'signup' | 'forgot';
  email?: string;
  phone?: string;
}

const OTPVerificationModal: React.FC<OTPVerificationModalProps> = ({
  isOpen,
  onClose,
  purpose,
  email,
  phone
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Countdown timer
  useEffect(() => {
    if (!isOpen) return;
    
    setTimeLeft(60);
    setCanResend(false);
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate OTP verification
    setTimeout(() => {
      if (otp === '123456' || otp === '000000') { // Demo OTP codes
        setVerified(true);
        toast({
          title: "Verification Successful!",
          description: purpose === 'signup' 
            ? "Your account has been verified successfully." 
            : "You can now reset your password."
        });
        
        setTimeout(() => {
          if (purpose === 'signup') {
            // Redirect to business setup after successful verification
            navigate('/dashboard/business-setup');
          }
          onClose();
        }, 2000);
      } else {
        toast({
          title: "Invalid OTP",
          description: "The code you entered is incorrect. Please try again.",
          variant: "destructive"
        });
      }
      setLoading(false);
    }, 1500);
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    
    // Simulate resend
    setTimeout(() => {
      toast({
        title: "Code Resent",
        description: `New verification code sent to ${email || phone}`,
      });
      setTimeLeft(60);
      setCanResend(false);
      setResendLoading(false);
      
      // Restart timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, 1000);
  };

  if (!isOpen) return null;

  if (verified) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass animate-scale-in">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Complete!</h3>
            <p className="text-gray-600">
              {purpose === 'signup' 
                ? "Welcome to BizBase! Redirecting to business setup..." 
                : "You can now proceed to reset your password."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass animate-scale-in">
        <CardHeader className="text-center pb-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          
          <CardTitle className="text-xl">Verify Your Account</CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            We've sent a 6-digit verification code to
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            {email && <Mail className="w-4 h-4 text-gray-400" />}
            {phone && <Phone className="w-4 h-4 text-gray-400" />}
            <span className="font-medium text-gray-700">
              {email || phone}
            </span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                className="gap-2"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="w-12 h-12 text-lg border-2 focus:border-blue-500" />
                  <InputOTPSlot index={1} className="w-12 h-12 text-lg border-2 focus:border-blue-500" />
                  <InputOTPSlot index={2} className="w-12 h-12 text-lg border-2 focus:border-blue-500" />
                  <InputOTPSlot index={3} className="w-12 h-12 text-lg border-2 focus:border-blue-500" />
                  <InputOTPSlot index={4} className="w-12 h-12 text-lg border-2 focus:border-blue-500" />
                  <InputOTPSlot index={5} className="w-12 h-12 text-lg border-2 focus:border-blue-500" />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <p className="text-center text-sm text-gray-500">
              Enter the 6-digit code from your {email ? 'email' : 'SMS'}
            </p>
          </div>

          <Button
            onClick={handleVerifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              'Verify Code'
            )}
          </Button>

          <div className="text-center">
            {canResend ? (
              <Button
                variant="ghost"
                onClick={handleResendOTP}
                disabled={resendLoading}
                className="text-blue-600 hover:text-blue-800"
              >
                {resendLoading ? 'Sending...' : 'Resend Code'}
              </Button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend code in {timeLeft}s
              </p>
            )}
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Demo: Use 123456 or 000000 to verify
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OTPVerificationModal;

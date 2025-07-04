
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Shield, Mail, CheckCircle, X, ArrowLeft, Loader2, Copy, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface EnhancedOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  email: string;
  purpose: 'signup' | 'login' | 'reset';
}

const EnhancedOTPModal: React.FC<EnhancedOTPModalProps> = ({
  isOpen,
  onClose,
  onVerified,
  email,
  purpose
}) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [verified, setVerified] = useState(false);
  const [testingOTP, setTestingOTP] = useState<string>('');
  
  const { toast } = useToast();
  const { sendOTP, verifyOTP } = useAuth();

  // Auto-send OTP when modal opens
  useEffect(() => {
    if (isOpen && email) {
      handleSendOTP();
    }
  }, [isOpen, email]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    
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
  }, [isOpen, timeLeft]);

  const handleSendOTP = async () => {
    const { error, otp: receivedOTP } = await sendOTP(email, purpose);
    
    if (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP. Please try again.",
        variant: "destructive"
      });
    } else {
      if (receivedOTP) {
        setTestingOTP(receivedOTP);
      }
      toast({
        title: "OTP Sent!",
        description: `Verification code sent to ${email}`,
      });
      setTimeLeft(60);
      setCanResend(false);
    }
  };

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
    
    const { error, success } = await verifyOTP(email, otp, purpose);
    
    if (error || !success) {
      toast({
        title: "Invalid OTP",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive"
      });
    } else {
      setVerified(true);
      toast({
        title: "Verification Successful!",
        description: "Your email has been verified successfully."
      });
      
      setTimeout(() => {
        onVerified();
        onClose();
      }, 1500);
    }
    
    setLoading(false);
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    await handleSendOTP();
    setResendLoading(false);
  };

  const copyOTPToClipboard = () => {
    if (testingOTP) {
      navigator.clipboard.writeText(testingOTP);
      toast({
        title: "OTP Copied!",
        description: "OTP has been copied to clipboard",
      });
    }
  };

  const fillOTPAutomatically = () => {
    if (testingOTP) {
      setOtp(testingOTP);
      toast({
        title: "OTP Filled!",
        description: "OTP has been filled automatically for testing",
      });
    }
  };

  if (!isOpen) return null;

  if (verified) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white shadow-2xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Verification Complete!</h3>
            <p className="text-gray-600">
              Welcome to BizBase! Redirecting to your dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl">
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
          
          <CardTitle className="text-xl">Verify Your Email</CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            We've sent a 6-digit verification code to
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-700">{email}</span>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Testing Helper - Remove in production */}
          {testingOTP && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">Testing Mode</p>
                  <p className="text-xs text-yellow-600">OTP: {testingOTP}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyOTPToClipboard}
                    className="text-xs"
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={fillOTPAutomatically}
                    className="text-xs"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Fill
                  </Button>
                </div>
              </div>
            </div>
          )}

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
                {resendLoading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Resend Code'
                )}
              </Button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend code in {timeLeft}s
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedOTPModal;

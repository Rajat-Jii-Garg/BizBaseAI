import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff } from 'lucide-react';

const CallModal = ({ 
  isOpen, 
  onClose, 
  callType, 
  callState, 
  localStream, 
  remoteStream, 
  otherUser,
  onEndCall,
  onToggleMute,
  onToggleVideo,
  isMuted,
  isVideoOff
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    let interval;
    if (callState === 'active' && remoteStream) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
      setCallDuration(0);
    };
  }, [callState, remoteStream]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCallStateText = () => {
    if (callState === 'calling') return 'Calling...';
    if (callState === 'incoming') return 'Incoming Call';
    if (callState === 'connecting') return 'Connecting...';
    if (callState === 'active') return formatDuration(callDuration);
    return '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl h-[80vh] p-0 overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
        <div className="relative w-full h-full flex flex-col">
          {/* Remote Video/Avatar */}
          <div className="relative flex-1 bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center">
            {callType === 'video' && remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center space-y-6 animate-fade-in">
                <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-lg">
                  <AvatarImage src={otherUser?.avatar_url} />
                  <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                    {otherUser?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    {otherUser?.full_name || 'Unknown User'}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    {getCallStateText()}
                  </p>
                </div>
              </div>
            )}

            {/* Local Video (Picture in Picture) */}
            {callType === 'video' && localStream && (
              <div className="absolute top-4 right-4 w-40 h-32 rounded-xl overflow-hidden border-2 border-border shadow-xl bg-muted">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              </div>
            )}

            {/* Call Status Overlay */}
            {callState !== 'active' && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-4 animate-pulse">
                  {callType === 'video' ? (
                    <Video className="h-16 w-16 mx-auto text-primary" />
                  ) : (
                    <Phone className="h-16 w-16 mx-auto text-primary" />
                  )}
                  <p className="text-xl font-semibold text-foreground">
                    {getCallStateText()}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="p-8 bg-card/50 backdrop-blur-md border-t border-border">
            <div className="flex items-center justify-center space-x-4">
              {callType === 'video' && (
                <Button
                  size="lg"
                  variant={isVideoOff ? "destructive" : "secondary"}
                  className="h-14 w-14 rounded-full"
                  onClick={onToggleVideo}
                >
                  {isVideoOff ? (
                    <VideoOff className="h-6 w-6" />
                  ) : (
                    <Video className="h-6 w-6" />
                  )}
                </Button>
              )}

              <Button
                size="lg"
                variant={isMuted ? "destructive" : "secondary"}
                className="h-14 w-14 rounded-full"
                onClick={onToggleMute}
              >
                {isMuted ? (
                  <MicOff className="h-6 w-6" />
                ) : (
                  <Mic className="h-6 w-6" />
                )}
              </Button>

              <Button
                size="lg"
                variant="destructive"
                className="h-16 w-16 rounded-full shadow-lg hover:scale-110 transition-transform"
                onClick={onEndCall}
              >
                <PhoneOff className="h-7 w-7" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallModal;

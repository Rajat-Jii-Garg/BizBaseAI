import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Video, Mic, MicOff, VideoOff, PhoneOff, Volume2, VolumeX, Maximize2, Minimize2, SwitchCamera } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const CallModal = ({ 
  isOpen, 
  onClose, 
  callType, 
  callState, 
  localStream, 
  remoteStream, 
  otherUser,
  onEndCall,
  onAcceptCall,
  onDeclineCall,
  onToggleMute,
  onToggleVideo,
  isMuted,
  isVideoOff
}) => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showControls, setShowControls] = useState(true);

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

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In a real implementation, this would control audio output routing
  };

  const handleMouseMove = () => {
    setShowControls(true);
    const timer = setTimeout(() => setShowControls(false), 3000);
    return () => clearTimeout(timer);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`${
          isMinimized 
            ? 'sm:max-w-xs h-48 fixed bottom-4 right-4' 
            : 'sm:max-w-4xl h-[85vh]'
        } p-0 overflow-hidden bg-gradient-to-br from-background via-background to-primary/10 transition-all duration-300 border-2 border-primary/20`}
        onMouseMove={handleMouseMove}
      >
        <VisuallyHidden>
          <DialogTitle>
            {callState === 'incoming' ? 'Incoming Call' : callType === 'video' ? 'Video Call' : 'Voice Call'}
          </DialogTitle>
          <DialogDescription>
            {callState === 'incoming' 
              ? `Incoming ${callType} call from ${otherUser?.full_name || 'Unknown'}` 
              : `${callType === 'video' ? 'Video' : 'Voice'} call with ${otherUser?.full_name || 'Unknown'}`}
          </DialogDescription>
        </VisuallyHidden>
        <div className="relative w-full h-full flex flex-col">
          {/* Remote Video/Avatar */}
          <div className="relative flex-1 bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center overflow-hidden">
            {callType === 'video' && remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center space-y-6 animate-fade-in">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-primary/20 shadow-2xl ring-4 ring-primary/10">
                    <AvatarImage src={otherUser?.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary text-4xl font-bold">
                      {otherUser?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {callState === 'active' && (
                    <div className="absolute -bottom-2 -right-2 flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      Live
                    </div>
                  )}
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    {otherUser?.full_name || 'Unknown User'}
                  </h3>
                  <p className="text-lg text-muted-foreground font-medium">
                    {getCallStateText()}
                  </p>
                </div>
              </div>
            )}

            {/* Local Video (Picture in Picture) */}
            {callType === 'video' && localStream && !isMinimized && (
              <div className="absolute top-4 right-4 w-40 h-32 rounded-2xl overflow-hidden border-2 border-primary/40 shadow-2xl bg-muted hover:scale-105 transition-transform">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                {isVideoOff && (
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    <VideoOff className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
            )}

            {/* Call Status Overlay */}
            {callState !== 'active' && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="text-center space-y-6 animate-pulse">
                  <div className="relative">
                    {callType === 'video' ? (
                      <Video className="h-20 w-20 mx-auto text-primary drop-shadow-lg" />
                    ) : (
                      <Phone className="h-20 w-20 mx-auto text-primary drop-shadow-lg" />
                    )}
                    <div className="absolute inset-0 bg-primary/20 blur-2xl animate-ping" />
                  </div>
                  <p className="text-xl font-semibold text-foreground">
                    {getCallStateText()}
                  </p>
                </div>
              </div>
            )}

            {/* Duration Badge */}
            {callState === 'active' && !isMinimized && (
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-lg">
                <p className="text-sm font-mono font-medium text-foreground">
                  {formatDuration(callDuration)}
                </p>
              </div>
            )}

            {/* Minimize/Maximize Button */}
            {callState === 'active' && (showControls || isMinimized) && (
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="absolute top-4 right-4 bg-background/80 backdrop-blur-md p-2 rounded-full hover:bg-background transition-colors border border-border shadow-lg"
              >
                {isMinimized ? (
                  <Maximize2 className="h-5 w-5 text-foreground" />
                ) : (
                  <Minimize2 className="h-5 w-5 text-foreground" />
                )}
              </button>
            )}
          </div>

          {/* Call Controls */}
          {!isMinimized && (showControls || callState !== 'active') && (
            <div className="p-6 bg-gradient-to-t from-background/95 via-background/90 to-transparent backdrop-blur-xl border-t border-border/50">
              {callState === 'incoming' ? (
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    variant="destructive"
                    className="h-16 w-16 rounded-full shadow-2xl hover:scale-110 transition-all"
                    onClick={onDeclineCall}
                  >
                    <PhoneOff className="h-7 w-7" />
                  </Button>
                  <Button
                    size="lg"
                    className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-2xl hover:scale-110 transition-all"
                    onClick={onAcceptCall}
                  >
                    <Phone className="h-7 w-7" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                {/* Mute Toggle */}
                <Button
                  size="lg"
                  variant={isMuted ? "destructive" : "secondary"}
                  className="h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-all"
                  onClick={onToggleMute}
                >
                  {isMuted ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>

                {/* Video Toggle */}
                {callType === 'video' && (
                  <Button
                    size="lg"
                    variant={isVideoOff ? "destructive" : "secondary"}
                    className="h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-all"
                    onClick={onToggleVideo}
                  >
                    {isVideoOff ? (
                      <VideoOff className="h-6 w-6" />
                    ) : (
                      <Video className="h-6 w-6" />
                    )}
                  </Button>
                )}

                {/* Speaker Toggle */}
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-all"
                  onClick={toggleSpeaker}
                >
                  {isSpeakerOn ? (
                    <Volume2 className="h-6 w-6" />
                  ) : (
                    <VolumeX className="h-6 w-6" />
                  )}
                </Button>

                {/* End Call Button */}
                <Button
                  size="lg"
                  variant="destructive"
                  className="h-16 w-16 rounded-full shadow-2xl hover:scale-110 transition-all ring-4 ring-destructive/20"
                  onClick={onEndCall}
                >
                  <PhoneOff className="h-7 w-7" />
                </Button>
              </div>
              )}
            </div>
          )}

          {/* Minimized View Controls */}
          {isMinimized && (
            <div className="p-2 bg-background/95 backdrop-blur-md border-t border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser?.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {otherUser?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">{formatDuration(callDuration)}</span>
              </div>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 w-8 rounded-full"
                onClick={onEndCall}
              >
                <PhoneOff className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallModal;

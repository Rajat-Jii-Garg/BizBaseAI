import { supabase } from '@/integrations/supabase/client';

export class WebRTCManager {
  constructor(userId, conversationId) {
    this.userId = userId;
    this.conversationId = conversationId;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.signalingChannel = null;
    this.onRemoteStream = null;
    this.onCallEnded = null;
    
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    };
  }

  async initializeSignaling() {
    this.signalingChannel = supabase
      .channel(`webrtc-${this.conversationId}`)
      .on('broadcast', { event: 'offer' }, ({ payload }) => {
        if (payload.from !== this.userId) {
          this.handleOffer(payload);
        }
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        if (payload.from !== this.userId) {
          this.handleAnswer(payload);
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
        if (payload.from !== this.userId) {
          this.handleIceCandidate(payload);
        }
      })
      .on('broadcast', { event: 'call-ended' }, ({ payload }) => {
        if (payload.from !== this.userId) {
          this.handleCallEnded();
        }
      })
      .subscribe();
  }

  async startCall(isVideo = false) {
    try {
      // Get local stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.configuration);

      // Add local tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        event.streams[0].getTracks().forEach(track => {
          this.remoteStream.addTrack(track);
        });
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.signalingChannel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: {
              from: this.userId,
              candidate: event.candidate
            }
          });
        }
      };

      // Create and send offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      await this.signalingChannel.send({
        type: 'broadcast',
        event: 'offer',
        payload: {
          from: this.userId,
          offer: offer,
          isVideo: isVideo
        }
      });

      return this.localStream;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async handleOffer(payload) {
    try {
      // Get local stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: payload.isVideo
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection(this.configuration);

      // Add local tracks
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Handle remote stream
      this.peerConnection.ontrack = (event) => {
        if (!this.remoteStream) {
          this.remoteStream = new MediaStream();
        }
        event.streams[0].getTracks().forEach(track => {
          this.remoteStream.addTrack(track);
        });
        if (this.onRemoteStream) {
          this.onRemoteStream(this.remoteStream);
        }
      };

      // Handle ICE candidates
      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.signalingChannel.send({
            type: 'broadcast',
            event: 'ice-candidate',
            payload: {
              from: this.userId,
              candidate: event.candidate
            }
          });
        }
      };

      // Set remote description and create answer
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      await this.signalingChannel.send({
        type: 'broadcast',
        event: 'answer',
        payload: {
          from: this.userId,
          answer: answer
        }
      });

      return this.localStream;
    } catch (error) {
      console.error('Error handling offer:', error);
      throw error;
    }
  }

  async handleAnswer(payload) {
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate(payload) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  toggleMute() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return !audioTrack.enabled;
      }
    }
    return false;
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return !videoTrack.enabled;
      }
    }
    return false;
  }

  async endCall() {
    // Send call ended signal
    if (this.signalingChannel) {
      await this.signalingChannel.send({
        type: 'broadcast',
        event: 'call-ended',
        payload: {
          from: this.userId
        }
      });
    }

    this.cleanup();
  }

  handleCallEnded() {
    if (this.onCallEnded) {
      this.onCallEnded();
    }
    this.cleanup();
  }

  cleanup() {
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    // Stop remote stream
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => track.stop());
      this.remoteStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    // Unsubscribe from signaling
    if (this.signalingChannel) {
      supabase.removeChannel(this.signalingChannel);
      this.signalingChannel = null;
    }
  }
}

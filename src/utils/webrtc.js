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
    this.pendingCandidates = [];
    
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 10
    };
  }

  async initializeSignaling() {
    console.log('Initializing signaling for conversation:', this.conversationId);
    
    this.signalingChannel = supabase
      .channel(`webrtc-${this.conversationId}`)
      .on('broadcast', { event: 'offer' }, ({ payload }) => {
        console.log('Received offer from:', payload.from);
        if (payload.from !== this.userId) {
          this.handleOffer(payload);
        }
      })
      .on('broadcast', { event: 'answer' }, ({ payload }) => {
        console.log('Received answer from:', payload.from);
        if (payload.from !== this.userId) {
          this.handleAnswer(payload);
        }
      })
      .on('broadcast', { event: 'ice-candidate' }, ({ payload }) => {
        console.log('Received ICE candidate from:', payload.from);
        if (payload.from !== this.userId) {
          this.handleIceCandidate(payload);
        }
      })
      .on('broadcast', { event: 'call-ended' }, ({ payload }) => {
        console.log('Call ended signal from:', payload.from);
        if (payload.from !== this.userId) {
          this.handleCallEnded();
        }
      })
      .subscribe((status) => {
        console.log('WebRTC signaling channel status:', status);
      });
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
      await this.processPendingCandidates();
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
      console.log('Setting remote description from answer');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(payload.answer));
      await this.processPendingCandidates();
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate(payload) {
    try {
      if (this.peerConnection && this.peerConnection.remoteDescription) {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(payload.candidate));
        console.log('Added ICE candidate successfully');
      } else {
        // Queue the candidate if remote description not set yet
        console.log('Queuing ICE candidate for later');
        this.pendingCandidates.push(payload.candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  async processPendingCandidates() {
    if (this.peerConnection && this.peerConnection.remoteDescription) {
      console.log('Processing', this.pendingCandidates.length, 'pending candidates');
      for (const candidate of this.pendingCandidates) {
        try {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Error adding pending ICE candidate:', error);
        }
      }
      this.pendingCandidates = [];
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

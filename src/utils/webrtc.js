import { supabase } from '@/integrations/supabase/client';

export class WebRTCManager {
  constructor(userId, conversationId) {
    this.userId = userId;
    this.conversationId = conversationId;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.onRemoteStream = null;
    this.onCallEnded = null;
    this.onIceCandidate = null; // Callback for ICE candidates
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

  createPeerConnection() {
    console.log('Creating peer connection...');
    this.peerConnection = new RTCPeerConnection(this.configuration);

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      console.log('ontrack event received:', event.streams);
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
      }
      event.streams[0].getTracks().forEach(track => {
        console.log('Adding remote track:', track.kind);
        this.remoteStream.addTrack(track);
      });
      if (this.onRemoteStream) {
        this.onRemoteStream(this.remoteStream);
      }
    };

    // Handle ICE candidates
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate generated:', event.candidate.candidate?.substring(0, 50));
        if (this.onIceCandidate) {
          this.onIceCandidate(event.candidate);
        }
      }
    };

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', this.peerConnection?.iceConnectionState);
      if (this.peerConnection?.iceConnectionState === 'failed' ||
          this.peerConnection?.iceConnectionState === 'disconnected') {
        console.log('ICE connection failed or disconnected');
      }
      if (this.peerConnection?.iceConnectionState === 'connected') {
        console.log('ICE connection established!');
      }
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
    };

    return this.peerConnection;
  }

  async startCall(isVideo = false) {
    try {
      console.log('Starting call, isVideo:', isVideo);
      
      // Get local stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo
      });
      console.log('Got local stream:', this.localStream.getTracks().map(t => t.kind));

      // Create peer connection
      this.createPeerConnection();

      // Add local tracks
      this.localStream.getTracks().forEach(track => {
        console.log('Adding local track:', track.kind);
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Create and set local description
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      console.log('Local description set (offer)');

      return { stream: this.localStream, offer: offer };
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async answerCall(offer, isVideo = false) {
    try {
      console.log('Answering call, isVideo:', isVideo);
      
      // Get local stream
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: isVideo
      });
      console.log('Got local stream:', this.localStream.getTracks().map(t => t.kind));

      // Create peer connection
      this.createPeerConnection();

      // Add local tracks
      this.localStream.getTracks().forEach(track => {
        console.log('Adding local track:', track.kind);
        this.peerConnection.addTrack(track, this.localStream);
      });

      // Set remote description (the offer from caller)
      console.log('Setting remote description (offer from caller)');
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      
      // Process any pending ICE candidates
      await this.processPendingCandidates();

      // Create and set local description (answer)
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      console.log('Local description set (answer)');

      return { stream: this.localStream, answer: answer };
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  async handleAnswer(payload) {
    try {
      if (!this.peerConnection) {
        console.error('No peer connection when handling answer');
        return;
      }
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
          console.log('Added pending ICE candidate');
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

  handleCallEnded() {
    if (this.onCallEnded) {
      this.onCallEnded();
    }
    this.cleanup();
  }

  cleanup() {
    console.log('Cleaning up WebRTC...');
    
    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped local track:', track.kind);
      });
      this.localStream = null;
    }

    // Stop remote stream
    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach(track => {
        track.stop();
        console.log('Stopped remote track:', track.kind);
      });
      this.remoteStream = null;
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
      console.log('Peer connection closed');
    }

    this.pendingCandidates = [];
  }
}
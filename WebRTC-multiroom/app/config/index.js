export const config = {
  signaling: process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5002/',
  peerConfig: {
    iceServers: [
      { urls: 'stun:stun.stunprotocol.org:3478' },
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  },
  media: {
    video: true,
    audio: false
  }
};


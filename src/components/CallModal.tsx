import { AnimatePresence, motion } from 'framer-motion';
import {
    Maximize2,
    Mic,
    MicOff,
    Minimize2,
    PhoneOff,
    Video,
    VideoOff,
    Volume2,
    VolumeX
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: 'voice' | 'video';
  contactName: string;
  contactAvatar: string;
  isOutgoing?: boolean;
  language: string;
}

const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  callType,
  contactName,
  contactAvatar,
  isOutgoing = true,
  language
}) => {
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Simulate call connection
      const timer = setTimeout(() => {
        setCallStatus('ringing');
        setTimeout(() => {
          setCallStatus('connected');
          startCallTimer();
        }, 3000);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (callStatus === 'connected' && callType === 'video' && isVideoEnabled) {
      initializeVideo();
    }
  }, [callStatus, callType, isVideoEnabled]);

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const initializeVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const endCall = () => {
    setCallStatus('ended');
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
    }
    
    // Stop video streams
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    setTimeout(() => {
      onClose();
      // Reset state
      setCallDuration(0);
      setCallStatus('connecting');
      setIsMuted(false);
      setIsVideoEnabled(callType === 'video');
      setIsSpeakerOn(false);
      setIsFullscreen(false);
    }, 2000);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real implementation, you would mute/unmute the audio stream
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // In a real implementation, you would enable/disable the video stream
  };

  const toggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
    // In a real implementation, you would switch audio output
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusText = () => {
    switch (callStatus) {
      case 'connecting':
        return language === 'ar' ? 'جاري الاتصال...' : 'Connecting...';
      case 'ringing':
        return isOutgoing 
          ? (language === 'ar' ? 'جاري الرنين...' : 'Ringing...')
          : (language === 'ar' ? 'مكالمة واردة' : 'Incoming call');
      case 'connected':
        return formatCallDuration(callDuration);
      case 'ended':
        return language === 'ar' ? 'انتهت المكالمة' : 'Call ended';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className={`fixed inset-0 z-50 ${isFullscreen ? 'bg-black' : 'flex items-center justify-center'}`}>
        {/* Backdrop */}
        {!isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
        )}

        {/* Call Interface */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`relative ${
            isFullscreen 
              ? 'w-full h-full' 
              : 'bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden'
          }`}
        >
          {/* Video Call Interface */}
          {callType === 'video' && callStatus === 'connected' && isVideoEnabled && (
            <div className={`relative ${isFullscreen ? 'w-full h-full' : 'h-96'}`}>
              {/* Remote Video */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover bg-gray-800"
                poster={contactAvatar}
              />
              
              {/* Local Video */}
              <div className="absolute top-4 right-4 w-24 h-32 bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="absolute top-4 left-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Voice Call or Video Disabled Interface */}
          {(callType === 'voice' || !isVideoEnabled || callStatus !== 'connected') && (
            <div className="flex flex-col items-center justify-center p-8 min-h-96">
              {/* Contact Avatar */}
              <motion.div
                animate={{ scale: callStatus === 'ringing' ? [1, 1.05, 1] : 1 }}
                transition={{ duration: 1, repeat: callStatus === 'ringing' ? Infinity : 0 }}
                className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg"
              >
                <img
                  src={contactAvatar}
                  alt={contactName}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Contact Name */}
              <h3 className="text-2xl font-semibold text-white mb-2">
                {contactName}
              </h3>

              {/* Call Status */}
              <p className="text-gray-300 text-lg mb-8">
                {getStatusText()}
              </p>

              {/* Connecting Animation */}
              {callStatus === 'connecting' && (
                <div className="flex space-x-2 mb-8">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      className="w-3 h-3 bg-green-500 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Call Controls */}
          <div className={`${
            callType === 'video' && callStatus === 'connected' && isVideoEnabled && !isFullscreen
              ? 'absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent'
              : 'bg-gray-900'
          } p-6`}>
            <div className="flex items-center justify-center space-x-4">
              {/* Mute Button */}
              {callStatus === 'connected' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMute}
                  className={`p-4 rounded-full transition-colors ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isMuted ? (
                    <MicOff className="w-6 h-6 text-white" />
                  ) : (
                    <Mic className="w-6 h-6 text-white" />
                  )}
                </motion.button>
              )}

              {/* End Call Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={endCall}
                className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="w-6 h-6" />
              </motion.button>

              {/* Video Toggle (for video calls) */}
              {callType === 'video' && callStatus === 'connected' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleVideo}
                  className={`p-4 rounded-full transition-colors ${
                    !isVideoEnabled 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isVideoEnabled ? (
                    <Video className="w-6 h-6 text-white" />
                  ) : (
                    <VideoOff className="w-6 h-6 text-white" />
                  )}
                </motion.button>
              )}

              {/* Speaker Toggle (for voice calls) */}
              {callType === 'voice' && callStatus === 'connected' && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleSpeaker}
                  className={`p-4 rounded-full transition-colors ${
                    isSpeakerOn 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  {isSpeakerOn ? (
                    <Volume2 className="w-6 h-6 text-white" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-white" />
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CallModal;
import React, { useRef, useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
  isHighContrast?: boolean;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, isHighContrast }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      setError("Unable to access camera. Please ensure permissions are granted.");
      console.error(err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        onCapture(base64);
        stopCamera();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="absolute top-6 right-6 z-20">
        <button 
          onClick={onClose} 
          className="text-white p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all"
        >
          <X size={24} />
        </button>
      </div>
      
      {error ? (
        <div className="text-white text-center p-6 max-w-md">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
          </div>
          <p className="text-lg font-bold mb-2">Camera Error</p>
          <p className="text-white/60 mb-6">{error}</p>
          <button onClick={onClose} className="px-6 py-3 bg-white text-black rounded-xl font-bold">Close</button>
        </div>
      ) : (
        <>
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            
            {/* Overlay Guide */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
              <div className="w-[85%] max-w-md aspect-[1.586/1] border-2 border-white/50 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white -mt-1 -ml-1 rounded-tl-lg"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white -mt-1 -mr-1 rounded-tr-lg"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white -mb-1 -ml-1 rounded-bl-lg"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white -mb-1 -mr-1 rounded-br-lg"></div>
                
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/50"></div>
              </div>
              <p className="mt-8 text-white/90 font-bold uppercase tracking-widest text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                Align ID Card within frame
              </p>
            </div>
          </div>

          <div className="absolute bottom-10 left-0 right-0 flex justify-center z-20">
            <button 
              onClick={capture}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 active:bg-white/50 transition-all active:scale-95"
            >
              <div className="w-16 h-16 bg-white rounded-full shadow-lg"></div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraCapture;

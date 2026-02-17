
import React, { useRef, useState } from 'react';

interface VideoUploaderProps {
  onVideoSelected: (base64: string) => void;
  disabled: boolean;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelected, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        setError("File too large. Please upload a video smaller than 25MB.");
        return;
      }
      
      // Basic check for video type
      if (!file.type.startsWith('video/')) {
        setError("Invalid file type. Please upload a video file.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onVideoSelected(reader.result as string);
      };
      reader.onerror = () => {
        setError("Failed to read file.");
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/mp4,video/webm"
        className="hidden"
      />
      <div 
        onClick={disabled ? undefined : triggerUpload}
        className={`
          relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer
          ${disabled ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/30'}
        `}
      >
        <div className="bg-purple-100 p-4 rounded-full mb-4">
          <i className="fas fa-video text-purple-600 text-3xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Upload Retinal Video</h3>
        <p className="text-slate-500 text-center max-w-sm mb-6">
          Upload MP4 or WebM video clips (Max 25MB).<br/>Ideal for OCT fly-throughs or dynamic fundus exams.
        </p>
        <button 
          disabled={disabled}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-sm disabled:opacity-50"
        >
          Select Video
        </button>
        {error && (
          <div className="mt-4 text-xs font-bold text-rose-500 bg-rose-50 px-3 py-1 rounded-full">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoUploader;

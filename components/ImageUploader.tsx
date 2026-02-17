
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  disabled: boolean;
  isHighContrast?: boolean;
  t: (key: string) => string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, disabled, isHighContrast, t }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(20);
  };

  const playVoiceCue = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic();
      playVoiceCue("Image captured successfully. Processing scan.");
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    if (disabled) return;
    triggerHaptic();
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <div 
        onClick={triggerUpload}
        className={`
          relative border-4 border-dashed rounded-[2rem] p-8 md:p-16 flex flex-col items-center justify-center transition-all cursor-pointer group active:scale-[0.98]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}
          ${isHighContrast 
            ? 'bg-[#FFFDD0] border-black hover:bg-white' 
            : 'bg-white dark:bg-slate-900/50 border-blue-200 dark:border-blue-900 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
          }
        `}
        role="button"
        aria-label="Upload Retinal Scan"
      >
        <div className={`
          p-6 md:p-8 rounded-full mb-6 md:mb-8 transition-transform group-hover:rotate-12
          ${isHighContrast ? 'bg-black text-[#FFFDD0]' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'}
        `}>
          <i className="fas fa-camera text-4xl md:text-5xl"></i>
        </div>
        
        <h3 className={`text-2xl md:text-3xl font-black mb-4 ${isHighContrast ? 'text-black' : 'text-slate-800 dark:text-white'}`}>
          {t('uploadTitle')}
        </h3>
        
        <p className={`text-base md:text-lg font-medium text-center max-w-md mb-8 md:mb-10 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>
          {t('uploadDesc')}
        </p>

        <button 
          disabled={disabled}
          className={`
            w-full md:w-auto px-12 py-5 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl transition-all
            ${isHighContrast 
              ? 'bg-black text-[#FFFDD0] border-2 border-black hover:bg-white hover:text-black' 
              : 'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50'
            }
          `}
        >
          {t('selectImage')}
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;

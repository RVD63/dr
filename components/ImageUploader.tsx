
import React, { useRef, useState, useEffect } from 'react';
import { PatientDetails } from '../types';

interface ImageUploaderProps {
  onImageSelected: (base64: string, details: PatientDetails) => void;
  disabled: boolean;
  isHighContrast?: boolean;
  t: (key: string) => string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, disabled, isHighContrast, t }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Patient Details State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Not Specified');
  const [patientId, setPatientId] = useState('');
  const [scanId, setScanId] = useState('');

  // Initialize IDs on mount
  useEffect(() => {
    // Generate a random Patient ID
    setPatientId(`PT-${Math.floor(1000 + Math.random() * 9000)}`);
    
    // Generate a structured Scan ID (SCN-YYYYMMDD-Random)
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    setScanId(`SCN-${dateStr}-${randomSuffix}`);
  }, []);

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
        // Construct details object using the current state values
        const details: PatientDetails = {
          name: name.trim() || 'Anonymous Patient',
          age: age || '--',
          gender,
          id: patientId,
          scanId: scanId // Ensure the generated Scan ID is passed here
        };
        onImageSelected(reader.result as string, details);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    if (disabled) return;
    // Basic validation could go here
    triggerHaptic();
    fileInputRef.current?.click();
  };

  const inputClass = isHighContrast 
    ? "w-full bg-white border-2 border-black p-3 rounded-xl font-bold text-black placeholder-gray-500 focus:ring-2 focus:ring-black outline-none transition-all"
    : "w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-xl font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all";

  const labelClass = `block text-xs font-bold uppercase tracking-widest mb-2 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`;

  return (
    <div className="w-full space-y-8">
      
      {/* Patient Information Form */}
      <div className={`p-6 md:p-8 rounded-[2rem] border-2 border-dashed ${isHighContrast ? 'bg-gray-50 border-black' : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700'}`}>
        <h3 className={`text-xl font-black tracking-tight mb-6 flex items-center gap-3 ${isHighContrast ? 'text-black' : 'text-slate-900 dark:text-white'}`}>
          <i className="fas fa-user-circle text-2xl opacity-50"></i>
          <span>Patient Details</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className={labelClass}>Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter patient name"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Patient ID</label>
            <div className="relative">
               <input 
                type="text" 
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className={`${inputClass} font-mono`}
              />
              <button 
                onClick={() => setPatientId(`PT-${Math.floor(1000 + Math.random() * 9000)}`)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500"
                title="Generate New ID"
              >
                <i className="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Scan Reference ID</label>
            <div className="relative">
              <input 
                type="text" 
                value={scanId}
                readOnly
                className={`${inputClass} opacity-70 cursor-not-allowed font-mono bg-gray-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <i className="fas fa-lock text-xs"></i>
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass}>Age</label>
            <input 
              type="number" 
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Age"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Gender</label>
            <select 
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={inputClass}
            >
              <option value="Not Specified">Not Specified</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upload Area */}
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
          relative border-4 border-dashed rounded-[2rem] p-8 md:p-12 flex flex-col items-center justify-center transition-all cursor-pointer group active:scale-[0.98]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.01]'}
          ${isHighContrast 
            ? 'bg-[#FFFDD0] border-black hover:bg-white' 
            : 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10'
          }
        `}
        role="button"
        aria-label="Upload Retinal Scan"
      >
        <div className={`
          p-6 rounded-full mb-6 transition-transform group-hover:rotate-12
          ${isHighContrast ? 'bg-black text-[#FFFDD0]' : 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'}
        `}>
          <i className="fas fa-camera text-4xl"></i>
        </div>
        
        <h3 className={`text-2xl font-black mb-3 ${isHighContrast ? 'text-black' : 'text-slate-800 dark:text-white'}`}>
          {t('uploadTitle')}
        </h3>
        
        <p className={`text-base font-medium text-center max-w-md mb-8 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>
          {t('uploadDesc')}
        </p>

        <button 
          disabled={disabled}
          className={`
            w-full md:w-auto px-12 py-4 rounded-2xl font-black text-lg uppercase tracking-widest shadow-xl transition-all
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

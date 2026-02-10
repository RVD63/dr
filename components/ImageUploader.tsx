
import React, { useRef } from 'react';

interface ImageUploaderProps {
  onImageSelected: (base64: string) => void;
  disabled: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageSelected(reader.result as string);
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
        accept="image/*"
        className="hidden"
      />
      <div 
        onClick={disabled ? undefined : triggerUpload}
        className={`
          relative border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer
          ${disabled ? 'bg-slate-50 border-slate-200 cursor-not-allowed' : 'bg-white border-blue-200 hover:border-blue-400 hover:bg-blue-50/30'}
        `}
      >
        <div className="bg-blue-100 p-4 rounded-full mb-4">
          <i className="fas fa-cloud-upload-alt text-blue-600 text-3xl"></i>
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Upload Retinal Scan</h3>
        <p className="text-slate-500 text-center max-w-sm mb-6">
          Drag and drop your fundus image here, or click to browse. Supported formats: JPG, PNG.
        </p>
        <button 
          disabled={disabled}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
        >
          Select Image
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;

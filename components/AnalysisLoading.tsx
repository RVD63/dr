
import React, { useState, useEffect } from 'react';

interface AnalysisLoadingProps {
  isPreprocessing: boolean;
  imagePreview: string | null;
  isHighContrast?: boolean;
}

const AnalysisLoading: React.FC<AnalysisLoadingProps> = ({ isPreprocessing, imagePreview, isHighContrast }) => {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  const stages = isPreprocessing 
    ? [
        "Initializing GPU buffers...",
        "Applying histogram equalization...",
        "Normalizing pixel intensities...",
        "Reducing Gaussian noise..."
      ]
    : [
        "Analyzing vascular structure...",
        "Scanning for microaneurysms...",
        "Detecting intraretinal hemorrhages...",
        "Mapping exudate density...",
        "Calculating progression risks...",
        "Generating clinical narrative..."
      ];

  useEffect(() => {
    const totalDuration = isPreprocessing ? 2000 : 5000;
    const intervalTime = 50;
    const increment = (100 / (totalDuration / intervalTime));
    
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          clearInterval(timer);
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPreprocessing]);

  useEffect(() => {
    const stageIndex = Math.min(
      Math.floor((progress / 100) * stages.length),
      stages.length - 1
    );
    setCurrentStage(stageIndex);
  }, [progress, stages.length]);

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
      <div className="relative mb-12">
        {/* Main Scanner Visual */}
        <div className={`relative w-64 h-64 md:w-80 md:h-80 rounded-[3rem] overflow-hidden shadow-2xl border ${isHighContrast ? 'bg-white border-black' : 'bg-slate-900 border-slate-800'}`}>
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Scanning" 
              className={`w-full h-full object-cover scale-110 blur-[1px] ${isHighContrast ? 'opacity-80' : 'opacity-40'}`} 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <i className={`fas fa-eye text-8xl ${isHighContrast ? 'text-black' : 'text-slate-800'}`}></i>
            </div>
          )}
          
          {/* Scanning Beam */}
          <div 
            className={`absolute left-0 right-0 h-1 z-10 animate-scan ${isHighContrast ? 'bg-black' : 'bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_15px_rgba(59,130,246,0.8)]'}`}
            style={{ top: `${progress}%` }}
          ></div>

          {/* Grid Overlay */}
          {!isHighContrast && <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>}
          
          {/* Corner Brackets */}
          <div className={`absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 ${isHighContrast ? 'border-black' : 'border-blue-500/50'}`}></div>
          <div className={`absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 ${isHighContrast ? 'border-black' : 'border-blue-500/50'}`}></div>
          <div className={`absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 ${isHighContrast ? 'border-black' : 'border-blue-500/50'}`}></div>
          <div className={`absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 ${isHighContrast ? 'border-black' : 'border-blue-500/50'}`}></div>
        </div>

        {/* Progress Ring */}
        <div className="absolute -inset-4 pointer-events-none">
          <svg className="w-full h-full transform -rotate-90">
            <circle 
              cx="50%" cy="50%" r="48%" 
              stroke="currentColor" strokeWidth="2" fill="transparent" 
              className={isHighContrast ? 'text-gray-200' : 'text-slate-100'} 
            />
            <circle 
              cx="50%" cy="50%" r="48%" 
              stroke="currentColor" strokeWidth="3" fill="transparent" 
              strokeDasharray="100 100"
              strokeDashoffset={100 - progress}
              pathLength="100"
              className={`${isHighContrast ? 'text-black' : 'text-blue-600'} transition-all duration-300 ease-out`} 
            />
          </svg>
        </div>
      </div>

      <div className="text-center space-y-6 max-w-lg">
        <div className="space-y-2">
          <h3 className={`text-3xl font-black tracking-tight ${isHighContrast ? 'text-black' : 'text-slate-900'}`}>
            {isPreprocessing ? 'Clinical Optimization' : 'AI Neural Diagnostics'}
          </h3>
          <p className={`font-bold text-sm uppercase tracking-[0.2em] h-6 flex items-center justify-center ${isHighContrast ? 'text-black' : 'text-blue-600'}`}>
            {stages[currentStage]}
          </p>
        </div>

        {/* Multi-step progress tracker */}
        <div className="flex justify-center space-x-2">
          {stages.map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i <= currentStage ? (isHighContrast ? 'w-8 bg-black' : 'w-8 bg-blue-600') : (isHighContrast ? 'w-4 bg-gray-300' : 'w-4 bg-slate-200')
              }`}
            ></div>
          ))}
        </div>

        <div className="pt-4">
          <div className={`rounded-2xl p-4 inline-flex items-center space-x-3 border ${isHighContrast ? 'bg-white border-black' : 'bg-slate-100 border-slate-200'}`}>
            <div className="flex -space-x-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white ${isHighContrast ? 'bg-black text-[#FFFDD0]' : 'bg-blue-600 text-white'}`}>1</div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white transition-colors ${
                  progress > 40 
                  ? (isHighContrast ? 'bg-black text-[#FFFDD0]' : 'bg-blue-600 text-white') 
                  : 'bg-slate-300 text-slate-500'
              }`}>2</div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white transition-colors ${
                  progress > 80 
                  ? (isHighContrast ? 'bg-black text-[#FFFDD0]' : 'bg-blue-600 text-white') 
                  : 'bg-slate-300 text-slate-500'
              }`}>3</div>
            </div>
            <span className={`text-xs font-bold uppercase tracking-widest ${isHighContrast ? 'text-black' : 'text-slate-500'}`}>
              {progress < 100 ? `Phase ${Math.min(3, Math.floor(progress / 33) + 1)} in progress` : 'Completing analysis'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisLoading;

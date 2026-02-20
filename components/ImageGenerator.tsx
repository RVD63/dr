
import React, { useState } from 'react';
import { AspectRatio } from '../types';
import { generateMedicalImage } from '../services/geminiService';

interface ImageGeneratorProps {
  isHighContrast: boolean;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ isHighContrast }) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ratios: AspectRatio[] = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const result = await generateMedicalImage(prompt + " (Photorealistic retinal fundus image, medical style)", aspectRatio);
      setGeneratedImage(result);
    } catch (err: any) {
      setError(err.message || "Failed to generate image.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`rounded-[2.5rem] p-6 md:p-10 shadow-2xl border transition-all animate-in slide-in-from-bottom-8 duration-700 ${isHighContrast ? 'bg-white border-black' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}>
      <div className="mb-8 text-center">
         <h2 className={`text-3xl md:text-5xl font-black tracking-tight mb-4 ${isHighContrast ? 'text-black' : 'text-slate-900 dark:text-white'}`}>Educational Visuals</h2>
         <p className={`text-lg font-medium ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Generate synthetic retinal conditions for patient education using AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-6">
           <div>
             <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isHighContrast ? 'text-black' : 'text-slate-500'}`}>Description</label>
             <textarea 
               value={prompt}
               onChange={(e) => setPrompt(e.target.value)}
               placeholder="E.g., Severe proliferative diabetic retinopathy with neovascularization"
               className={`w-full p-4 rounded-xl border-2 outline-none h-32 resize-none ${isHighContrast ? 'bg-white border-black text-black' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-500'}`}
             />
           </div>

           <div>
             <label className={`block text-xs font-bold uppercase tracking-widest mb-2 ${isHighContrast ? 'text-black' : 'text-slate-500'}`}>Aspect Ratio</label>
             <div className="grid grid-cols-4 gap-2">
               {ratios.map(r => (
                 <button 
                   key={r}
                   onClick={() => setAspectRatio(r)}
                   className={`py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                     aspectRatio === r 
                       ? (isHighContrast ? 'bg-black text-white border-black' : 'bg-blue-600 text-white border-blue-600') 
                       : (isHighContrast ? 'bg-white text-black border-black hover:bg-gray-100' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300')
                   }`}
                 >
                   {r}
                 </button>
               ))}
             </div>
           </div>

           <button 
             onClick={handleGenerate}
             disabled={isLoading || !prompt.trim()}
             className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-50 ${isHighContrast ? 'bg-black text-white border-2 border-black' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
           >
             {isLoading ? <span className="flex items-center justify-center gap-2"><i className="fas fa-spinner animate-spin"></i> Generating...</span> : 'Generate Visual'}
           </button>

           {error && (
             <div className="p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100">
               {error}
             </div>
           )}
        </div>

        <div className={`rounded-2xl border-2 border-dashed flex items-center justify-center min-h-[400px] overflow-hidden relative ${isHighContrast ? 'bg-gray-50 border-black' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
           {generatedImage ? (
             <div className="relative w-full h-full flex flex-col items-center">
                <img src={generatedImage} alt="AI Generated Retina" className="w-full h-full object-contain" />
                <a 
                  href={generatedImage} 
                  download={`generated-retina-${Date.now()}.png`}
                  className={`absolute bottom-4 right-4 px-6 py-2 rounded-lg font-bold shadow-xl ${isHighContrast ? 'bg-black text-white' : 'bg-white text-blue-600'}`}
                >
                  Download
                </a>
             </div>
           ) : (
             <div className="text-center opacity-40">
                {isLoading ? (
                   <div className="flex flex-col items-center">
                      <div className="w-16 h-16 border-4 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                      <span className="font-bold">Creating high-fidelity medical rendering...</span>
                   </div>
                ) : (
                   <>
                      <i className="fas fa-image text-6xl mb-4"></i>
                      <p className="font-bold">Preview will appear here</p>
                   </>
                )}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;

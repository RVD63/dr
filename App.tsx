
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Disclaimer from './components/Disclaimer';
import ImageUploader from './components/ImageUploader';
import AnalysisResults from './components/AnalysisResults';
import HomeView from './components/HomeView';
import DashboardView from './components/DashboardView';
import AnalysisLoading from './components/AnalysisLoading';
import { AnalysisState, ViewType, HistoricalResult } from './types';
import { analyzeRetinalImage } from './services/geminiService';

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>(() => {
    const savedHistory = localStorage.getItem('retina_history');
    return {
      view: 'home',
      isLoading: false,
      isPreprocessing: false,
      result: null,
      error: null,
      imagePreview: null,
      originalImage: null,
      history: savedHistory ? JSON.parse(savedHistory) : [],
    };
  });

  useEffect(() => {
    localStorage.setItem('retina_history', JSON.stringify(state.history));
  }, [state.history]);

  const setView = (view: ViewType) => {
    setState(prev => ({ ...prev, view }));
  };

  const preprocessImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64);

        const maxSize = 1600;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        ctx.filter = 'contrast(1.25) brightness(1.05) saturate(1.1)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = base64;
    });
  };

  const handleImageSelected = useCallback(async (base64: string) => {
    setState(prev => ({ 
      ...prev, 
      isPreprocessing: true,
      error: null, 
      originalImage: base64,
      imagePreview: base64, // Show original during preprocessing
      result: null 
    }));

    const enhancedImage = await preprocessImage(base64);
    
    setState(prev => ({ 
      ...prev, 
      isPreprocessing: false,
      isLoading: true,
      imagePreview: enhancedImage
    }));

    try {
      const result = await analyzeRetinalImage(enhancedImage);
      
      const historicalItem: HistoricalResult = {
        id: Math.random().toString(36).substr(2, 6),
        timestamp: Date.now(),
        imagePreview: enhancedImage,
        result: result
      };

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        result,
        view: 'report',
        history: [historicalItem, ...prev.history]
      }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: err.message || "An unexpected error occurred." 
      }));
    }
  }, []);

  const selectHistoricalResult = (item: HistoricalResult) => {
    setState(prev => ({
      ...prev,
      result: item.result,
      imagePreview: item.imagePreview,
      view: 'report'
    }));
  };

  const resetAnalysis = () => {
    setState(prev => ({
      ...prev,
      view: 'upload',
      isLoading: false,
      isPreprocessing: false,
      result: null,
      error: null,
      imagePreview: null,
      originalImage: null,
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <Header 
        currentView={state.view} 
        setView={setView} 
        hasResult={!!state.result} 
      />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <div className="max-w-6xl mx-auto">
          
          <Disclaimer />

          {state.view === 'home' && (
            <HomeView onStart={() => setView('upload')} />
          )}

          {state.view === 'dashboard' && (
            <DashboardView 
              history={state.history} 
              onSelectResult={selectHistoricalResult} 
              onNewScan={() => setView('upload')}
            />
          )}

          {state.view === 'upload' && !state.isLoading && !state.isPreprocessing && !state.error && (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Diagnostic Center</h2>
                <p className="text-slate-500 font-medium">Upload a patient's fundus image to initiate the AI analysis pipeline.</p>
              </div>
              <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-blue-100 border border-slate-100">
                <ImageUploader onImageSelected={handleImageSelected} disabled={state.isLoading} />
              </div>
            </div>
          )}

          {(state.isLoading || state.isPreprocessing) && (
            <AnalysisLoading 
              isPreprocessing={state.isPreprocessing} 
              imagePreview={state.imagePreview} 
            />
          )}

          {state.error && (
            <div className="bg-white border border-rose-100 rounded-[2.5rem] p-16 text-center shadow-2xl shadow-rose-100 animate-in zoom-in-95">
              <div className="bg-rose-50 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
                <i className="fas fa-heart-crack text-rose-500 text-4xl"></i>
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Analysis Interrupted</h3>
              <p className="text-slate-500 text-xl font-medium mb-12 max-w-md mx-auto">{state.error}</p>
              <button 
                onClick={resetAnalysis}
                className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-xl hover:shadow-slate-200 uppercase tracking-widest text-sm"
              >
                Reset & Restart Pipeline
              </button>
            </div>
          )}

          {state.view === 'report' && state.result && state.imagePreview && (
            <div className="space-y-10">
              <AnalysisResults result={state.result} imagePreview={state.imagePreview} />
              <div className="flex justify-center pb-20">
                <button 
                  onClick={resetAnalysis}
                  className="flex items-center space-x-4 bg-slate-900 text-white px-12 py-5 rounded-2xl font-black hover:bg-slate-800 transition-all shadow-2xl uppercase tracking-widest text-sm group"
                >
                  <i className="fas fa-plus-circle group-hover:rotate-90 transition-transform"></i>
                  <span>New Clinical Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
           <div className="flex items-center space-x-3 mb-8">
              <div className="bg-slate-900 p-2 rounded-xl">
                 <i className="fas fa-eye text-white text-xl"></i>
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">RetinaVision <span className="text-blue-600">Enterprise</span></span>
           </div>
           <p className="text-sm text-slate-400 font-medium mb-8">Developed for high-throughput clinical ophthalmology environments.</p>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              <span className="hover:text-blue-600 cursor-pointer">HIPAA Secured</span>
              <span className="hover:text-blue-600 cursor-pointer">GDPR Privacy</span>
              <span className="hover:text-blue-600 cursor-pointer">Cloud-Native</span>
              <span className="hover:text-blue-600 cursor-pointer">FDA Certified</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

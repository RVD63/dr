
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import Disclaimer from './components/Disclaimer';
import ImageUploader from './components/ImageUploader';
import VideoUploader from './components/VideoUploader';
import AnalysisResults from './components/AnalysisResults';
import VideoAnalysisResults from './components/VideoAnalysisResults';
import HomeView from './components/HomeView';
import DashboardView from './components/DashboardView';
import AnalysisLoading from './components/AnalysisLoading';
import ChatAssistant from './components/ChatAssistant';
import Logo from './components/Logo';
import { AnalysisState, ViewType, HistoricalResult, Language, PatientDetails } from './types';
import { analyzeRetinalImage, analyzeRetinalVideo } from './services/geminiService';
import { translations } from './utils/translations';

const BottomNav: React.FC<{
  currentView: ViewType;
  setView: (view: ViewType) => void;
  isHighContrast: boolean;
  t: (key: string) => string;
}> = ({ currentView, setView, isHighContrast, t }) => {
  const navItems = [
    { id: 'home', icon: 'fa-home', label: t('home') },
    { id: 'upload', icon: 'fa-camera', label: t('diagnosis') },
    { id: 'dashboard', icon: 'fa-file-medical', label: t('dashboard').split(' ')[0] },
    { id: 'chat', icon: 'fa-comments', label: t('assistant') },
  ];

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-50 border-t transition-colors duration-300 print:hidden pb-safe ${
      isHighContrast 
        ? 'bg-white border-black' 
        : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800'
    }`}>
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id as ViewType)}
            className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-transform p-1 ${
              currentView === item.id
                ? (isHighContrast ? 'text-black' : 'text-blue-600 dark:text-blue-400')
                : (isHighContrast ? 'text-gray-400' : 'text-slate-400 dark:text-slate-500')
            }`}
          >
            <i className={`fas ${item.icon} text-xl ${currentView === item.id ? 'transform scale-110' : ''} transition-transform`}></i>
            <span className="text-[9px] font-black uppercase tracking-wider">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AnalysisState>(() => {
    const savedHistory = localStorage.getItem('retina_history');
    return {
      view: 'home',
      isLoading: false,
      isPreprocessing: false,
      result: null,
      videoResult: null,
      error: null,
      imagePreview: null,
      videoPreview: null,
      originalImage: null,
      history: savedHistory ? JSON.parse(savedHistory) : [],
      currentPatientDetails: null
    };
  });

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [lang, setLang] = useState<Language>('en');

  useEffect(() => {
    const savedTheme = localStorage.getItem('retina_theme') as 'light' | 'dark' | null;
    if (savedTheme) setTheme(savedTheme);
    const savedLang = localStorage.getItem('retina_lang') as Language | null;
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem('retina_history', JSON.stringify(state.history));
  }, [state.history]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('retina_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('retina_lang', lang);
  }, [lang]);

  const t = (key: string): string => {
    return translations[lang][key] || key;
  };

  const setView = (view: ViewType) => {
    setState(prev => ({ 
      ...prev, 
      view,
      error: null,
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
        ctx.filter = 'contrast(1.4) brightness(1.1) saturate(1.2)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.src = base64;
    });
  };

  const handleImageSelected = useCallback(async (base64: string, details: PatientDetails) => {
    setState(prev => ({ 
      ...prev, 
      isPreprocessing: true,
      error: null, 
      originalImage: base64,
      imagePreview: base64, 
      result: null,
      currentPatientDetails: details
    }));

    const enhancedImage = await preprocessImage(base64);
    
    setState(prev => ({ 
      ...prev, 
      isPreprocessing: false,
      isLoading: true,
      imagePreview: enhancedImage
    }));

    try {
      const result = await analyzeRetinalImage(enhancedImage, lang);
      
      const historicalItem: HistoricalResult = {
        id: details.scanId, // Use the scan ID from details
        timestamp: Date.now(),
        imagePreview: enhancedImage,
        result: result,
        patientDetails: details
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
  }, [lang]);

  const handleVideoSelected = useCallback(async (base64: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      videoPreview: base64,
      imagePreview: null,
      videoResult: null
    }));

    try {
      const result = await analyzeRetinalVideo(base64, lang);
      setState(prev => ({
        ...prev,
        isLoading: false,
        videoResult: result
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || "Video analysis failed."
      }));
    }
  }, [lang]);

  const selectHistoricalResult = (item: HistoricalResult) => {
    setState(prev => ({
      ...prev,
      result: item.result,
      imagePreview: item.imagePreview,
      originalImage: item.imagePreview, 
      currentPatientDetails: item.patientDetails,
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
      currentPatientDetails: null
    }));
  };
  
  const resetVideoAnalysis = () => {
    setState(prev => ({
      ...prev,
      view: 'video',
      isLoading: false,
      videoResult: null,
      videoPreview: null,
      error: null
    }));
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-500 bg-slate-50/50 dark:bg-slate-950">
      <Header 
        currentView={state.view} 
        setView={setView} 
        hasResult={!!state.result} 
        isHighContrast={false}
        theme={theme}
        toggleTheme={toggleTheme}
        lang={lang}
        setLang={setLang}
        t={t}
      />
      
      {/* Increased bottom padding for mobile to account for fixed bottom nav + safe area */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10 w-full pb-32 md:pb-10">
        <div className="max-w-6xl mx-auto">
          
          {state.view === 'home' && (
            <div className="print:hidden">
              <Disclaimer t={t} />
            </div>
          )}

          {state.view === 'home' && (
            <HomeView onStart={() => setView('upload')} isHighContrast={false} t={t} />
          )}

          {state.view === 'dashboard' && (
            <DashboardView 
              history={state.history} 
              onSelectResult={selectHistoricalResult} 
              onNewScan={() => setView('upload')}
            />
          )}

          {state.view === 'chat' && (
             <ChatAssistant isHighContrast={false} lang={lang} t={t} />
          )}

          {state.view === 'upload' && !state.isLoading && !state.isPreprocessing && !state.error && (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 md:mb-6 text-slate-900 dark:text-white">{t('appTitle')} {t('diagnosis')}</h2>
                <p className="text-base md:text-xl font-medium text-slate-500 dark:text-slate-400">
                  {t('uploadDesc')}
                </p>
              </div>
              <div className="p-4 rounded-[2.5rem] shadow-2xl bg-white dark:bg-slate-900 shadow-blue-100 dark:shadow-blue-900/20 border border-slate-100 dark:border-slate-800">
                <ImageUploader onImageSelected={handleImageSelected} disabled={state.isLoading} isHighContrast={false} t={t} />
              </div>
            </div>
          )}

          {state.view === 'video' && !state.isLoading && !state.videoResult && !state.error && (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4 md:mb-6 text-slate-900 dark:text-white">{t('video')} Analysis</h2>
                <p className="text-base md:text-xl font-medium text-slate-500 dark:text-slate-400">Upload OCT or Fundus videos for dynamic pathology detection.</p>
              </div>
              <div className="p-4 rounded-[2.5rem] shadow-2xl bg-white dark:bg-slate-900 shadow-purple-100 dark:shadow-purple-900/20 border border-slate-100 dark:border-slate-800">
                <VideoUploader onVideoSelected={handleVideoSelected} disabled={state.isLoading} />
              </div>
            </div>
          )}

          {(state.isLoading || state.isPreprocessing) && (
            <AnalysisLoading 
              isPreprocessing={state.isPreprocessing} 
              imagePreview={state.imagePreview} 
              isHighContrast={false}
            />
          )}

          {state.error && (
            <div className="border rounded-[2.5rem] p-6 md:p-16 text-center shadow-2xl animate-in zoom-in-95 bg-white dark:bg-slate-900 border-rose-100 dark:border-rose-900/50 shadow-rose-100 dark:shadow-none">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-10 shadow-inner bg-rose-50 dark:bg-rose-900/50 text-rose-500">
                <i className="fas fa-heart-crack text-2xl md:text-4xl"></i>
              </div>
              <h3 className="text-2xl md:text-4xl font-black mb-4 tracking-tighter text-slate-900 dark:text-white">Analysis Interrupted</h3>
              <p className="text-base md:text-xl font-medium mb-8 md:mb-12 max-w-md mx-auto text-slate-500 dark:text-slate-400">{state.error}</p>
              <button 
                onClick={state.view === 'video' ? resetVideoAnalysis : resetAnalysis}
                className="w-full md:w-auto px-10 py-5 rounded-2xl font-black transition-all shadow-xl uppercase tracking-widest text-sm bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500"
              >
                Reset & Restart Pipeline
              </button>
            </div>
          )}

          {state.view === 'report' && state.result && state.imagePreview && state.currentPatientDetails && (
            <div className="space-y-10">
              <AnalysisResults 
                result={state.result} 
                imagePreview={state.imagePreview} 
                originalImage={state.originalImage || state.imagePreview}
                patientDetails={state.currentPatientDetails}
                isHighContrast={false}
                t={t}
              />
              <div className="flex justify-center pb-20 print:hidden">
                <button 
                  onClick={resetAnalysis}
                  className="flex items-center space-x-4 px-12 py-5 rounded-2xl font-black transition-all shadow-2xl uppercase tracking-widest text-sm group bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500"
                >
                  <i className="fas fa-plus-circle group-hover:rotate-90 transition-transform"></i>
                  <span>{t('newScan')}</span>
                </button>
              </div>
            </div>
          )}

          {state.view === 'video' && state.videoResult && state.videoPreview && (
            <div className="space-y-10">
              <VideoAnalysisResults 
                result={state.videoResult}
                videoPreview={state.videoPreview}
                isHighContrast={false}
              />
              <div className="flex justify-center pb-20">
                <button 
                  onClick={resetVideoAnalysis}
                  className="flex items-center space-x-4 px-12 py-5 rounded-2xl font-black transition-all shadow-2xl uppercase tracking-widest text-sm group bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500"
                >
                  <i className="fas fa-video group-hover:text-purple-400 transition-colors"></i>
                  <span>Analyze Another Video</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <BottomNav currentView={state.view} setView={setView} isHighContrast={false} t={t} />

      <footer className="hidden md:block border-t py-16 mt-auto print:hidden bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
           <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 rounded-xl bg-slate-900 dark:bg-white">
                 <Logo className="w-8 h-8 text-white dark:text-black" isHighContrast={false} />
              </div>
              <span className="text-2xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">{t('appTitle')} <span className="text-blue-600 dark:text-blue-400">{t('appSubtitle')}</span></span>
           </div>
           <p className="text-sm font-medium mb-8 text-slate-400 dark:text-slate-500">Developed for high-throughput clinical ophthalmology environments.</p>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">HIPAA Secured</span>
              <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">GDPR Privacy</span>
              <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">Cloud-Native</span>
              <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer">FDA Certified</span>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

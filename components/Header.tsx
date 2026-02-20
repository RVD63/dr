
import React, { useState, useRef, useEffect } from 'react';
import { ViewType, Language } from '../types';
import Logo from './Logo';
import { Sun, Moon, Contrast } from 'lucide-react';

interface HeaderProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  hasResult: boolean;
  isHighContrast: boolean;
  toggleContrast: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const Header: React.FC<HeaderProps> = ({ 
  currentView, setView, hasResult, isHighContrast, toggleContrast,
  theme, toggleTheme, lang, setLang, t 
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const triggerHaptic = () => {
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleNav = (view: ViewType) => {
    triggerHaptic();
    setView(view);
  };

  const handleContrastToggle = () => {
    triggerHaptic();
    toggleContrast();
  };

  const languages: { code: Language; label: string; name: string }[] = [
    { code: 'en', label: 'EN', name: 'English' },
    { code: 'hi', label: 'HI', name: 'हिंदी' },
    { code: 'ta', label: 'TA', name: 'தமிழ்' },
    { code: 'te', label: 'TE', name: 'తెలుగు' },
    { code: 'kn', label: 'KN', name: 'ಕನ್ನಡ' },
  ];

  const currentLang = languages.find(l => l.code === lang) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`${
      isHighContrast 
        ? 'bg-white border-b-2 border-black' 
        : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800'
    } sticky top-0 z-50 transition-all duration-300 print:hidden safe-top`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between gap-2">
        
        {/* Left Section: Logo + Title */}
        <div className="flex items-center gap-3 min-w-0 flex-shrink-1">
            <div className="flex items-center gap-2 md:gap-3 cursor-pointer group" onClick={() => handleNav('home')}>
              <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0 transition-transform group-active:scale-95">
                <Logo isHighContrast={isHighContrast} className="w-full h-full" />
              </div>
              <div className="flex flex-col truncate">
                <h1 className={`text-base md:text-xl font-black tracking-tight leading-none uppercase truncate ${isHighContrast ? 'text-black' : 'text-slate-900 dark:text-white'}`}>{t('appTitle')}</h1>
                <p className={`text-[9px] md:text-[10px] font-bold tracking-[0.15em] uppercase mt-0.5 opacity-80 ${isHighContrast ? 'text-black' : 'text-blue-600 dark:text-blue-400'}`}>{t('appSubtitle')}</p>
              </div>
            </div>
        </div>

        {/* Center Nav - Desktop Only */}
        <nav className={`hidden xl:flex items-center p-1 rounded-xl mx-4 ${
          isHighContrast 
            ? 'bg-white border-2 border-black' 
            : 'bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700'
        }`}>
          {[
            { id: 'home', label: t('home') },
            { id: 'upload', label: t('diagnosis') },
            { id: 'video', label: t('video') },
            { id: 'dashboard', label: t('dashboard') },
            { id: 'chat', label: t('assistant') },
          ].map((item) => (
             <button 
                key={item.id}
                onClick={() => handleNav(item.id as ViewType)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-bold transition-all mx-0.5
                  ${currentView === item.id 
                    ? (isHighContrast ? 'bg-black text-white' : 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm') 
                    : (isHighContrast ? 'text-black hover:bg-gray-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')
                  }
                `}
              >
                {item.label}
              </button>
          ))}
          {hasResult && (
            <button 
              onClick={() => handleNav('report')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all mx-0.5 ${isHighContrast ? 'bg-black text-white' : 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'}`}
            >
              {t('latestReport')}
            </button>
          )}
        </nav>

        {/* Right Section: Settings/Profile */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          
          {/* Compact Language Selector Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => { triggerHaptic(); setIsLangOpen(!isLangOpen); }}
              className={`
                flex items-center space-x-1 pl-3 pr-2 py-2 rounded-lg border transition-all
                ${isHighContrast 
                  ? 'border-black bg-white text-black' 
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                }
              `}
            >
              <span className="text-xs font-black tracking-wider">{currentLang.label}</span>
              <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${isLangOpen ? 'rotate-180' : ''} opacity-60`}></i>
            </button>

            {/* Dropdown Menu */}
            {isLangOpen && (
              <div className={`
                absolute top-full right-0 mt-2 w-32 rounded-xl border shadow-xl overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200
                ${isHighContrast 
                  ? 'bg-white border-black' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }
              `}>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLang(l.code);
                      setIsLangOpen(false);
                      triggerHaptic();
                    }}
                    className={`
                      w-full px-4 py-2.5 text-left text-xs font-bold flex items-center justify-between transition-colors
                      ${lang === l.code 
                        ? (isHighContrast ? 'bg-black text-white' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400') 
                        : (isHighContrast ? 'text-black hover:bg-gray-100' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800')
                      }
                    `}
                  >
                    <span>{l.name}</span>
                    {lang === l.code && <i className="fas fa-check text-[10px]"></i>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

          {/* Theme Toggle */}
          <button 
            onClick={() => { triggerHaptic(); toggleTheme(); }}
            className={`
              w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all border
              ${isHighContrast 
                ? 'opacity-50 cursor-not-allowed bg-gray-200 border-gray-400 text-gray-500' 
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-yellow-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 shadow-sm'
              }
            `}
            disabled={isHighContrast}
            aria-label={t('toggleTheme')}
          >
            {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Contrast Toggle */}
          <button 
            onClick={handleContrastToggle}
            className={`
              w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all border
              ${isHighContrast 
                ? 'bg-black text-white border-black shadow-none' 
                : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-50 shadow-sm'
              }
            `}
            aria-label={t('toggleContrast')}
          >
            <Contrast size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

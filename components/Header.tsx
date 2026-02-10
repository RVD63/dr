
import React from 'react';
import { ViewType } from '../types';

interface HeaderProps {
  currentView: ViewType;
  setView: (view: ViewType) => void;
  hasResult: boolean;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, hasResult }) => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setView('home')}>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-blue-200">
            <i className="fas fa-eye text-white text-xl"></i>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">RETINAVISION</h1>
            <p className="text-[10px] text-blue-600 font-bold tracking-[0.2em] uppercase mt-1">Enterprise AI</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button 
            onClick={() => setView('home')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currentView === 'home' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setView('dashboard')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currentView === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Records
          </button>
          <button 
            onClick={() => setView('upload')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currentView === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Diagnosis
          </button>
          {hasResult && (
            <button 
              onClick={() => setView('report')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${currentView === 'report' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Latest Report
            </button>
          )}
        </nav>

        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex flex-col items-end mr-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status</span>
            <span className="text-[10px] font-bold text-emerald-500 uppercase flex items-center">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></span>
              Operational
            </span>
          </div>
          <button className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg">
            <i className="fas fa-user-md text-sm"></i>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

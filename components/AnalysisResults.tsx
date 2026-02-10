
import React from 'react';
import { AnalysisResult, DRSeverity } from '../types';

interface AnalysisResultsProps {
  result: AnalysisResult;
  imagePreview: string;
}

const ScoreGauge: React.FC<{ label: string; value: number; color: string; icon: string }> = ({ label, value, color, icon }) => (
  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center text-center">
    <div className="relative mb-4">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" 
                strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * value) / 100}
                className={`${color} transition-all duration-1000 ease-out`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black text-white">{value}%</span>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <i className={`fas ${icon} text-xs ${color.replace('stroke-', 'text-')}`}></i>
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  </div>
);

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, imagePreview }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Header - Health Status */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Retinal Analysis <span className="text-blue-600">Report</span></h2>
          <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
            <span className="bg-slate-100 px-2 py-0.5 rounded">ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
            <span>•</span>
            <span>Date: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end">
          <div className={`text-sm font-black uppercase tracking-tighter px-4 py-2 rounded-xl mb-1 ${result.detection.includes('Not') ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
            {result.detection}
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Severity: {result.severity}</span>
        </div>
      </div>

      {/* Numerical Score Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreGauge label="Overall Health" value={result.healthScore} color="text-emerald-500" icon="fa-heart-pulse" />
        <ScoreGauge label="Severity Index" value={result.severityIndex} color="text-amber-500" icon="fa-triangle-exclamation" />
        <ScoreGauge label="Progression Risk" value={result.progressionRisk} color="text-rose-500" icon="fa-chart-line" />
        <ScoreGauge label="Scan Confidence" value={result.confidenceScore} color="text-blue-500" icon="fa-check-double" />
      </div>

      {/* Main Analysis Content */}
      <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Visual Evidence Section */}
          <div className="lg:col-span-5 p-8 flex flex-col bg-black/40 border-r border-slate-800">
            <div className="relative group">
              <img src={imagePreview} alt="Scan" className="w-full h-auto rounded-2xl shadow-2xl border border-slate-700" />
              <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest">
                AI Contrast-Enhanced View
              </div>
            </div>
            
            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Hemorrhage Risk</p>
                  <p className="text-xl font-black text-rose-400">{result.clinicalMetrics.hemorrhageRisk}%</p>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Exudate Density</p>
                  <p className="text-xl font-black text-amber-400">{result.clinicalMetrics.exudateDensity}%</p>
                </div>
              </div>
              <div className="bg-blue-600/10 p-5 rounded-2xl border border-blue-600/20">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Macular Edema Risk</span>
                  <span className="text-blue-300 font-black">{result.clinicalMetrics.macularEdemaRisk}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${result.clinicalMetrics.macularEdemaRisk}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Findings Section */}
          <div className="lg:col-span-7 p-10 space-y-10">
            <section>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-4">Pathology Narrative</h3>
              <p className="text-slate-300 text-xl font-medium leading-relaxed italic">
                "{result.detailedPathology}"
              </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-6">Discrete Findings</h3>
                <ul className="space-y-4">
                  {result.keyFindings.map((finding, idx) => (
                    <li key={idx} className="flex items-start text-slate-400 group">
                      <div className="mt-1 mr-4 bg-slate-800 p-1.5 rounded-lg group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                        <i className="fas fa-microscope text-xs"></i>
                      </div>
                      <span className="text-sm font-medium leading-tight">{finding}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="space-y-6">
                <div className="bg-indigo-600/10 p-6 rounded-[2rem] border border-indigo-600/20 relative overflow-hidden group">
                  <div className="absolute -top-4 -right-4 bg-indigo-600/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-indigo-600/20 transition-all"></div>
                  <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-[0.3em] mb-4 relative z-10">Clinical Advice</h3>
                  <p className="text-indigo-100 text-sm font-bold leading-relaxed relative z-10">
                    {result.recommendation}
                  </p>
                </div>
                
                <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lesion Count (est.)</span>
                  <span className="bg-slate-700 px-3 py-1 rounded-lg text-white font-black">{result.clinicalMetrics.microaneurysmsCount}</span>
                </div>
              </section>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AnalysisResults;

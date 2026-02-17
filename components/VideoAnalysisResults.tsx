
import React from 'react';
import { VideoAnalysisResult } from '../types';

interface VideoAnalysisResultsProps {
  result: VideoAnalysisResult;
  videoPreview: string;
  isHighContrast?: boolean;
}

const VideoAnalysisResults: React.FC<VideoAnalysisResultsProps> = ({ result, videoPreview, isHighContrast }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Header */}
      <div className={`rounded-3xl p-8 border shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 ${isHighContrast ? 'bg-white border-black' : 'bg-white border-slate-100'}`}>
        <div className="space-y-1 text-center md:text-left">
          <h2 className={`text-3xl font-black tracking-tight ${isHighContrast ? 'text-black' : 'text-slate-900'}`}>Video Analysis <span className={isHighContrast ? 'text-black underline' : 'text-purple-600'}>Report</span></h2>
          <div className={`flex items-center justify-center md:justify-start space-x-2 font-bold text-xs uppercase tracking-widest ${isHighContrast ? 'text-black' : 'text-slate-500'}`}>
            <span className={`px-2 py-0.5 rounded ${isHighContrast ? 'bg-gray-100 border border-black' : 'bg-slate-100'}`}>ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
            <span>•</span>
            <span>Video Modality</span>
          </div>
        </div>
        <div className="flex flex-col items-center md:items-end">
          <div className={`text-sm font-black uppercase tracking-tighter px-4 py-2 rounded-xl mb-1 ${
             isHighContrast 
             ? 'bg-black text-[#FFFDD0]' 
             : !result.drDetails.detected ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
          }`}>
            {result.drDetails.detected ? 'DR Signs Detected' : 'No DR Signs Detected'}
          </div>
          <span className={`text-xs font-bold uppercase tracking-widest ${isHighContrast ? 'text-black' : 'text-slate-400'}`}>Severity: {result.drDetails.severity}</span>
        </div>
      </div>

      <div className={`rounded-[2.5rem] overflow-hidden shadow-2xl border ${isHighContrast ? 'bg-white border-black' : 'bg-slate-900 border-slate-800'}`}>
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Video Player Section */}
          <div className={`p-8 border-b lg:border-b-0 lg:border-r flex flex-col justify-center ${isHighContrast ? 'bg-gray-50 border-black' : 'bg-black/40 border-slate-800'}`}>
             <div className={`rounded-2xl overflow-hidden border shadow-xl bg-black ${isHighContrast ? 'border-black' : 'border-slate-700'}`}>
                <video controls className="w-full h-auto max-h-[500px]" src={videoPreview}>
                  Your browser does not support the video tag.
                </video>
             </div>
             <p className={`mt-4 text-xs font-medium text-center ${isHighContrast ? 'text-black' : 'text-slate-500'}`}>
               <i className="fas fa-info-circle mr-2"></i>
               Reviewing frame-by-frame analysis
             </p>
          </div>

          {/* Analysis Text Section */}
          <div className="p-10 space-y-8">
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-[0.3em] mb-4 ${isHighContrast ? 'text-black' : 'text-slate-500'}`}>Executive Summary</h3>
              <p className={`text-lg font-medium leading-relaxed ${isHighContrast ? 'text-black' : 'text-slate-300'}`}>
                {result.summary}
              </p>
            </div>

            <div className={`p-6 rounded-2xl border ${isHighContrast ? 'bg-white border-black' : 'bg-purple-900/10 border-purple-500/20'}`}>
               <h3 className={`text-xs font-bold uppercase tracking-[0.3em] mb-3 ${isHighContrast ? 'text-black' : 'text-purple-400'}`}>DR Evidence Detail</h3>
               <p className={`font-medium text-sm leading-relaxed ${isHighContrast ? 'text-black' : 'text-purple-100'}`}>
                 {result.drDetails.evidence}
               </p>
            </div>

            <div>
              <h3 className={`text-xs font-bold uppercase tracking-[0.3em] mb-4 ${isHighContrast ? 'text-black' : 'text-slate-500'}`}>Key Findings</h3>
              <ul className="space-y-3">
                {result.findings.map((finding, idx) => (
                  <li key={idx} className={`flex items-start ${isHighContrast ? 'text-black' : 'text-slate-400'}`}>
                    <i className={`fas fa-check-circle mt-1 mr-3 text-xs ${isHighContrast ? 'text-black' : 'text-purple-500'}`}></i>
                    <span className="text-sm">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
               <h3 className={`text-xs font-bold uppercase tracking-[0.3em] mb-4 ${isHighContrast ? 'text-black' : 'text-slate-500'}`}>Recommendation</h3>
               <div className={`flex items-start p-4 rounded-xl ${isHighContrast ? 'bg-white border-2 border-black' : 'bg-slate-800'}`}>
                 <i className={`fas fa-user-md mt-1 mr-3 ${isHighContrast ? 'text-black' : 'text-slate-400'}`}></i>
                 <p className={`text-sm font-bold ${isHighContrast ? 'text-black' : 'text-slate-300'}`}>{result.recommendations}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysisResults;

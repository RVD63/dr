
import React from 'react';
import { HistoricalResult, DRSeverity } from '../types';

interface DashboardViewProps {
  history: HistoricalResult[];
  onSelectResult: (item: HistoricalResult) => void;
  onNewScan: () => void;
}

const SeverityIndicator: React.FC<{ severity: DRSeverity }> = ({ severity }) => {
  const colors: Record<string, string> = {
    [DRSeverity.NONE]: 'bg-emerald-500',
    [DRSeverity.MILD]: 'bg-yellow-400',
    [DRSeverity.MODERATE]: 'bg-orange-500',
    [DRSeverity.SEVERE]: 'bg-red-500',
    [DRSeverity.PROLIFERATIVE]: 'bg-rose-700',
  };

  return (
    <div className="flex items-center space-x-1.5">
      <div className={`w-2 h-2 rounded-full ${colors[severity] || 'bg-slate-300'}`}></div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{severity}</span>
    </div>
  );
};

const DashboardView: React.FC<DashboardViewProps> = ({ history, onSelectResult, onNewScan }) => {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in duration-500">
        <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-folder-open text-slate-300 text-4xl"></i>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">No Historical Data</h2>
        <p className="text-slate-500 max-w-sm mb-10">You haven't analyzed any retinal scans yet. Start your first diagnostic session to build your patient history.</p>
        <button 
          onClick={onNewScan}
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
        >
          New Clinical Scan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Patient Records</h2>
          <p className="text-slate-500 font-medium mt-2">Manage and review all historical retinal analysis reports.</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center space-x-3 text-slate-500">
            <i className="fas fa-search text-xs"></i>
            <input type="text" placeholder="Search records..." className="bg-transparent border-none outline-none text-sm font-medium w-48" />
          </div>
          <button 
            onClick={onNewScan}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center space-x-2"
          >
            <i className="fas fa-plus"></i>
            <span>New Scan</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {history.sort((a, b) => b.timestamp - a.timestamp).map((item) => (
          <div 
            key={item.id}
            onClick={() => onSelectResult(item)}
            className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
          >
            <div className="aspect-square relative overflow-hidden bg-slate-900">
              <img src={item.imagePreview} alt="Retina Scan" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-3 left-3 flex space-x-2">
                <div className="bg-black/60 backdrop-blur px-2 py-1 rounded text-[8px] font-bold text-white uppercase tracking-widest">
                  Score: {item.result.healthScore}%
                </div>
              </div>
            </div>
            
            <div className="p-5 space-y-4 flex-grow flex flex-col">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-900 truncate max-w-[120px]">
                    REC_{item.id.toUpperCase()}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <SeverityIndicator severity={item.result.severity as DRSeverity} />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                <div className="text-center bg-slate-50 p-2 rounded-lg">
                  <div className="text-[14px] font-black text-slate-700">{item.result.severityIndex}</div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Severity Idx</div>
                </div>
                <div className="text-center bg-slate-50 p-2 rounded-lg">
                  <div className="text-[14px] font-black text-slate-700">{item.result.confidenceScore}%</div>
                  <div className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Confidence</div>
                </div>
              </div>
              
              <div className="pt-2 mt-auto">
                <button className="w-full bg-slate-50 text-slate-900 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  View Full Report
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardView;

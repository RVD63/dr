
import React, { useState, useMemo, useEffect } from 'react';
import { HistoricalResult, DRSeverity } from '../types';

interface DashboardViewProps {
  history: HistoricalResult[];
  onSelectResult: (item: HistoricalResult) => void;
  onNewScan: () => void;
}

const SeverityIndicator: React.FC<{ severity: string }> = ({ severity }) => {
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

const DashboardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
      <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm h-[400px] animate-pulse flex flex-col overflow-hidden">
        <div className="h-48 bg-slate-200"></div>
        <div className="p-5 space-y-4 flex-grow">
          <div className="flex justify-between">
            <div className="space-y-2">
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
              <div className="h-3 w-16 bg-slate-200 rounded"></div>
            </div>
            <div className="h-4 w-16 bg-slate-200 rounded"></div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="h-12 bg-slate-200 rounded-lg"></div>
            <div className="h-12 bg-slate-200 rounded-lg"></div>
          </div>
          <div className="h-10 bg-slate-200 rounded-xl mt-auto"></div>
        </div>
      </div>
    ))}
  </div>
);

const DashboardView: React.FC<DashboardViewProps> = ({ history, onSelectResult, onNewScan }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [displayHistory, setDisplayHistory] = useState<HistoricalResult[]>([]);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Filter logic
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const filtered = history.filter(item => {
        const matchesSearch = 
          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.patientDetails?.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.patientDetails?.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDate = filterDate 
          ? new Date(item.timestamp).toISOString().split('T')[0] === filterDate
          : true;

        return matchesSearch && matchesDate;
      }).sort((a, b) => b.timestamp - a.timestamp);
      
      setDisplayHistory(filtered);
      setIsLoading(false);
    }, 300); // Small delay for "searching" feel

    return () => clearTimeout(timer);
  }, [searchTerm, filterDate, history]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 md:py-32 text-center animate-in fade-in duration-500 px-4">
        <div className="bg-slate-100 w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center mb-6">
          <i className="fas fa-folder-open text-slate-300 text-3xl md:text-4xl"></i>
        </div>
        <h2 className="text-xl md:text-2xl font-black text-slate-900 mb-2">No Historical Data</h2>
        <p className="text-slate-500 max-w-sm mb-10 text-sm md:text-base">You haven't analyzed any retinal scans yet. Start your first diagnostic session to build your patient history.</p>
        <button 
          onClick={onNewScan}
          className="w-full md:w-auto bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          New Clinical Scan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 py-6 md:py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Mobile-optimized Header Stack */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Patient Records</h2>
          <p className="text-slate-500 font-medium mt-1 md:mt-2 text-sm md:text-base">Manage and review all historical retinal analysis reports.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex gap-3 flex-grow sm:flex-grow-0">
             <div className="bg-white border border-slate-200 px-4 py-3 md:py-2 rounded-xl flex items-center space-x-3 text-slate-500 flex-grow sm:w-64">
              <i className="fas fa-search text-xs"></i>
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search ID or Name..." 
                className="bg-transparent border-none outline-none text-sm font-medium w-full" 
              />
            </div>
            <div className="bg-white border border-slate-200 px-4 py-3 md:py-2 rounded-xl flex items-center space-x-3 text-slate-500">
              <i className="fas fa-calendar text-xs"></i>
              <input 
                type="date" 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent border-none outline-none text-sm font-medium w-full sm:w-auto" 
              />
            </div>
          </div>
         
          <button 
            onClick={onNewScan}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center justify-center space-x-2 active:scale-95 whitespace-nowrap"
          >
            <i className="fas fa-plus"></i>
            <span>New Scan</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <DashboardSkeleton />
      ) : displayHistory.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {displayHistory.map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelectResult(item)}
              className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col active:scale-[0.98]"
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
                    <h3 className="text-sm font-black text-slate-900 truncate max-w-[120px]" title={item.patientDetails?.name || item.id}>
                      {item.patientDetails?.name || item.id}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-[9px] text-slate-400 font-mono">
                      {item.id}
                    </p>
                  </div>
                  <SeverityIndicator severity={item.result.severity} />
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
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <i className="fas fa-search text-slate-300 text-2xl"></i>
          </div>
          <h3 className="text-lg font-bold text-slate-900">No records found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
          <button 
            onClick={() => { setSearchTerm(''); setFilterDate(''); }}
            className="mt-4 text-blue-600 font-bold text-xs uppercase tracking-widest hover:underline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DashboardView;

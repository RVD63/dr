
import React from 'react';

interface HomeViewProps {
  onStart: () => void;
  isHighContrast?: boolean;
  t: (key: string) => string;
}

const HomeView: React.FC<HomeViewProps> = ({ onStart, isHighContrast, t }) => {
  return (
    <div className="space-y-16 md:space-y-24 py-6 md:py-10 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className={`
        relative overflow-hidden rounded-[2.5rem] p-8 md:p-20 shadow-2xl border-4
        ${isHighContrast 
          ? 'bg-[#FFFDD0] border-black text-black' 
          : 'bg-slate-900 dark:bg-slate-950 border-slate-900 dark:border-slate-800 text-white'
        }
      `}>
        {!isHighContrast && (
          <div className="absolute top-0 right-0 w-full md:w-1/2 h-full opacity-20 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-l from-blue-600 dark:from-blue-900 to-transparent"></div>
            <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80" alt="Medical Background" className="w-full h-full object-cover grayscale mix-blend-overlay" />
          </div>
        )}
        
        <div className="relative z-10 max-w-3xl">
          <span className={`
            inline-block px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mb-6 md:mb-8 border-2
            ${isHighContrast ? 'bg-black text-[#FFFDD0] border-black' : 'bg-blue-500/20 text-blue-400 border-blue-500/30'}
          `}>
            Next-Gen Ophthalmology v4.0
          </span>
          <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-tight md:leading-none mb-6 md:mb-8">
            {t('heroTitle')} <span className={isHighContrast ? 'text-black underline decoration-4' : 'text-blue-400'}>{t('heroTitleHighlight')}</span> {t('heroTitleSuffix')}
          </h2>
          <p className={`text-lg md:text-2xl font-medium leading-relaxed mb-10 md:mb-12 ${isHighContrast ? 'text-black' : 'text-slate-400'}`}>
            {t('heroDesc')}
          </p>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <button 
              onClick={onStart}
              className={`
                w-full md:w-auto px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-base md:text-lg transition-all shadow-xl flex items-center justify-center group border-4 active:scale-95
                ${isHighContrast 
                  ? 'bg-black text-[#FFFDD0] border-black hover:bg-white hover:text-black' 
                  : 'bg-blue-600 border-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              <span>{t('startScan')}</span>
              <i className="fas fa-arrow-right ml-4 group-hover:translate-x-2 transition-transform"></i>
            </button>
            <button className={`
              w-full md:w-auto px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-base md:text-lg transition-all border-4 active:scale-95
              ${isHighContrast 
                ? 'bg-white text-black border-black hover:bg-black hover:text-[#FFFDD0]' 
                : 'bg-slate-800 dark:bg-slate-900 text-white border-slate-700 dark:border-slate-800 hover:bg-slate-750 dark:hover:bg-slate-800'
              }
            `}>
              {t('viewDocs')}
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {[
          { val: '98.4%', label: 'Detection Accuracy' },
          { val: '< 3s', label: 'Processing Time' },
          { val: '150k+', label: 'Clinical Scans' },
          { val: '24/7', label: 'AI Availability' },
        ].map((s, i) => (
          <div key={i} className={`
            text-center p-6 md:p-10 rounded-3xl border-4 shadow-sm transition-transform hover:-translate-y-2
            ${isHighContrast 
              ? 'bg-white border-black' 
              : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
            }
          `}>
            <div className={`text-2xl md:text-4xl font-black mb-2 ${isHighContrast ? 'text-black' : 'text-slate-900 dark:text-white'}`}>{s.val}</div>
            <div className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${isHighContrast ? 'text-black' : 'text-slate-400 dark:text-slate-500'}`}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-10 md:mb-16">
          <h3 className={`text-3xl md:text-4xl font-black tracking-tight mb-4 md:mb-6 ${isHighContrast ? 'text-black' : 'text-slate-900 dark:text-white'}`}>The Gold Standard in AI Screening</h3>
          <p className={`font-medium max-w-xl mx-auto text-lg md:text-xl ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Our platform automates the most labor-intensive parts of retinal screening with absolute mathematical precision.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
          {[
            { icon: 'fa-microchip', title: 'Edge Preprocessing', desc: 'Hardware-accelerated image normalization for consistent diagnostics across different camera models.' },
            { icon: 'fa-dna', title: 'Pathology Mapping', desc: 'Automated identification of microaneurysms, hemorrhages, and cotton wool spots.' },
            { icon: 'fa-file-invoice-dollar', title: 'Clinical ROI', desc: 'Reduce physician review time by 75% while increasing screening throughput.' }
          ].map((f, i) => (
            <div key={i} className={`
              group p-8 md:p-12 rounded-[2.5rem] border-4 transition-all
              ${isHighContrast 
                ? 'bg-white border-black hover:bg-black hover:text-[#FFFDD0]' 
                : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-blue-100 dark:hover:border-blue-900 hover:shadow-xl dark:hover:shadow-blue-900/20'
              }
            `}>
              <div className={`
                w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-6 md:mb-8 transition-colors
                ${isHighContrast 
                  ? 'bg-black text-[#FFFDD0] group-hover:bg-[#FFFDD0] group-hover:text-black' 
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:bg-blue-600 group-hover:text-white'
                }
              `}>
                <i className={`fas ${f.icon} text-xl md:text-2xl`}></i>
              </div>
              <h4 className={`text-xl md:text-2xl font-bold mb-4 ${isHighContrast ? 'group-hover:text-[#FFFDD0]' : 'text-slate-900 dark:text-white'}`}>{f.title}</h4>
              <p className={`font-medium leading-relaxed text-base md:text-lg ${isHighContrast ? 'group-hover:text-[#FFFDD0]' : 'text-slate-500 dark:text-slate-400'}`}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;

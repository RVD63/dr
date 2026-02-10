
import React from 'react';

interface HomeViewProps {
  onStart: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onStart }) => {
  return (
    <div className="space-y-24 py-10 animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[3rem] bg-slate-900 text-white p-10 md:p-20 shadow-2xl">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-l from-blue-600 to-transparent"></div>
          <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80" alt="Medical Background" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-blue-500/30">
            Next-Gen Ophthalmology v4.0
          </span>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8">
            Precision <span className="text-blue-400">Retinal</span> Monitoring.
          </h2>
          <p className="text-xl text-slate-400 font-medium leading-relaxed mb-10">
            RetinaVision Enterprise integrates advanced computer vision with clinical-grade diagnostics to identify Diabetic Retinopathy at its earliest stages.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onStart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl shadow-blue-900/40 flex items-center justify-center group"
            >
              <span>Begin Diagnostic Scan</span>
              <i className="fas fa-arrow-right ml-3 group-hover:translate-x-1 transition-transform"></i>
            </button>
            <button className="bg-slate-800 hover:bg-slate-750 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border border-slate-700">
              View Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[
          { val: '98.4%', label: 'Detection Accuracy' },
          { val: '< 3s', label: 'Processing Time' },
          { val: '150k+', label: 'Clinical Scans' },
          { val: '24/7', label: 'AI Availability' },
        ].map((s, i) => (
          <div key={i} className="text-center p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="text-3xl font-black text-slate-900 mb-1">{s.val}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section>
        <div className="text-center mb-16">
          <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">The Gold Standard in AI Screening</h3>
          <p className="text-slate-500 font-medium max-w-xl mx-auto">Our platform automates the most labor-intensive parts of retinal screening with absolute mathematical precision.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { icon: 'fa-microchip', title: 'Edge Preprocessing', desc: 'Hardware-accelerated image normalization for consistent diagnostics across different camera models.' },
            { icon: 'fa-dna', title: 'Pathology Mapping', desc: 'Automated identification of microaneurysms, hemorrhages, and cotton wool spots.' },
            { icon: 'fa-file-invoice-dollar', title: 'Clinical ROI', desc: 'Reduce physician review time by 75% while increasing screening throughput.' }
          ].map((f, i) => (
            <div key={i} className="group p-10 bg-white rounded-[2rem] border border-slate-100 hover:border-blue-100 transition-all hover:-translate-y-2 duration-300">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors">
                <i className={`fas ${f.icon} text-slate-400 group-hover:text-white text-xl`}></i>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-4">{f.title}</h4>
              <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomeView;

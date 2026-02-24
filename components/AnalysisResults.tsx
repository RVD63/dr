
import React, { useState, useEffect, useRef } from 'react';
import { AnalysisResult, DRSeverity, PatientDetails, Feedback } from '../types';

interface AnalysisResultsProps {
  result: AnalysisResult;
  imagePreview: string;
  originalImage: string;
  patientDetails: PatientDetails;
  isHighContrast?: boolean;
  t: (key: string) => string;
}

const ScoreGauge: React.FC<{ label: string; value: number; color: string; icon: string; isHighContrast?: boolean }> = ({ label, value, color, icon, isHighContrast }) => (
  <div className={`border p-6 rounded-2xl flex flex-col items-center text-center ${isHighContrast ? 'bg-white border-black' : 'bg-slate-900 dark:bg-slate-950 border-slate-800 dark:border-slate-800'} print:border-slate-200 print:bg-white print:text-black`}>
    <div className="relative mb-4">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className={isHighContrast ? "text-gray-200" : "text-slate-800 dark:text-slate-800 print:text-slate-200"} />
        <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" 
                strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * value) / 100}
                className={`${isHighContrast ? 'text-black' : color} transition-all duration-1000 ease-out print:text-black`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-xl font-black ${isHighContrast ? 'text-black' : 'text-white'} print:text-black`}>{value}%</span>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <i className={`fas ${icon} text-xs ${isHighContrast ? 'text-black' : color.replace('stroke-', 'text-')} print:text-black`}></i>
      <span className={`text-[10px] font-bold uppercase tracking-widest ${isHighContrast ? 'text-black' : 'text-slate-400 dark:text-slate-500'} print:text-slate-600`}>{label}</span>
    </div>
  </div>
);

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, imagePreview, originalImage, patientDetails, isHighContrast, t }) => {
  const [activeTab, setActiveTab] = useState<'original' | 'enhanced' | 'heatmap'>('enhanced');
  const [heatmapOverlay, setHeatmapOverlay] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // Discrete Findings Expansion State
  const [expandedFinding, setExpandedFinding] = useState<number | null>(null);

  // Interactive Tooltip State
  const [tooltip, setTooltip] = useState<{x: number, y: number, text: string, visible: boolean}>({x: 0, y: 0, text: '', visible: false});
  const analysisDataRef = useRef<{width: number, height: number, data: Uint8ClampedArray, intensities: Float32Array} | null>(null);

  // Zoom and Pan State
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Feedback State
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  useEffect(() => {
    // Check if feedback already exists for this scan
    const savedFeedback = localStorage.getItem('retina_feedback');
    if (savedFeedback) {
      const allFeedback: Feedback[] = JSON.parse(savedFeedback);
      const existing = allFeedback.find(f => f.scanId === patientDetails.scanId);
      if (existing) {
        setRating(existing.rating);
        setComment(existing.comment);
        setFeedbackSubmitted(true);
      }
    }
  }, [patientDetails.scanId]);

  const handleFeedbackSubmit = () => {
    if (rating === 0) return;

    const newFeedback: Feedback = {
      scanId: patientDetails.scanId,
      rating,
      comment,
      timestamp: Date.now()
    };

    const savedFeedback = localStorage.getItem('retina_feedback');
    const allFeedback: Feedback[] = savedFeedback ? JSON.parse(savedFeedback) : [];
    
    // Remove existing if any (update)
    const filtered = allFeedback.filter(f => f.scanId !== patientDetails.scanId);
    
    localStorage.setItem('retina_feedback', JSON.stringify([...filtered, newFeedback]));
    setFeedbackSubmitted(true);
    alert("Thank you for your feedback!");
  };

  const getJetColor = (v: number) => {
    let r = 0, g = 0, b = 0;
    // Clamp v between 0 and 1
    v = Math.max(0, Math.min(1, v));

    if (v < 0.25) {
      r = 0;
      g = 4 * v * 255;
      b = 255;
    } else if (v < 0.5) {
      r = 0;
      g = 255;
      b = 255 - 4 * (v - 0.25) * 255;
    } else if (v < 0.75) {
      r = 4 * (v - 0.5) * 255;
      g = 255;
      b = 0;
    } else {
      r = 255;
      g = 255 - 4 * (v - 0.75) * 255;
      b = 0;
    }
    return [Math.round(r), Math.round(g), Math.round(b)];
  };

  const getFindingExplanation = (text: string): string => {
    const t = text.toLowerCase();
    if (t.includes('microaneurysm')) return "Tiny bulges in retinal blood vessels, often the first sign of diabetic retinopathy. They appear as small red dots.";
    if (t.includes('hemorrhage')) return "Leakage of blood into the retina. Dot/blot hemorrhages are deeper; flame hemorrhages are superficial.";
    if (t.includes('hard exudate') || (t.includes('exudate') && !t.includes('soft'))) return "Yellow lipid deposits leaking from damaged vessels, often indicating retinal edema and vessel leakage.";
    if (t.includes('cotton') || t.includes('wool') || t.includes('soft exudate')) return "Fluffy white patches (Cotton Wool Spots) indicating areas where nerve fibers have been damaged by lack of blood supply (ischemia).";
    if (t.includes('edema') || t.includes('swelling') || t.includes('thickening')) return "Fluid accumulation within the retina, potentially threatening central vision if near the macula.";
    if (t.includes('neovascularization') || t.includes('new vessel')) return "Growth of abnormal, fragile new blood vessels, characteristic of Proliferative Diabetic Retinopathy (PDR).";
    if (t.includes('venous') || t.includes('beading')) return "Irregular changes in the width of retinal veins (resembling beads on a string), a sign of significant ischemia.";
    if (t.includes('drusen')) return "Yellow deposits under the retina, commonly associated with Age-related Macular Degeneration (AMD) rather than DR.";
    if (t.includes('tortuosity')) return "Abnormal twisting or curling of the retinal blood vessels.";
    return "A specific pathological change in the retinal structure identified during the AI analysis.";
  };

  const generateReportMessage = () => {
    const message = `
*${t('appTitle')} - ${t('latestReport')}*
--------------------
*${t('patientRecords')}:* ${patientDetails.name}
*ID:* ${patientDetails.id}
*Scan Ref:* ${patientDetails.scanId}
*Date:* ${new Date().toLocaleDateString()}

*${t('diagnosis')} Summary:*
• *Detection:* ${result.detection}
• *Severity:* ${result.severity}
• *Health Score:* ${result.healthScore}/100

*Key Findings:*
${result.keyFindings.map(f => `• ${f}`).join('\n')}

*Recommendation:*
${result.recommendation}

_${t('disclaimerText')}_
    `.trim();
    return encodeURIComponent(message);
  };

  const handleWhatsApp = () => {
    const message = generateReportMessage();
    const phone = patientDetails.phone ? patientDetails.phone.replace(/\D/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${message}` : `https://wa.me/?text=${message}`;
    window.open(url, '_blank');
  };

  const handleSMS = () => {
    const message = generateReportMessage();
    const phone = patientDetails.phone ? patientDetails.phone.replace(/\D/g, '') : '';
    const url = `sms:${phone}?body=${message}`;
    const link = document.createElement('a');
    link.href = url;
    link.click();
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`${t('appTitle')} Report - ${patientDetails.name} (${patientDetails.scanId})`);
    const body = generateReportMessage();
    const email = patientDetails.email || '';
    const url = `mailto:${email}?subject=${subject}&body=${body}`;
    const link = document.createElement('a');
    link.href = url;
    link.click();
  };

  const handleShare = async () => {
    const shareData = {
      title: `${t('appTitle')} Report - ${patientDetails.id}`,
      text: decodeURIComponent(generateReportMessage())
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareData.text);
      alert('Report summary copied to clipboard.');
    }
  };

  const handleExportPDF = () => {
    if (isGeneratingPDF) return;
    setIsGeneratingPDF(true);

    const element = document.getElementById('printable-report');
    if (!element) {
      setIsGeneratingPDF(false);
      return;
    }

    const opt = {
      margin: 5,
      filename: `Netra_Vision_Report_${patientDetails.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Dynamically load html2pdf.js
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    script.onload = () => {
      // @ts-ignore
      window.html2pdf().set(opt).from(element).save().then(() => {
        setIsGeneratingPDF(false);
      });
    };
    script.onerror = () => {
       alert("Failed to load PDF generator. Please try again.");
       setIsGeneratingPDF(false);
    }
    document.body.appendChild(script);
  };

  useEffect(() => {
    // Generate the heatmap only once when the component mounts or image changes
    if (!imagePreview) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      // Process at a lower resolution to simulate CNN feature map resizing
      const w = 64; 
      const h = 64;
      
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw original image to small canvas
      ctx.drawImage(img, 0, 0, w, h);
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;

      // 1. Calculate average color of the retina to find deviations
      let rSum = 0, gSum = 0, bSum = 0;
      for (let i = 0; i < data.length; i += 4) {
        rSum += data[i];
        gSum += data[i + 1];
        bSum += data[i + 2];
      }
      const pCount = data.length / 4;
      const avgR = rSum / pCount;
      const avgG = gSum / pCount;
      const avgB = bSum / pCount;

      // 2. Create heatmap data based on color distance/saliency
      const heatData = new Uint8ClampedArray(data.length);
      const intensities = new Float32Array(w * h);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Simple saliency heuristic
        const dist = Math.sqrt(
          Math.pow(r - avgR, 2) + 
          Math.pow(g - avgG, 2) + 
          Math.pow(b - avgB, 2)
        );

        const intensity = Math.min(1, dist / 110); 
        intensities[i/4] = intensity;

        const [hr, hg, hb] = getJetColor(intensity);
        
        heatData[i] = hr;
        heatData[i + 1] = hg;
        heatData[i + 2] = hb;
        heatData[i + 3] = 180; // Alpha
      }

      // Store data for interactive tooltips
      analysisDataRef.current = { width: w, height: h, data: data, intensities };

      // 3. Put heatmap data back
      const heatImageData = new ImageData(heatData, w, h);
      ctx.putImageData(heatImageData, 0, 0);

      // 4. Create a new canvas to upscale and blur
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = img.width;
      finalCanvas.height = img.height;
      const finalCtx = finalCanvas.getContext('2d');
      if (finalCtx) {
        finalCtx.filter = 'blur(15px)';
        finalCtx.drawImage(canvas, 0, 0, finalCanvas.width, finalCanvas.height);
        setHeatmapOverlay(finalCanvas.toDataURL());
      }
    };
    img.src = imagePreview;
  }, [imagePreview]);

  // --- Zoom & Pan Handlers ---

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => {
      const newZoom = direction === 'in' ? prev + 0.5 : prev - 0.5;
      const clampedZoom = Math.min(Math.max(1, newZoom), 5); // Limits 1x to 5x
      
      // Reset pan if we zoom out to 1x
      if (clampedZoom === 1) setPanPosition({ x: 0, y: 0 });
      
      return clampedZoom;
    });
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanPosition({ x: 0, y: 0 });
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panPosition.x, y: e.clientY - panPosition.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (zoomLevel > 1 && e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - panPosition.x, y: e.touches[0].clientY - panPosition.y });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // --- Tooltip & Interaction Logic ---

  const updateTooltip = (rect: DOMRect, clientX: number, clientY: number) => {
    if (!analysisDataRef.current) return;
    
    // Calculate position relative to container
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;

    // Adjust for Zoom and Pan
    // Logic: (ScreenPos - PanOffset) / ZoomScale
    const x = (rawX - panPosition.x) / zoomLevel;
    const y = (rawY - panPosition.y) / zoomLevel;

    // Map mapped mouse position to the low-res analysis grid
    const { width, height, data, intensities } = analysisDataRef.current;
    
    // Check if bounds are within the actual image (considering the image might be centered/contained)
    // For simplicity, we assume the image fills the container in the coordinate space
    const gridX = Math.floor((x / rect.width) * width);
    const gridY = Math.floor((y / rect.height) * height);

    if (gridX < 0 || gridX >= width || gridY < 0 || gridY >= height) {
      setTooltip(prev => ({ ...prev, visible: false }));
      return;
    }

    const index = gridY * width + gridX;
    const intensity = intensities[index];

    // Only show tooltip for "hot" regions
    if (intensity > 0.6) {
      const pixelIndex = index * 4;
      const r = data[pixelIndex];
      const g = data[pixelIndex + 1];
      const b = data[pixelIndex + 2];
      const brightness = (r + g + b) / 3;

      let label = "High Attention Region";
      
      // Basic heuristics to guess pathology based on color underlying the heatmap
      if (brightness > 180) {
           // Bright spots are usually Exudates or Optic Disc
           if (result.keyFindings.some(f => f.toLowerCase().includes('exudate'))) {
               label = "Hard Exudate / CWS";
           } else {
               label = "Optic Disc / Bright Lesion";
           }
      } else if (r > g * 1.2 && r > b * 1.2 && brightness < 150) {
           // Dark red spots are usually Hemorrhages
           if (result.keyFindings.some(f => f.toLowerCase().includes('hemorrhage'))) {
               label = "Hemorrhage / Microaneurysm";
           } else {
               label = "Vascular Anomaly";
           }
      }

      // Display tooltip at the actual mouse position (rawX, rawY) inside container
      setTooltip({ x: rawX, y: rawY, text: label, visible: true });
    } else {
      setTooltip(prev => ({ ...prev, visible: false }));
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      e.preventDefault();
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      setPanPosition({ x: newX, y: newY });
      setTooltip(prev => ({ ...prev, visible: false })); // Hide tooltip while panning
    } else {
      if (activeTab !== 'heatmap') return;
      const rect = e.currentTarget.getBoundingClientRect();
      updateTooltip(rect, e.clientX, e.clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDragging && e.touches.length === 1) {
      // e.preventDefault(); // Prevent scrolling while panning
      const touch = e.touches[0];
      const newX = touch.clientX - dragStart.x;
      const newY = touch.clientY - dragStart.y;
      setPanPosition({ x: newX, y: newY });
      setTooltip(prev => ({ ...prev, visible: false }));
    } else if (!isDragging && activeTab === 'heatmap') {
      const rect = e.currentTarget.getBoundingClientRect();
      const touch = e.touches[0];
      updateTooltip(rect, touch.clientX, touch.clientY);
    }
  }

  const downloadCurrentView = () => {
    const link = document.createElement('a');
    link.download = `retinavision-analysis-${activeTab}-${new Date().toISOString().split('T')[0]}.png`;

    if (activeTab === 'heatmap' && heatmapOverlay) {
      // Create a canvas to composite the base image and the heatmap overlay
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const baseImg = new Image();
      const overlayImg = new Image();
      
      baseImg.crossOrigin = 'anonymous';
      overlayImg.crossOrigin = 'anonymous';

      baseImg.onload = () => {
        canvas.width = baseImg.width;
        canvas.height = baseImg.height;
        if (!ctx) return;
        
        // Draw the base image (using enhanced preview as base for heatmap)
        ctx.drawImage(baseImg, 0, 0);
        
        overlayImg.onload = () => {
          // Replicate the CSS effects: mix-blend-screen and opacity 0.7
          ctx.globalAlpha = 0.7;
          ctx.globalCompositeOperation = 'screen';
          ctx.drawImage(overlayImg, 0, 0, baseImg.width, baseImg.height);
          
          link.href = canvas.toDataURL('image/png');
          link.click();
        };
        overlayImg.src = heatmapOverlay;
      };
      baseImg.src = imagePreview; 
    } else {
      // Direct download for Original and Enhanced views
      link.href = activeTab === 'original' ? originalImage : imagePreview;
      link.click();
    }
  };

  return (
    <div id="printable-report" className="space-y-8 animate-in fade-in duration-700">
      {/* ... (styles) ... */}
      
      {/* Top Header - Health Status */}
      {/* ... */}

      {/* Patient Information Section */}
      <div className={`rounded-[2rem] p-8 border shadow-sm ${
        isHighContrast 
          ? 'bg-white border-black' 
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'
      } print:border-black print:bg-white`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-8">
              <div className="col-span-1 space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-widest opacity-70 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Patient Name</label>
                  <div className={`font-bold text-xl leading-tight ${isHighContrast ? 'text-black' : 'text-slate-900 dark:text-white'}`}>{patientDetails.name}</div>
              </div>
              <div className="col-span-1 space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-widest opacity-70 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Patient ID</label>
                  <div className={`font-mono font-bold text-xl leading-tight ${isHighContrast ? 'text-black' : 'text-slate-900 dark:text-white'}`}>{patientDetails.id}</div>
              </div>
              <div className="col-span-1 space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-widest opacity-70 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Age</label>
                  <div className={`font-bold text-xl leading-tight ${isHighContrast ? 'text-black' : 'text-slate-900 dark:text-white'}`}>{patientDetails.age}</div>
              </div>
              <div className="col-span-1 space-y-2">
                  <label className={`text-[10px] font-bold uppercase tracking-widest opacity-70 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Gender</label>
                  <div className={`font-bold text-xl leading-tight ${isHighContrast ? 'text-black' : 'text-slate-900 dark:text-white'}`}>{patientDetails.gender}</div>
              </div>
              {patientDetails.phone && (
                <div className="col-span-2 md:col-span-2 space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-widest opacity-70 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Phone</label>
                    <div className={`font-mono font-bold text-xl leading-tight ${isHighContrast ? 'text-black' : 'text-slate-900 dark:text-white'}`}>{patientDetails.phone}</div>
                </div>
              )}
              {patientDetails.email && (
                <div className="col-span-2 md:col-span-2 space-y-2">
                    <label className={`text-[10px] font-bold uppercase tracking-widest opacity-70 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Email</label>
                    <div className={`font-mono font-bold text-xl leading-tight break-all ${isHighContrast ? 'text-black' : 'text-slate-900 dark:text-white'}`}>{patientDetails.email}</div>
                </div>
              )}
          </div>
      </div>

      {/* Send Report Section - Hidden in Print */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <button 
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-[#25D366] text-white font-bold shadow-lg hover:bg-[#128C7E] transition-all active:scale-95"
        >
          <i className="fab fa-whatsapp text-2xl"></i>
          <span>WhatsApp</span>
        </button>
        <button 
          onClick={handleSMS}
          className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-blue-500 text-white font-bold shadow-lg hover:bg-blue-600 transition-all active:scale-95"
        >
          <i className="fas fa-sms text-2xl"></i>
          <span>SMS</span>
        </button>
        <button 
          onClick={handleEmail}
          className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-700 text-white font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95"
        >
          <i className="fas fa-envelope text-2xl"></i>
          <span>Email</span>
        </button>
        <button 
          onClick={handleShare}
          className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
        >
          <i className="fas fa-share-alt text-2xl"></i>
          <span>Share</span>
        </button>
      </div>

      {/* Numerical Score Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ScoreGauge label="Overall Health" value={result.healthScore} color="text-emerald-500" icon="fa-heart-pulse" isHighContrast={isHighContrast} />
        <ScoreGauge label="Severity Index" value={result.severityIndex} color="text-amber-500" icon="fa-triangle-exclamation" isHighContrast={isHighContrast} />
        <ScoreGauge label="Progression Risk" value={result.progressionRisk} color="text-rose-500" icon="fa-chart-line" isHighContrast={isHighContrast} />
        <ScoreGauge label="Scan Confidence" value={result.confidenceScore} color="text-blue-500" icon="fa-check-double" isHighContrast={isHighContrast} />
      </div>

      {/* Main Analysis Content */}
      <div className={`rounded-[2.5rem] overflow-hidden shadow-2xl border ${isHighContrast ? 'bg-white border-black' : 'bg-slate-900 dark:bg-slate-950 border-slate-800 dark:border-slate-800'} print:border-none print:shadow-none print:bg-white`}>
        <div className="grid grid-cols-1 lg:grid-cols-12">
          
          {/* Visual Evidence Section */}
          <div className={`lg:col-span-5 p-8 flex flex-col border-r ${isHighContrast ? 'bg-gray-50 border-black' : 'bg-black/40 border-slate-800'} print:bg-white print:border-r print:border-slate-200`}>
            {/* View Toggle Controls & Download - HIDDEN IN PRINT */}
            <div className="mb-8 flex flex-col gap-4 print:hidden" data-html2canvas-ignore="true">
               <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'original', label: 'Original', icon: 'fa-camera' },
                  { id: 'enhanced', label: 'CLAHE', icon: 'fa-wand-magic-sparkles' },
                  { id: 'heatmap', label: 'Heatmap', icon: 'fa-layer-group' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`
                      relative flex flex-col items-center justify-center py-4 px-2 rounded-xl transition-all duration-200 border-2
                      ${activeTab === tab.id 
                        ? (isHighContrast 
                            ? 'bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-[-2px] translate-y-[-2px]' 
                            : 'bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.5)] scale-105 z-10') 
                        : (isHighContrast 
                            ? 'bg-white text-black border-black hover:bg-gray-100' 
                            : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-600')
                      }
                    `}
                    aria-pressed={activeTab === tab.id}
                    aria-label={`Switch to ${tab.label} view`}
                  >
                    <i className={`fas ${tab.icon} text-lg mb-2`}></i>
                    <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                  </button>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={downloadCurrentView}
                  className={`
                    flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 transition-all border-2
                    ${isHighContrast 
                      ? 'bg-white text-black border-black hover:bg-black hover:text-white' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-500'
                    }
                  `}
                  title="Download Current View"
                >
                  <i className="fas fa-download"></i>
                  <span>Download</span>
                </button>

                <button 
                  onClick={handleShare}
                  className={`
                    flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 transition-all border-2
                    ${isHighContrast 
                      ? 'bg-white text-black border-black hover:bg-black hover:text-white' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-500'
                    }
                  `}
                  title="Share Report"
                >
                  <i className="fas fa-share-alt"></i>
                  <span>Share</span>
                </button>

                <button 
                  onClick={handleExportPDF}
                  disabled={isGeneratingPDF}
                  className={`
                    flex-1 py-4 rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 transition-all border-2
                    ${isHighContrast 
                      ? 'bg-white text-black border-black hover:bg-black hover:text-white' 
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-500'
                    }
                  `}
                  title="Export Report as PDF"
                >
                  {isGeneratingPDF ? (
                    <i className="fas fa-spinner animate-spin"></i>
                  ) : (
                    <i className="fas fa-file-pdf"></i>
                  )}
                  <span>PDF</span>
                </button>
              </div>
            </div>

            <div 
              ref={imageContainerRef}
              className={`relative group flex-grow flex items-center rounded-2xl overflow-hidden border min-h-[350px] ${zoomLevel > 1 ? 'cursor-grab active:cursor-grabbing' : 'cursor-crosshair'} touch-none ${isHighContrast ? 'bg-black border-black' : 'bg-black border-slate-700'} print:border-slate-300 print:bg-white`}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => {
                setTooltip(prev => ({ ...prev, visible: false }));
                setIsDragging(false);
              }}
              onTouchMove={handleTouchMove}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Zoom Controls */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2 print:hidden" data-html2canvas-ignore="true">
                <button 
                  onClick={() => handleZoom('in')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isHighContrast ? 'bg-white text-black border border-black' : 'bg-slate-800/90 text-white hover:bg-blue-600'}`}
                  aria-label="Zoom In"
                >
                  <i className="fas fa-plus text-xs"></i>
                </button>
                <button 
                  onClick={() => handleZoom('out')}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isHighContrast ? 'bg-white text-black border border-black' : 'bg-slate-800/90 text-white hover:bg-blue-600'}`}
                  aria-label="Zoom Out"
                >
                  <i className="fas fa-minus text-xs"></i>
                </button>
                <button 
                  onClick={handleReset}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-transform active:scale-95 ${isHighContrast ? 'bg-white text-black border border-black' : 'bg-slate-800/90 text-white hover:bg-blue-600'}`}
                  aria-label="Reset View"
                >
                  <i className="fas fa-sync-alt text-xs"></i>
                </button>
              </div>

              {/* Transformable Content Wrapper */}
              <div 
                className="w-full h-full relative transition-transform duration-75 ease-linear origin-center"
                style={{
                  transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomLevel})`
                }}
              >
                {/* Base Layer */}
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                  <img 
                    src={activeTab === 'original' ? originalImage : imagePreview} 
                    alt="Retinal Scan" 
                    className="w-full h-full object-contain pointer-events-none" 
                  />
                </div>
                
                {/* Heatmap Overlay */}
                {activeTab === 'heatmap' && heatmapOverlay && (
                  <div className="absolute inset-0 w-full h-full animate-in fade-in duration-500 pointer-events-none">
                    <img 
                      src={heatmapOverlay} 
                      alt="Grad-CAM Overlay" 
                      className="w-full h-full object-contain mix-blend-screen opacity-70" 
                    />
                  </div>
                )}
              </div>
                  
              {/* Interactive Tooltip - Positioned absolutely within container but logic handles visual offset */}
              {tooltip.visible && !isDragging && (
                <div 
                  className={`absolute z-50 pointer-events-none text-[10px] font-bold uppercase tracking-wider px-3 py-2 rounded-lg border shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full mb-3 ${isHighContrast ? 'bg-black text-white border-black' : 'bg-slate-900/95 text-white border-slate-500/50'}`}
                  style={{ top: tooltip.y, left: tooltip.x }}
                >
                  <div className="flex items-center space-x-2 whitespace-nowrap">
                    <span className="relative flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isHighContrast ? 'bg-white' : 'bg-rose-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${isHighContrast ? 'bg-white' : 'bg-rose-500'}`}></span>
                    </span>
                    <span>{tooltip.text}</span>
                  </div>
                  <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 border-r border-b rotate-45 ${isHighContrast ? 'bg-black border-black' : 'bg-slate-900/95 border-slate-500/50'}`}></div>
                </div>
              )}

              {/* Desktop Legend (Hidden on Mobile) */}
              <div className={`hidden md:block absolute top-4 right-4 p-4 rounded-xl border shadow-xl pointer-events-none z-20 ${isHighContrast ? 'bg-white border-black opacity-90' : 'bg-slate-900/90 backdrop-blur-md border-slate-700'} print:hidden`}>
                <h4 className={`text-[10px] font-black uppercase tracking-widest mb-3 text-center ${isHighContrast ? 'text-black' : 'text-slate-300'}`}>Relevance</h4>
                <div className="flex items-stretch space-x-3 h-32">
                  <div className={`w-3 rounded-full shadow-inner ring-1 ${isHighContrast ? 'bg-gradient-to-b from-black via-gray-500 to-white ring-black' : 'bg-gradient-to-b from-red-500 via-yellow-400 via-green-500 via-cyan-400 to-blue-600 ring-slate-700/50'}`}></div>
                  <div className="flex flex-col justify-between py-0.5">
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold leading-none ${isHighContrast ? 'text-black' : 'text-white'}`}>High</span>
                      <span className={`text-[8px] font-medium ${isHighContrast ? 'text-black' : 'text-rose-400'}`}>Pathology</span>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold leading-none ${isHighContrast ? 'text-gray-600' : 'text-slate-300'}`}>Med</span>
                      <span className={`text-[8px] font-medium ${isHighContrast ? 'text-gray-600' : 'text-amber-400'}`}>Structure</span>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-bold leading-none ${isHighContrast ? 'text-gray-400' : 'text-slate-500'}`}>Low</span>
                      <span className={`text-[8px] font-medium ${isHighContrast ? 'text-gray-400' : 'text-slate-600'}`}>Healthy</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`absolute bottom-4 left-4 right-4 backdrop-blur-md p-3 rounded-xl border pointer-events-none z-20 ${isHighContrast ? 'bg-white/95 border-black' : 'bg-slate-900/90 border-slate-700'} print:hidden`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isHighContrast ? 'text-black' : 'text-slate-400'}`}>Visual Interpretation</p>
                <p className={`text-xs ${isHighContrast ? 'text-black' : 'text-slate-200'}`}>
                  {activeTab === 'original' && "Raw fundus image showing optic disc and macula with standard illumination."}
                  {activeTab === 'enhanced' && "Contrast Limited Adaptive Histogram Equalization (CLAHE) applied to highlight vasculature and microaneurysms."}
                  {activeTab === 'heatmap' && "Grad-CAM Attention Map: Hover over red/yellow regions to identify specific pathological features."}
                </p>
              </div>
            </div>

            {/* Mobile Legend (Shown below image) */}
            {activeTab === 'heatmap' && (
              <div className={`md:hidden mt-4 p-4 rounded-xl border shadow-sm ${isHighContrast ? 'bg-white border-black' : 'bg-slate-800/50 dark:bg-slate-900 border-slate-700'} print:hidden`}>
                  <div className="w-full">
                    <h4 className={`text-[10px] font-black uppercase tracking-widest mb-2 text-center ${isHighContrast ? 'text-black' : 'text-slate-400'}`}>Pathology Relevance</h4>
                    <div className="relative h-4 rounded-full w-full mb-1">
                       <div className={`absolute inset-0 rounded-full ${isHighContrast ? 'bg-gradient-to-r from-white via-gray-500 to-black' : 'bg-gradient-to-r from-blue-600 via-cyan-400 via-green-500 via-yellow-400 to-red-500'}`}></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-bold uppercase tracking-wider">
                       <span className={isHighContrast ? 'text-gray-500' : 'text-slate-500'}>Healthy (Low)</span>
                       <span className={isHighContrast ? 'text-black' : 'text-rose-400'}>Pathology (High)</span>
                    </div>
                  </div>
              </div>
            )}
            
            <div className="mt-6 space-y-4">
               <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'} print:text-black`}>Hemorrhage Risk</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-24 h-1.5 rounded-full overflow-hidden ${isHighContrast ? 'bg-gray-300' : 'bg-slate-800 dark:bg-slate-700'} print:bg-slate-200`}>
                      <div className={`h-full ${isHighContrast ? 'bg-black' : 'bg-rose-500'}`} style={{ width: `${result.clinicalMetrics.hemorrhageRisk}%` }}></div>
                    </div>
                    <span className={`text-xs font-black w-8 text-right ${isHighContrast ? 'text-black' : 'text-rose-400'} print:text-black`}>{result.clinicalMetrics.hemorrhageRisk}%</span>
                  </div>
               </div>
               <div className="flex justify-between items-center">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'} print:text-black`}>Exudate Density</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-24 h-1.5 rounded-full overflow-hidden ${isHighContrast ? 'bg-gray-300' : 'bg-slate-800 dark:bg-slate-700'} print:bg-slate-200`}>
                      <div className={`h-full ${isHighContrast ? 'bg-black' : 'bg-amber-500'}`} style={{ width: `${result.clinicalMetrics.exudateDensity}%` }}></div>
                    </div>
                    <span className={`text-xs font-black w-8 text-right ${isHighContrast ? 'text-black' : 'text-amber-400'} print:text-black`}>{result.clinicalMetrics.exudateDensity}%</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Clinical Findings Section */}
          <div className="lg:col-span-7 p-10 space-y-10">
            <section>
              <h3 className={`text-xs font-bold uppercase tracking-[0.3em] mb-4 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'} print:text-slate-600`}>Pathology Narrative</h3>
              <div className={`p-6 rounded-2xl border ${isHighContrast ? 'bg-white border-black' : 'bg-slate-800/30 dark:bg-slate-900/50 border-slate-800 dark:border-slate-800'} print:border-slate-200 print:bg-white`}>
                <p className={`text-lg font-medium leading-relaxed italic ${isHighContrast ? 'text-black' : 'text-slate-300 dark:text-slate-300'} print:text-black`}>
                  "{result.detailedPathology}"
                </p>
              </div>
            </section>

            {/* Educational Info Section */}
            <section className={`border rounded-2xl p-6 ${isHighContrast ? 'bg-white border-black' : 'bg-blue-950/20 dark:bg-blue-900/10 border-blue-900/30'} print:border-slate-200 print:bg-white`}>
              <div className="flex items-center space-x-3 mb-4">
                <i className={`fas fa-book-medical ${isHighContrast ? 'text-black' : 'text-blue-500'} print:text-black`}></i>
                <h3 className={`text-xs font-bold uppercase tracking-[0.3em] ${isHighContrast ? 'text-black' : 'text-blue-400'} print:text-black`}>About Diabetic Retinopathy</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                <div>
                   <h4 className={`font-bold mb-2 ${isHighContrast ? 'text-black underline' : 'text-slate-300 dark:text-slate-200'} print:text-black`}>Stages & Progression</h4>
                   <ul className={`space-y-3 ${isHighContrast ? 'text-black' : 'text-slate-400 dark:text-slate-400'} print:text-slate-700`}>
                      <li className="flex items-start">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 mr-2 flex-shrink-0 ${isHighContrast ? 'bg-black' : 'bg-green-500'}`}></span>
                        <span><strong className={isHighContrast ? 'text-black' : 'text-slate-300 dark:text-slate-300'} print:text-black>Mild NPDR:</strong> Microaneurysms occur. Earliest stage.</span>
                      </li>
                      <li className="flex items-start">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 mr-2 flex-shrink-0 ${isHighContrast ? 'bg-black' : 'bg-yellow-500'}`}></span>
                        <span><strong className={isHighContrast ? 'text-black' : 'text-slate-300 dark:text-slate-300'} print:text-black>Moderate NPDR:</strong> Blood vessels swell and distort.</span>
                      </li>
                      <li className="flex items-start">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 mr-2 flex-shrink-0 ${isHighContrast ? 'bg-black' : 'bg-orange-500'}`}></span>
                        <span><strong className={isHighContrast ? 'text-black' : 'text-slate-300 dark:text-slate-300'} print:text-black>Severe NPDR:</strong> Blocked vessels, retina deprived of blood.</span>
                      </li>
                      <li className="flex items-start">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 mr-2 flex-shrink-0 ${isHighContrast ? 'bg-black' : 'bg-red-500'}`}></span>
                        <span><strong className={isHighContrast ? 'text-black' : 'text-slate-300 dark:text-slate-300'} print:text-black>Proliferative DR:</strong> Growth of fragile new blood vessels.</span>
                      </li>
                   </ul>
                </div>
                <div className="space-y-6">
                    <div>
                        <h4 className={`font-bold mb-2 ${isHighContrast ? 'text-black underline' : 'text-slate-300 dark:text-slate-200'} print:text-black`}>Common Symptoms</h4>
                        <p className={`leading-relaxed mb-2 ${isHighContrast ? 'text-black' : 'text-slate-400 dark:text-slate-400'} print:text-slate-700`}>
                            Symptoms often don't appear in early stages. As it progresses:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {['Spots/Floaters', 'Blurred Vision', 'Fluctuating Vision', 'Dark Areas', 'Vision Loss'].map(s => (
                                <span key={s} className={`px-2 py-1 rounded text-xs font-medium border ${isHighContrast ? 'bg-white text-black border-black' : 'bg-slate-800 dark:bg-slate-800 text-slate-400 dark:text-slate-400 border-slate-700'} print:border-slate-300 print:text-black print:bg-white`}>{s}</span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className={`font-bold mb-2 ${isHighContrast ? 'text-black underline' : 'text-slate-300 dark:text-slate-200'} print:text-black`}>Pathophysiology</h4>
                         <p className={`leading-relaxed ${isHighContrast ? 'text-black' : 'text-slate-400 dark:text-slate-400'} print:text-slate-700`}>
                            Chronic hyperglycemia damages retinal capillaries (microangiopathy), leading to ischemia and edema.
                        </p>
                    </div>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <section>
                <h3 className={`text-xs font-bold uppercase tracking-[0.3em] mb-6 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'} print:text-slate-600`}>Discrete Findings</h3>
                <ul className="space-y-4">
                  {result.keyFindings.map((finding, idx) => (
                    <li key={idx} className={`flex flex-col group ${isHighContrast ? 'text-black' : 'text-slate-400 dark:text-slate-300'} print:text-black`}>
                      <div className="flex items-start cursor-pointer" onClick={() => setExpandedFinding(expandedFinding === idx ? null : idx)}>
                        <div className={`mt-1 mr-4 p-1.5 rounded-lg transition-colors ${isHighContrast ? 'bg-black text-white' : 'bg-slate-800 dark:bg-slate-800 text-slate-500 group-hover:bg-blue-600/20 group-hover:text-blue-400'} print:bg-slate-200 print:text-black`}>
                          <i className="fas fa-microscope text-xs"></i>
                        </div>
                        <span className="text-sm font-medium leading-tight flex-grow">{finding}</span>
                        <button className="ml-2 p-1.5 focus:outline-none rounded-full hover:bg-slate-200/20 dark:hover:bg-slate-700/50 transition-colors">
                          <i className={`fas ${expandedFinding === idx ? 'fa-chevron-up' : 'fa-info-circle'} text-xs opacity-70 hover:opacity-100 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}></i>
                        </button>
                      </div>
                      {expandedFinding === idx && (
                        <div className={`mt-3 ml-11 p-3 rounded-xl text-xs leading-relaxed animate-in fade-in slide-in-from-top-2 ${isHighContrast ? 'bg-gray-100 text-black' : 'bg-slate-800/50 text-slate-400'} print:bg-slate-100 print:text-black`}>
                          {getFindingExplanation(finding)}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Feedback Section */}
              <section className="print:hidden">
                <h3 className={`text-xs font-bold uppercase tracking-[0.3em] mb-6 ${isHighContrast ? 'text-black' : 'text-slate-500 dark:text-slate-400'}`}>Diagnostic Feedback</h3>
                <div className={`p-6 rounded-2xl border ${isHighContrast ? 'bg-white border-black' : 'bg-slate-800/30 dark:bg-slate-900/50 border-slate-800 dark:border-slate-800'}`}>
                  <p className={`text-sm mb-4 font-medium ${isHighContrast ? 'text-black' : 'text-slate-400'}`}>
                    How accurate is this diagnosis? Your feedback helps improve our AI models.
                  </p>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => !feedbackSubmitted && setRating(star)}
                        disabled={feedbackSubmitted}
                        className={`text-2xl focus:outline-none transition-transform active:scale-110 ${
                          star <= rating 
                            ? (isHighContrast ? 'text-black' : 'text-yellow-400') 
                            : (isHighContrast ? 'text-gray-300' : 'text-slate-600')
                        } ${feedbackSubmitted ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                      >
                        <i className="fas fa-star"></i>
                      </button>
                    ))}
                    <span className={`ml-2 text-xs font-bold uppercase tracking-wider ${isHighContrast ? 'text-black' : 'text-slate-500'}`}>
                      {rating > 0 ? ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1] : 'Rate Accuracy'}
                    </span>
                  </div>

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={feedbackSubmitted}
                    placeholder="Add clinical notes or comments (optional)..."
                    className={`w-full p-3 rounded-xl text-sm mb-4 outline-none border transition-all ${
                      isHighContrast 
                        ? 'bg-white border-black text-black placeholder-gray-500 focus:ring-2 focus:ring-black' 
                        : 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                    } ${feedbackSubmitted ? 'opacity-70' : ''}`}
                    rows={3}
                  />

                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={rating === 0 || feedbackSubmitted}
                    className={`
                      w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs transition-all
                      ${feedbackSubmitted
                        ? (isHighContrast ? 'bg-black text-white opacity-50 cursor-default' : 'bg-green-600 text-white cursor-default')
                        : (isHighContrast 
                            ? 'bg-black text-white hover:bg-gray-800' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed')
                      }
                    `}
                  >
                    {feedbackSubmitted ? (
                      <span><i className="fas fa-check mr-2"></i>Feedback Submitted</span>
                    ) : (
                      'Submit Feedback'
                    )}
                  </button>
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

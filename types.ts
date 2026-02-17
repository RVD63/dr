
export enum DRSeverity {
  NONE = 'No DR',
  MILD = 'Mild',
  MODERATE = 'Moderate',
  SEVERE = 'Severe',
  PROLIFERATIVE = 'Proliferative'
}

export type ViewType = 'home' | 'upload' | 'report' | 'dashboard' | 'video' | 'chat';
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isEmergency?: boolean;
}

export interface AnalysisResult {
  detection: string;
  severity: DRSeverity;
  keyFindings: string[];
  recommendation: string;
  detailedPathology: string;
  confidenceScore: number;
  severityIndex: number;
  healthScore: number;
  progressionRisk: number;
  clinicalMetrics: {
    microaneurysmsCount: string;
    hemorrhageRisk: number;
    exudateDensity: number;
    macularEdemaRisk: number;
  };
}

export interface VideoAnalysisResult {
  summary: string;
  findings: string[];
  drDetails: {
    detected: boolean;
    severity: string;
    evidence: string;
  };
  recommendations: string;
}

export interface HistoricalResult {
  id: string;
  timestamp: number;
  imagePreview: string;
  result: AnalysisResult;
}

export interface AnalysisState {
  view: ViewType;
  isLoading: boolean;
  isPreprocessing: boolean;
  result: AnalysisResult | null;
  videoResult: VideoAnalysisResult | null;
  error: string | null;
  imagePreview: string | null;
  videoPreview: string | null;
  originalImage: string | null;
  history: HistoricalResult[];
}

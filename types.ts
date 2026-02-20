
export enum DRSeverity {
  NONE = 'No DR',
  MILD = 'Mild',
  MODERATE = 'Moderate',
  SEVERE = 'Severe',
  PROLIFERATIVE = 'Proliferative'
}

export type ViewType = 'home' | 'upload' | 'report' | 'dashboard' | 'video' | 'chat' | 'generate';
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'kn';
export type AspectRatio = '1:1' | '2:3' | '3:2' | '3:4' | '4:3' | '9:16' | '16:9' | '21:9';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isEmergency?: boolean;
  sources?: { title: string; uri: string }[];
}

export interface PatientDetails {
  name: string;
  id: string;
  age: string;
  gender: string;
  scanId: string;
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
  patientDetails: PatientDetails;
}

export interface Feedback {
  scanId: string;
  rating: number;
  comment: string;
  timestamp: number;
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
  currentPatientDetails: PatientDetails | null;
}

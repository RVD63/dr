
export enum DRSeverity {
  NONE = 'No DR',
  MILD = 'Mild',
  MODERATE = 'Moderate',
  SEVERE = 'Severe',
  PROLIFERATIVE = 'Proliferative'
}

export type ViewType = 'home' | 'upload' | 'report' | 'dashboard';

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
  error: string | null;
  imagePreview: string | null;
  originalImage: string | null;
  history: HistoricalResult[];
}

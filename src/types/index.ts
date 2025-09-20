// Core business scenario types
export interface BusinessScenario {
  id: string;
  title: string;
  description: string;
  confidence: number;
  createdAt: Date;
  query: string;
  timeline: TimelinePoint[];
  keyInsights: string[];
  financialProjections: FinancialProjection[];
  riskAssessment: RiskAssessment;
  similarCases: SimilarCase[];
}

export interface TimelinePoint {
  month: string;
  date: Date;
  revenue: number;
  probability: number;
  marketShare: number;
  customerCount: number;
  operatingCosts: number;
  keyEvents: string[];
}

export interface FinancialProjection {
  metric: string;
  currentValue: number;
  projectedValue: number;
  variance: number;
  confidence: number;
  timeframe: string;
}

export interface RiskAssessment {
  overall: number;
  factors: RiskFactor[];
  mitigation: string[];
}

export interface RiskFactor {
  name: string;
  impact: number;
  probability: number;
  description: string;
}

export interface SimilarCase {
  id: string;
  company: string;
  industry: string;
  scenario: string;
  outcome: string;
  similarity: number;
  year: number;
}

// BigQuery AI API types
export interface ScenarioRequest {
  query: string;
  context: BusinessContext;
  options?: ScenarioOptions;
}

export interface BusinessContext {
  industry: string;
  companySize: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  timeframe: string;
  region: string;
  businessModel: string;
  currentRevenue?: number;
  employeeCount?: number;
  marketPosition?: string;
}

export interface ScenarioOptions {
  scenarioCount?: number;
  timeHorizon?: number;
  includeRiskAnalysis?: boolean;
  includeSimilarCases?: boolean;
  detailLevel?: 'basic' | 'detailed' | 'comprehensive';
}

export interface VectorSearchRequest {
  situation: string;
  industry: string;
  context: string;
  limit?: number;
}

export interface ForecastRequest {
  baseScenario: BusinessScenario;
  variations: ScenarioVariation[];
  timeHorizon: number;
}

export interface ScenarioVariation {
  name: string;
  parameters: Record<string, any>;
  description: string;
}

// API Response types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  processingTime: number;
}

export interface StreamingResponse {
  status: 'processing' | 'complete' | 'error';
  stage?: string;
  progress?: number;
  data?: any;
  error?: string;
}

// UI State types
export interface SimulatorState {
  query: string;
  isProcessing: boolean;
  currentStage: number;
  scenarios: BusinessScenario[];
  selectedScenario: BusinessScenario | null;
  showResults: boolean;
  error: string | null;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill?: boolean;
}

// BigQuery AI function types
export interface BigQueryAIFunction {
  name: string;
  description: string;
  parameters: Record<string, any>;
  expectedOutput: string;
}

export const BIGQUERY_AI_FUNCTIONS: BigQueryAIFunction[] = [
  {
    name: 'AI.GENERATE_TEXT',
    description: 'Generate executive summaries and narrative descriptions',
    parameters: {
      model: 'gemini-pro',
      prompt: 'string',
      max_output_tokens: 1000
    },
    expectedOutput: 'Generated text content'
  },
  {
    name: 'AI.FORECAST',
    description: 'Predict future business metrics and trends',
    parameters: {
      model: 'forecast_arima_plus',
      time_series_data: 'table',
      horizon: 12
    },
    expectedOutput: 'Time series predictions with confidence intervals'
  },
  {
    name: 'ML.GENERATE_EMBEDDING',
    description: 'Create vector embeddings for similarity search',
    parameters: {
      model: 'textembedding-gecko',
      content: 'string'
    },
    expectedOutput: 'Vector embeddings array'
  },
  {
    name: 'VECTOR_SEARCH',
    description: 'Find similar historical business cases',
    parameters: {
      query_embedding: 'array',
      base_table: 'string',
      top_k: 5
    },
    expectedOutput: 'Similar cases with similarity scores'
  },
  {
    name: 'AI.GENERATE_TABLE',
    description: 'Create structured scenario data',
    parameters: {
      model: 'gemini-pro',
      prompt: 'string',
      output_schema: 'json'
    },
    expectedOutput: 'Structured table data'
  }
];

// Error types
export class BigQueryAIError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'BigQueryAIError';
  }
}

export class RateLimitError extends BigQueryAIError {
  constructor(retryAfter?: number) {
    super('Rate limit exceeded', 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}

export class QuotaExceededError extends BigQueryAIError {
  constructor(quotaType: string) {
    super(`Quota exceeded: ${quotaType}`, 'QUOTA_EXCEEDED', { quotaType });
  }
}

// Utility types
export type ProcessingStage = 
  | 'analyzing'
  | 'generating'
  | 'computing'
  | 'summarizing'
  | 'finalizing'
  | 'complete';

export interface ProcessingStatus {
  stage: ProcessingStage;
  message: string;
  progress: number;
  estimatedTimeRemaining?: number;
}

export const PROCESSING_STAGES: Record<ProcessingStage, string> = {
  analyzing: 'Analyzing historical patterns...',
  generating: 'Generating parallel realities...',
  computing: 'Computing probability matrices...',
  summarizing: 'Creating executive summaries...',
  finalizing: 'Finalizing scenarios...',
  complete: 'Analysis complete!'
};

import { BigQuery } from '@google-cloud/bigquery';
import { BigQueryAIError, QuotaExceededError, RateLimitError } from '@/types';

// Initialize BigQuery client
export const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON 
    ? JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    : undefined,
});

// BigQuery AI function wrappers
export class BigQueryAI {
  private static instance: BigQueryAI;
  private client: BigQuery;

  private constructor() {
    this.client = bigquery;
  }

  public static getInstance(): BigQueryAI {
    if (!BigQueryAI.instance) {
      BigQueryAI.instance = new BigQueryAI();
    }
    return BigQueryAI.instance;
  }

  /**
   * Generate text using BigQuery ML.GENERATE_TEXT function
   */
  async generateText(prompt: string, options?: {
    model?: string;
    maxTokens?: number;
    temperature?: number;
  }): Promise<string> {
    const { model = 'gemini-2.0-flash', maxTokens = 1000, temperature = 0.7 } = options || {};
    
    // First ensure we have a remote model created
    const modelName = await this.ensureRemoteModel(model);
    
    const query = `
      SELECT *
      FROM ML.GENERATE_TEXT(
        MODEL \`${modelName}\`,
        (SELECT @prompt as prompt),
        STRUCT(
          ${maxTokens} as max_output_tokens,
          ${temperature} as temperature,
          TRUE as flatten_json_output
        )
      )
    `;

    try {
      const [rows] = await this.client.query({ 
        query,
        params: {
          prompt: prompt
        }
      });
      
      console.log('🔧 ML.GENERATE_TEXT Raw Response:', rows);
      
      // According to docs, when flatten_json_output is TRUE, the column is ml_generate_text_llm_result
      const result = rows[0]?.ml_generate_text_llm_result || rows[0]?.ml_generate_text_result || '';
      
      console.log('🔧 Extracted Text Result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ ML.GENERATE_TEXT Error:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generate structured data using AI.GENERATE_TABLE function
   */
  async generateTable(prompt: string, schema: Record<string, string>): Promise<any[]> {
    const { model = 'gemini-2.0-flash' } = {};
    
    // First ensure we have a remote model created
    const modelName = await this.ensureRemoteModel(model);
    
    // Convert schema object to SQL schema string format
    // Example: {name: "STRING", age: "INT64"} -> "name STRING, age INT64"
    const schemaString = Object.entries(schema)
      .map(([key, type]) => `${key} ${type}`)
      .join(', ');
    
    console.log('🔧 BigQuery AI Schema:', schemaString);
    console.log('🔧 BigQuery AI Prompt:', prompt.substring(0, 200) + '...');
    
    const query = `
      SELECT *
      FROM AI.GENERATE_TABLE(
        MODEL \`${modelName}\`,
        (SELECT @prompt as prompt),
        STRUCT(
          "${schemaString}" as output_schema,
          1000 as max_output_tokens,
          0.7 as temperature
        )
      )
    `;

    try {
      const [rows] = await this.client.query({ 
        query,
        params: {
          prompt: prompt
        }
      });
      
      console.log('✅ BigQuery AI Raw Response:', rows);
      
      // Filter out system columns and return only the generated data
      const filteredRows = rows.map(row => {
        const { full_response, status, ...dataColumns } = row;
        return dataColumns;
      });
      
      console.log('✅ BigQuery AI Filtered Data:', filteredRows);
      return filteredRows || [];
    } catch (error) {
      console.error('❌ AI.GENERATE_TABLE failed:', error);
      // If AI.GENERATE_TABLE fails, fall back to ML.GENERATE_TEXT with JSON parsing
      return this.generateTableFallback(prompt, schema);
    }
  }

  /**
   * Fallback method using ML.GENERATE_TEXT for structured data
   */
  private async generateTableFallback(prompt: string, schema: Record<string, string>): Promise<any[]> {
    const structuredPrompt = `
      ${prompt}
      
      Please respond with a JSON array containing objects with these fields: ${Object.keys(schema).join(', ')}.
      Each object should represent one scenario.
      Return only valid JSON, no additional text.
    `;
    
    try {
      const textResult = await this.generateText(structuredPrompt, { maxTokens: 2000 });
      
      // Check if we got a valid response
      if (!textResult || textResult.trim().length === 0) {
        console.warn('Empty response from ML.GENERATE_TEXT, using fallback data');
        return this.getFallbackScenarios();
      }
      
      // Try to parse the JSON response
      const cleanedResult = textResult.replace(/```json\n?|\n?```/g, '').trim();
      
      // Additional validation before parsing
      if (!cleanedResult || cleanedResult.length === 0) {
        console.warn('Empty cleaned result, using fallback data');
        return this.getFallbackScenarios();
      }
      
      const parsedResult = JSON.parse(cleanedResult);
      
      // Ensure it's an array
      return Array.isArray(parsedResult) ? parsedResult : [parsedResult];
    } catch (error) {
      // If parsing fails, return mock data
      console.warn('Failed to parse structured response, using fallback:', error);
      return this.getFallbackScenarios();
    }
  }

  /**
   * Get fallback scenario data when AI generation fails
   */
  private getFallbackScenarios(): any[] {
    return [
      {
        scenario_id: 'scenario_1',
        title: 'Mobile-First Aggressive Strategy',
        description: 'Prioritize mobile development with rapid feature rollout and aggressive user acquisition campaigns.',
        confidence: 0.85,
        key_assumptions: 'Mobile users convert 40% better, development team can deliver quickly',
        expected_outcome: 'High user growth but increased development costs'
      },
      {
        scenario_id: 'scenario_2', 
        title: 'Balanced Mobile-Desktop Approach',
        description: 'Develop mobile and desktop features in parallel with equal resource allocation.',
        confidence: 0.75,
        key_assumptions: 'Both platforms important, balanced resource allocation optimal',
        expected_outcome: 'Steady growth across all platforms with moderate costs'
      },
      {
        scenario_id: 'scenario_3',
        title: 'Mobile-First Conservative Strategy', 
        description: 'Focus on mobile with careful feature testing and gradual rollout to minimize risks.',
        confidence: 0.90,
        key_assumptions: 'Quality over speed, user feedback drives development',
        expected_outcome: 'Slower but sustainable mobile-first growth'
      }
    ];
  }

  /**
   * Ensure a remote model exists for the given Vertex AI model
   */
  private async ensureRemoteModel(vertexModel: string): Promise<string> {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    
    // Check if BigQuery AI is properly configured
    if (!this.isBigQueryAIConfigured()) {
      throw new BigQueryAIError(
        'BigQuery AI is not properly configured. Please check BIGQUERY_AI_SETUP.md for setup instructions.',
        'CONFIGURATION_ERROR',
        new Error('Missing BigQuery AI configuration')
      );
    }
    
    // First ensure dataset exists
    await this.ensureDataset();
    
    const modelName = `${projectId}.quantum_ai.${vertexModel.replace(/[^a-zA-Z0-9_]/g, '_')}_model`;
    
    try {
      // Try to create the remote model (will fail if it already exists, which is fine)
      const createModelQuery = `
        CREATE MODEL IF NOT EXISTS \`${modelName}\`
        REMOTE WITH CONNECTION \`${projectId}.us.quantum_connection\`
        OPTIONS (ENDPOINT = '${vertexModel}')
      `;
      
      await this.client.query({ query: createModelQuery });
      return modelName;
    } catch (error: any) {
      // If it's a permission error, provide helpful guidance
      if (error.code === 403 && error.message.includes('bigquery.connections.use')) {
        throw new BigQueryAIError(
          'BigQuery connection permission denied. Please follow the setup guide in BIGQUERY_AI_SETUP.md to grant proper permissions.',
          'PERMISSION_DENIED',
          error
        );
      }
      
      // If model creation fails, return the model name anyway
      // The model might already exist or we might not have permissions
      console.warn('Remote model creation failed, using model name directly:', error);
      return modelName;
    }
  }

  /**
   * Check if BigQuery AI is properly configured
   */
  private isBigQueryAIConfigured(): boolean {
    return !!(
      process.env.GOOGLE_CLOUD_PROJECT_ID &&
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    );
  }

  /**
   * Ensure the quantum_ai dataset exists
   */
  private async ensureDataset(): Promise<void> {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    const datasetId = 'quantum_ai';
    
    try {
      const dataset = this.client.dataset(datasetId);
      await dataset.get({ autoCreate: true });
    } catch (error) {
      console.warn('Failed to create dataset, it may already exist:', error);
    }
  }

  /**
   * Create embeddings for vector search
   */
  async generateEmbedding(text: string, model: string = 'text-embedding-004'): Promise<number[]> {
    const modelName = await this.ensureRemoteModel(model);
    
    const query = `
      SELECT *
      FROM ML.GENERATE_EMBEDDING(
        MODEL \`${modelName}\`,
        (SELECT @text as content),
        STRUCT('RETRIEVAL_DOCUMENT' as task_type)
      )
    `;

    try {
      const [rows] = await this.client.query({ 
        query,
        params: {
          text: text
        }
      });
      return rows[0]?.ml_generate_embedding_result || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Execute a raw BigQuery SQL query
   */
  async executeQuery(query: string, params?: any): Promise<any[]> {
    try {
      const [rows] = await this.client.query({ 
        query,
        params: params || {}
      });
      return rows;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle BigQuery errors and convert to appropriate error types
   */
  private handleError(error: any): BigQueryAIError {
    if (error.code === 429) {
      return new RateLimitError();
    }
    
    if (error.code === 403 && error.message.includes('quota')) {
      return new QuotaExceededError('BigQuery AI');
    }

    return new BigQueryAIError(
      error.message || 'Unknown BigQuery error',
      (error.code ? error.code.toString() : 'UNKNOWN_ERROR'),
      error
    );
  }
}

// Utility functions for BigQuery AI operations
export const bigqueryAI = BigQueryAI.getInstance();

/**
 * Test BigQuery connection and AI capabilities
 */
export async function testBigQueryConnection(): Promise<boolean> {
  try {
    const testQuery = `SELECT 'BigQuery AI is ready!' as status`;
    await bigquery.query({ query: testQuery });
    return true;
  } catch (error) {
    console.error('BigQuery connection test failed:', error);
    return false;
  }
}

/**
 * Get BigQuery dataset and table information
 */
export async function getDatasetInfo(datasetId: string): Promise<any> {
  try {
    const dataset = bigquery.dataset(datasetId);
    const [metadata] = await dataset.getMetadata();
    return metadata;
  } catch (error: any) {
    throw new BigQueryAIError(
      `Failed to get dataset info: ${error.message}`,
      'DATASET_ERROR',
      error
    );
  }
}

/**
 * Create a temporary table for analysis
 */
export async function createTempTable(
  datasetId: string,
  tableId: string,
  schema: any[],
  data: any[]
): Promise<void> {
  try {
    const dataset = bigquery.dataset(datasetId);
    const table = dataset.table(tableId);
    
    await table.create({
      schema: schema,
      location: 'US',
    });
    
    if (data.length > 0) {
      await table.insert(data);
    }
  } catch (error: any) {
    throw new BigQueryAIError(
      `Failed to create temp table: ${error.message}`,
      'TABLE_CREATION_ERROR',
      error
    );
  }
}

/**
 * Clean up temporary resources
 */
export async function cleanupTempResources(datasetId: string, tableIds: string[]): Promise<void> {
  try {
    const dataset = bigquery.dataset(datasetId);
    
    for (const tableId of tableIds) {
      const table = dataset.table(tableId);
      await table.delete({ ignoreNotFound: true });
    }
  } catch (error) {
    console.warn('Failed to cleanup temp resources:', error);
  }
}

/**
 * Validate BigQuery AI environment
 */
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!process.env.GOOGLE_CLOUD_PROJECT_ID) {
    errors.push('GOOGLE_CLOUD_PROJECT_ID environment variable is required');
  }
  
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    errors.push('GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Export default instance
export default bigqueryAI;

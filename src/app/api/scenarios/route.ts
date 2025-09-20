import { NextRequest, NextResponse } from 'next/server';
import { quantumAI } from '@/lib/ai-engine';
import { validateEnvironment } from '@/lib/bigquery';
import { ScenarioRequest, APIResponse, BusinessScenario, BigQueryAIError } from '@/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Validate environment
    const envValidation = validateEnvironment();
    if (!envValidation.isValid) {
      return NextResponse.json({
        success: false,
        error: `Environment configuration error: ${envValidation.errors.join(', ')}`,
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      } as APIResponse<BusinessScenario[]>, { status: 500 });
    }

    // Parse request body
    const body = await request.json();
    const { query, context, options } = body as ScenarioRequest;

    // Validate required fields
    if (!query || !context) {
      return NextResponse.json({
        success: false,
        error: 'Query and context are required',
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      } as APIResponse<BusinessScenario[]>, { status: 400 });
    }

    // Set default context values if missing
    const fullContext = {
      ...context,
      industry: context.industry || 'technology',
      companySize: context.companySize || 'startup',
      timeframe: context.timeframe || '2020-2024',
      region: context.region || 'North America',
      businessModel: context.businessModel || 'B2B SaaS'
    };

    // Generate scenarios using AI engine
    const scenarios = await quantumAI.generateScenarios({
      query,
      context: fullContext,
      options: {
        scenarioCount: 3,
        includeRiskAnalysis: true,
        includeSimilarCases: true,
        detailLevel: 'detailed',
        ...options
      }
    });

    return NextResponse.json({
      success: true,
      data: scenarios,
      timestamp: new Date(),
      processingTime: Date.now() - startTime
    } as APIResponse<BusinessScenario[]>);

  } catch (error) {
    console.error('Scenarios API error:', error);

    if (error instanceof BigQueryAIError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      } as APIResponse<BusinessScenario[]>, { 
        status: error.code === 'RATE_LIMIT_EXCEEDED' ? 429 : 500 
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error occurred while generating scenarios',
      timestamp: new Date(),
      processingTime: Date.now() - startTime
    } as APIResponse<BusinessScenario[]>, { status: 500 });
  }
}

// Streaming version for real-time updates
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const industry = searchParams.get('industry') || 'technology';
  const companySize = searchParams.get('companySize') || 'startup';

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial status
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          status: 'processing',
          stage: 'analyzing',
          progress: 0,
          message: 'Analyzing historical patterns...'
        })}\n\n`));

        // Simulate processing stages with real AI calls
        const stages = [
          { stage: 'analyzing', progress: 20, message: 'Analyzing historical patterns...' },
          { stage: 'generating', progress: 40, message: 'Generating parallel realities...' },
          { stage: 'computing', progress: 60, message: 'Computing probability matrices...' },
          { stage: 'summarizing', progress: 80, message: 'Creating executive summaries...' },
          { stage: 'finalizing', progress: 95, message: 'Finalizing scenarios...' }
        ];

        for (const stage of stages) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            status: 'processing',
            ...stage
          })}\n\n`));
        }

        // Generate actual scenarios
        const scenarios = await quantumAI.generateScenarios({
          query,
          context: {
            industry,
            companySize: companySize as any,
            timeframe: '2020-2024',
            region: 'North America',
            businessModel: 'B2B SaaS'
          },
          options: {
            scenarioCount: 3,
            includeRiskAnalysis: true,
            includeSimilarCases: true
          }
        });

        // Send final results
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          status: 'complete',
          progress: 100,
          message: 'Analysis complete!',
          data: scenarios
        })}\n\n`));

      } catch (error) {
        console.error('Streaming scenarios error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error occurred'
        })}\n\n`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

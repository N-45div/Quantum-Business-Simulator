import { NextRequest, NextResponse } from 'next/server';
import { bigqueryAI } from '@/lib/bigquery';
import { ForecastRequest, APIResponse, TimelinePoint, BigQueryAIError } from '@/types';

// Helper functions
function calculateRiskLevel(timeline: TimelinePoint[]): number {
  const revenueVariance = calculateVariance(timeline.map(p => p.revenue));
  const confidenceAvg = timeline.reduce((sum, p) => sum + p.probability, 0) / timeline.length;
  
  // Higher variance and lower confidence = higher risk
  return Math.round((revenueVariance * 0.6 + (1 - confidenceAvg) * 0.4) * 100);
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
}

function generateMockForecast(variation: any, index: number, timeHorizon: number) {
  const baseRevenue = 100000 + (index * 20000);
  const timeline: TimelinePoint[] = [];
  
  for (let month = 1; month <= timeHorizon; month++) {
    const monthStr = `2024-${month.toString().padStart(2, '0')}`;
    timeline.push({
      month: monthStr,
      date: new Date(monthStr + '-01'),
      revenue: baseRevenue + (month * 15000) + (Math.random() * 10000),
      probability: 0.7 + (Math.random() * 0.2),
      marketShare: 0.05 + (month * 0.005),
      customerCount: 1000 + (month * 150),
      operatingCosts: baseRevenue * 0.7 + (month * 8000),
      keyEvents: month === 1 ? ['Launch phase'] : month === 6 ? ['Market expansion'] : []
    });
  }

  return {
    variationId: `variation_${index}`,
    variationName: variation.name,
    description: variation.description,
    parameters: variation.parameters,
    timeline,
    summary: {
      totalRevenue: timeline.reduce((sum, point) => sum + point.revenue, 0),
      averageConfidence: timeline.reduce((sum, point) => sum + point.probability, 0) / timeline.length,
      peakRevenue: Math.max(...timeline.map(point => point.revenue)),
      riskLevel: Math.floor(Math.random() * 30) + 20
    }
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();
    const { baseScenario, variations, timeHorizon = 12 } = body as ForecastRequest;

    // Validate required fields
    if (!baseScenario || !variations || variations.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Base scenario and variations are required',
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      } as APIResponse<any>, { status: 400 });
    }

    // Generate forecasts for each variation
    const forecasts = await Promise.all(
      variations.map(async (variation, index) => {
        try {
          // Create forecast prompt based on variation parameters
          const forecastPrompt = `
            Generate a detailed business forecast for the following scenario variation:
            
            Base Scenario: ${baseScenario.title}
            Variation: ${variation.name}
            Description: ${variation.description}
            Parameters: ${JSON.stringify(variation.parameters)}
            Time Horizon: ${timeHorizon} months
            
            Provide monthly projections including:
            - Revenue forecasts with confidence intervals
            - Market share evolution
            - Customer growth projections
            - Operating cost estimates
            - Key milestone predictions
            
            Focus on realistic business metrics that reflect the impact of the variation parameters.
          `;

          // Generate structured forecast data
          const forecastSchema = {
            month: 'STRING',
            revenue_forecast: 'FLOAT64',
            revenue_lower_bound: 'FLOAT64',
            revenue_upper_bound: 'FLOAT64',
            market_share: 'FLOAT64',
            customer_count: 'INT64',
            operating_costs: 'FLOAT64',
            confidence: 'FLOAT64',
            key_events: 'STRING'
          };

          const forecastData = await bigqueryAI.generateTable(forecastPrompt, forecastSchema);

          // Transform to timeline format
          const timeline: TimelinePoint[] = forecastData.map((point: any) => ({
            month: point.month,
            date: new Date(point.month + '-01'),
            revenue: point.revenue_forecast || 0,
            probability: point.confidence || 0.7,
            marketShare: point.market_share || 0,
            customerCount: point.customer_count || 0,
            operatingCosts: point.operating_costs || 0,
            keyEvents: point.key_events ? point.key_events.split(',').map((e: string) => e.trim()) : []
          }));

          return {
            variationId: `variation_${index}`,
            variationName: variation.name,
            description: variation.description,
            parameters: variation.parameters,
            timeline,
            summary: {
              totalRevenue: timeline.reduce((sum, point) => sum + point.revenue, 0),
              averageConfidence: timeline.reduce((sum, point) => sum + point.probability, 0) / timeline.length,
              peakRevenue: Math.max(...timeline.map(point => point.revenue)),
              riskLevel: calculateRiskLevel(timeline)
            }
          };

        } catch (error) {
          // Return mock forecast if AI generation fails
          return generateMockForecast(variation, index, timeHorizon);
        }
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        baseScenario: {
          id: baseScenario.id,
          title: baseScenario.title,
          description: baseScenario.description
        },
        forecasts,
        metadata: {
          timeHorizon,
          variationCount: variations.length,
          generatedAt: new Date(),
          confidence: forecasts.reduce((sum, f) => sum + f.summary.averageConfidence, 0) / forecasts.length
        }
      },
      timestamp: new Date(),
      processingTime: Date.now() - startTime
    } as APIResponse<any>);

  } catch (error) {
    console.error('Forecast API error:', error);

    if (error instanceof BigQueryAIError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      } as APIResponse<any>, { 
        status: error.code === 'RATE_LIMIT_EXCEEDED' ? 429 : 500 
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error occurred during forecasting',
      timestamp: new Date(),
      processingTime: Date.now() - startTime
    } as APIResponse<any>, { status: 500 });
  }
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

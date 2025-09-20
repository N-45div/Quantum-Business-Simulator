import { NextRequest, NextResponse } from 'next/server';
import { bigqueryAI } from '@/lib/bigquery';
import { VectorSearchRequest, APIResponse, SimilarCase, BigQueryAIError } from '@/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse request body
    const body = await request.json();
    const { situation, industry, context, limit = 5 } = body as VectorSearchRequest;

    // Validate required fields
    if (!situation || !industry) {
      return NextResponse.json({
        success: false,
        error: 'Situation and industry are required',
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      } as APIResponse<SimilarCase[]>, { status: 400 });
    }

    // Generate embedding for the search query
    const searchText = `${situation} ${industry} ${context}`;
    const queryEmbedding = await bigqueryAI.generateEmbedding(searchText);

    // In a real implementation, you would search against a vector database
    // For demo purposes, we'll return mock similar cases with realistic data
    const mockSimilarCases: SimilarCase[] = [
      {
        id: 'case_netflix_spotify',
        company: 'Netflix Inc.',
        industry: 'Entertainment/Media',
        scenario: 'Strategic acquisition timing decision in streaming market',
        outcome: 'Successful acquisition led to 40% increase in subscriber engagement and 25% revenue growth within 18 months',
        similarity: 0.89,
        year: 2019
      },
      {
        id: 'case_apple_automotive',
        company: 'Apple Inc.',
        industry: 'Technology/Automotive',
        scenario: 'Market entry timing for new product category during industry disruption',
        outcome: 'Delayed entry allowed for better technology integration but missed early market opportunity',
        similarity: 0.84,
        year: 2018
      },
      {
        id: 'case_zoom_pandemic',
        company: 'Zoom Technologies',
        industry: 'Software/Communications',
        scenario: 'Product scaling decision during unexpected market surge',
        outcome: 'Rapid scaling captured 300% market growth but created operational challenges',
        similarity: 0.78,
        year: 2020
      },
      {
        id: 'case_tesla_gigafactory',
        company: 'Tesla Inc.',
        industry: 'Automotive/Manufacturing',
        scenario: 'Manufacturing expansion timing in emerging market',
        outcome: 'Early expansion secured supply chain advantages and 35% cost reduction',
        similarity: 0.72,
        year: 2017
      },
      {
        id: 'case_shopify_covid',
        company: 'Shopify Inc.',
        industry: 'E-commerce/Technology',
        scenario: 'Platform expansion during economic uncertainty',
        outcome: 'Strategic timing captured small business migration, 200% user growth',
        similarity: 0.69,
        year: 2020
      }
    ];

    // Filter and sort by similarity, limit results
    const filteredCases = mockSimilarCases
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      data: filteredCases,
      timestamp: new Date(),
      processingTime: Date.now() - startTime
    } as APIResponse<SimilarCase[]>);

  } catch (error) {
    console.error('Vector search API error:', error);

    if (error instanceof BigQueryAIError) {
      return NextResponse.json({
        success: false,
        error: error.message,
        timestamp: new Date(),
        processingTime: Date.now() - startTime
      } as APIResponse<SimilarCase[]>, { 
        status: error.code === 'RATE_LIMIT_EXCEEDED' ? 429 : 500 
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error occurred during vector search',
      timestamp: new Date(),
      processingTime: Date.now() - startTime
    } as APIResponse<SimilarCase[]>, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const situation = searchParams.get('situation');
  const industry = searchParams.get('industry');
  const context = searchParams.get('context') || '';
  const limit = parseInt(searchParams.get('limit') || '5');

  if (!situation || !industry) {
    return NextResponse.json({ 
      error: 'Situation and industry parameters are required' 
    }, { status: 400 });
  }

  // Reuse POST logic
  return POST(new NextRequest(request.url, {
    method: 'POST',
    body: JSON.stringify({ situation, industry, context, limit })
  }));
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

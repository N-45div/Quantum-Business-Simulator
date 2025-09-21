'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, Sparkles, Brain, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import TimelineVisualizer from '@/components/TimelineVisualizer';
import { BusinessScenario, BusinessContext } from '@/types';
import { DEMO_QUERIES } from '@/lib/datasets';

const LoadingStage = ({ stage, isActive }: { stage: string; isActive: boolean }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: isActive ? 1 : 0.5, x: 0 }}
    className={`flex items-center gap-3 p-3 rounded-lg ${
      isActive ? 'glass-morphism border border-primary/30' : ''
    }`}
  >
    <div className={`w-3 h-3 rounded-full ${isActive ? 'quantum-glow bg-primary' : 'bg-gray-600'}`} />
    <span className={isActive ? 'text-white' : 'text-gray-400'}>{stage}</span>
    {isActive && (
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="ml-auto"
      >
        <Sparkles className="w-4 h-4 text-primary" />
      </motion.div>
    )}
  </motion.div>
);

const ScenarioCard = ({ scenario, index }: { scenario: BusinessScenario; index: number }) => {
  const [showAllInsights, setShowAllInsights] = useState(false);
  const colors = ['#2563EB', '#059669', '#DC2626'];
  const riskLevels = ['High', 'Medium', 'Low'];
  const growthRates = ['20%', '15%', '8%'];
  
  // Filter out meta descriptions and get actual insights
  const actualInsights = scenario.keyInsights.filter(insight => 
    !insight.toLowerCase().includes('here are') && 
    !insight.toLowerCase().includes('key business insights') &&
    insight.length > 50 // Ensure substantial content
  );
  
  const displayInsights = showAllInsights ? actualInsights : actualInsights.slice(0, 2);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 }}
      className="group relative bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 min-h-[480px]"
    >
      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        <div 
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ backgroundColor: colors[index] }}
        />
      </div>
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: `${colors[index]}15`, border: `1px solid ${colors[index]}40` }}
          >
            {index + 1}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white leading-tight mb-1">
              {scenario.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Confidence:</span>
              <span 
                className="text-xs font-medium px-2 py-1 rounded-md"
                style={{ 
                  backgroundColor: `${colors[index]}20`,
                  color: colors[index]
                }}
              >
                {scenario.confidence}%
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-slate-300 leading-relaxed">
          {scenario.description}
        </p>
      </div>
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
          <div className="text-xs text-slate-400 mb-1">Growth Rate</div>
          <div 
            className="text-2xl font-bold"
            style={{ color: colors[index] }}
          >
            {growthRates[index]}
          </div>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/30">
          <div className="text-xs text-slate-400 mb-1">Risk Level</div>
          <div 
            className="text-2xl font-bold"
            style={{ color: colors[index] }}
          >
            {riskLevels[index]}
          </div>
        </div>
      </div>
      
      {/* Key Insights - Expandable */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-slate-200">Strategic Insights</h4>
          <div className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
            {actualInsights.length} insights
          </div>
        </div>
        <div className="space-y-4">
          {actualInsights.map((insight: string, i: number) => {
            // Clean up the insight text and extract meaningful content
            let cleanInsight = insight
              .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
              .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
              .replace(/^(\d+\.\s*)/g, '') // Remove numbering
              .replace(/^(Insight:|Action:|\*\*Insight\*\*:|\*\*Action\*\*:)/gi, '') // Remove prefixes
              .trim();

            // Extract title and content if formatted as "Title: Content"
            const parts = cleanInsight.split(':');
            const title = parts.length > 1 ? parts[0].trim() : '';
            const content = parts.length > 1 ? parts.slice(1).join(':').trim() : cleanInsight;
            
            return (
              <div key={i} className="group relative">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: `${colors[index]}40`, border: `1px solid ${colors[index]}` }}
                    >
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {title && (
                      <div className="text-sm font-semibold text-slate-200 mb-1">
                        {title}
                      </div>
                    )}
                    <div className="text-xs text-slate-300 leading-relaxed">
                      {content}
                    </div>
                  </div>
                </div>
                {/* Insight separator */}
                {i < actualInsights.length - 1 && (
                  <div className="mt-3 border-b border-slate-700/30" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
    </motion.div>
  );
};

export default function Simulator() {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [scenarios, setScenarios] = useState<BusinessScenario[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'customers' | 'marketShare'>('revenue');
  const [showResults, setShowResults] = useState(false);

  const processingStages = [
    'Analyzing historical patterns...',
    'Generating parallel realities...',
    'Computing probability matrices...',
    'Creating executive summaries...',
    'Finalizing scenarios...'
  ];

  const exampleQueries = [
    DEMO_QUERIES.LAUNCH_TIMING.query,
    DEMO_QUERIES.MARKET_EXPANSION.query,
    DEMO_QUERIES.PRODUCT_STRATEGY.query,
    DEMO_QUERIES.ECONOMIC_TIMING.query
  ];

  const handleSubmit = async () => {
    if (!query.trim()) return;
    
    setIsProcessing(true);
    setShowResults(false);
    setCurrentStage(0);

    try {
      // Simulate AI processing stages
      for (let i = 0; i < processingStages.length; i++) {
        setCurrentStage(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Determine business context based on query
      const context: BusinessContext = {
        industry: query.toLowerCase().includes('ecommerce') || query.toLowerCase().includes('online') ? 'ecommerce' :
                 query.toLowerCase().includes('tech') ? 'technology' :
                 query.toLowerCase().includes('retail') ? 'retail' : 'technology',
        companySize: 'startup',
        timeframe: '2020-2024',
        region: 'North America',
        businessModel: 'B2B SaaS'
      };

      console.log('🎯 Step 1: Generating scenarios...');

      // Step 1: Generate scenarios
      const scenariosResponse = await fetch('/api/scenarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          context,
          options: {
            scenarioCount: 3,
            includeRiskAnalysis: true,
            includeSimilarCases: true,
            detailLevel: 'detailed'
          }
        }),
      });

      if (!scenariosResponse.ok) {
        throw new Error(`Scenarios API Error: ${scenariosResponse.status} ${scenariosResponse.statusText}`);
      }

      const scenariosResult = await scenariosResponse.json();
      
      if (!scenariosResult.success) {
        throw new Error(`Scenarios Error: ${scenariosResult.error || 'Unknown error'}`);
      }

      if (!scenariosResult.data || !Array.isArray(scenariosResult.data)) {
        throw new Error('Invalid scenarios response format');
      }

      console.log('🎯 Scenarios Response:', scenariosResult.data);
      console.log('🎯 Step 2: Generating forecast timelines...');

      // Step 2: Generate forecasts with timeline data
      const forecastResponse = await fetch('/api/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          baseScenario: {
            id: 'base_scenario',
            title: 'Business Decision Analysis',
            description: query
          },
          variations: scenariosResult.data.map((scenario: any) => ({
            name: scenario.title,
            description: scenario.description,
            parameters: {
              confidence: scenario.confidence,
              assumptions: scenario.key_assumptions,
              outcome: scenario.expected_outcome
            }
          })),
          timeHorizon: 12
        }),
      });

      if (!forecastResponse.ok) {
        throw new Error(`Forecast API Error: ${forecastResponse.status} ${forecastResponse.statusText}`);
      }

      const forecastResult = await forecastResponse.json();
      
      if (!forecastResult.success) {
        throw new Error(`Forecast Error: ${forecastResult.error || 'Unknown error'}`);
      }

      console.log('🎯 Forecast Response:', forecastResult.data);

      // Step 3: Combine scenario data with forecast timelines
      const enhancedScenarios = scenariosResult.data.map((scenario: any, index: number) => ({
        ...scenario,
        timeline: forecastResult.data.forecasts[index]?.timeline || [],
        summary: forecastResult.data.forecasts[index]?.summary || {}
      }));

      console.log('🎯 Enhanced Scenarios with Timelines:', enhancedScenarios);
      
      setScenarios(enhancedScenarios);
      setShowResults(true);

    } catch (error) {
      console.error('❌ Error:', error);
      // Show error message instead of fallback
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your setup and try again.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper function to generate demo timeline data (12 months to match backend)
  const generateDemoTimeline = (scenarioIndex: number) => {
    const months = [
      '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
      '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'
    ];
    
    // Different growth profiles for each scenario
    let baseRevenue, growthRate, customerGrowthRate, marketShareGrowthRate;
    
    switch (scenarioIndex) {
      case 1: // Aggressive
        baseRevenue = 75000;
        growthRate = 1.20; // 20% monthly growth
        customerGrowthRate = 1.18;
        marketShareGrowthRate = 1.12;
        break;
      case 3: // Slow
        baseRevenue = 30000;
        growthRate = 1.08; // 8% monthly growth
        customerGrowthRate = 1.06;
        marketShareGrowthRate = 1.04;
        break;
      default: // Steady (scenario 2)
        baseRevenue = 50000;
        growthRate = 1.15; // 15% monthly growth
        customerGrowthRate = 1.12;
        marketShareGrowthRate = 1.08;
    }
    
    return months.map((month, index) => {
      const growthFactor = Math.pow(growthRate, index);
      const variance = (Math.random() - 0.5) * 0.15; // ±7.5% variance
      
      const baseCustomers = scenarioIndex === 1 ? 750 : scenarioIndex === 3 ? 300 : 500;
      const customerGrowth = Math.pow(customerGrowthRate, index);
      
      const baseMarketShare = scenarioIndex === 1 ? 0.03 : scenarioIndex === 3 ? 0.01 : 0.02;
      const marketShareGrowth = Math.pow(marketShareGrowthRate, index);
      
      return {
        month,
        date: new Date(month + '-01'),
        revenue: Math.round(baseRevenue * growthFactor * (1 + variance)),
        probability: 0.7 + (Math.random() * 0.2),
        marketShare: Math.min(baseMarketShare * marketShareGrowth, 0.25), // Cap at 25%
        customerCount: Math.round(baseCustomers * customerGrowth),
        operatingCosts: Math.round(baseRevenue * growthFactor * 0.7), // 70% of revenue
        keyEvents: getKeyEventsForMonth(index)
      };
    });
  };

  // Helper function to get key events for specific months
  const getKeyEventsForMonth = (monthIndex: number): string[] => {
    const events: { [key: number]: string[] } = {
      0: ['Product launch', 'Initial marketing campaign'],
      2: ['First major partnership'],
      4: ['Series A funding round'],
      6: ['International expansion'],
      8: ['Product v2.0 release'],
      10: ['Holiday season push'],
      11: ['Year-end optimization']
    };
    
    return events[monthIndex] || [];
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 glass-morphism rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </motion.button>
          </Link>
          
          <h1 className="text-2xl font-bold quantum-gradient-text">
            Quantum Business Simulator
          </h1>
          
          <div className="flex items-center gap-2 px-4 py-2 glass-morphism rounded-lg">
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-sm">AI Ready</span>
          </div>
        </div>

        {/* Query Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism p-8 rounded-2xl mb-8"
        >
          <h2 className="text-3xl font-bold mb-4 text-center">
            What Business Decision Would You Like to Explore?
          </h2>
          <p className="text-gray-300 text-center mb-8">
            Ask any strategic question and our AI will generate parallel universe scenarios to help you decide.
          </p>
          
          <div className="max-w-4xl mx-auto">
            <div className="relative mb-6">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., What if we launched our product 6 months earlier?"
                className="w-full p-4 bg-muted/50 border border-border rounded-xl resize-none focus:outline-none focus:border-primary/50 transition-colors"
                rows={3}
                disabled={isProcessing}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                disabled={isProcessing || !query.trim()}
                className="absolute bottom-4 right-4 p-3 quantum-gradient rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* Example Queries */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exampleQueries.map((example, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setQuery(example)}
                  className="p-3 text-left border border-border rounded-lg hover:border-primary/30 transition-colors text-sm"
                  disabled={isProcessing}
                >
                  {example}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Processing Animation */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="glass-morphism p-8 rounded-2xl mb-8"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 quantum-gradient rounded-full flex items-center justify-center"
                >
                  <Brain className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">Consulting the Business Multiverse</h3>
                <p className="text-gray-300">Our AI is analyzing infinite possibilities...</p>
              </div>
              
              <div className="max-w-md mx-auto space-y-3">
                {processingStages.map((stage, index) => (
                  <LoadingStage
                    key={index}
                    stage={stage}
                    isActive={index === currentStage}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {showResults && scenarios.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
            >
              <div className="mb-8">
                <h3 className="text-3xl font-bold mb-4">Parallel Universe Scenarios</h3>
                <p className="text-gray-300">
                  Based on your query: "<span className="text-primary">{query}</span>"
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {scenarios.map((scenario, index) => (
                  <ScenarioCard key={scenario.id} scenario={scenario} index={index} />
                ))}
              </div>
              
              {/* Timeline Visualization */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="mb-8"
              >
                <TimelineVisualizer
                  scenarios={scenarios}
                  selectedMetric={selectedMetric}
                  onMetricChange={setSelectedMetric}
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="text-center"
              >
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

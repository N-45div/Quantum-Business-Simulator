'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TimelinePoint } from '@/types';
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

interface TimelineVisualizerProps {
  scenarios: Array<{
    id: string;
    title: string;
    timeline?: TimelinePoint[];
    confidence: number;
  }>;
  selectedMetric: 'revenue' | 'customers' | 'marketShare';
  onMetricChange: (metric: 'revenue' | 'customers' | 'marketShare') => void;
}

const SCENARIO_COLORS = ['#2563EB', '#059669', '#DC2626', '#7C3AED', '#F59E0B'];

const MetricButton = ({ 
  metric, 
  label, 
  icon: Icon, 
  isActive, 
  onClick 
}: {
  metric: string;
  label: string;
  icon: any;
  isActive: boolean;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
      isActive 
        ? 'quantum-gradient text-white' 
        : 'glass-morphism hover:bg-white/10'
    }`}
  >
    <Icon className="w-4 h-4" />
    {label}
  </motion.button>
);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-morphism p-4 rounded-lg border border-primary/30">
        <p className="text-sm text-gray-300 mb-2">{`Month: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">{entry.name}:</span>
            <span className="text-sm text-primary">
              {entry.name.includes('Revenue') 
                ? `$${(entry.value / 1000).toFixed(0)}K`
                : entry.name.includes('Customers')
                ? `${entry.value.toLocaleString()}`
                : `${(entry.value * 100).toFixed(1)}%`
              }
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Generate demo timeline data if scenarios don't have timeline arrays
const generateDemoTimeline = (scenario: any, scenarioIndex: number) => {
  const months = [
    '2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06',
    '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'
  ];
  
  // Different growth profiles for each scenario
  let baseRevenue, growthRate, customerGrowthRate, marketShareGrowthRate;
  
  if (scenario.title.toLowerCase().includes('surge') || scenario.title.toLowerCase().includes('soars')) {
    // Optimistic scenario
    baseRevenue = 120000;
    growthRate = 1.18; // 18% monthly growth
    customerGrowthRate = 1.15;
    marketShareGrowthRate = 1.12;
  } else if (scenario.title.toLowerCase().includes('limited') || scenario.title.toLowerCase().includes('noise')) {
    // Conservative scenario
    baseRevenue = 35000;
    growthRate = 1.06; // 6% monthly growth
    customerGrowthRate = 1.05;
    marketShareGrowthRate = 1.04;
  } else {
    // Realistic scenario
    baseRevenue = 75000;
    growthRate = 1.12; // 12% monthly growth
    customerGrowthRate = 1.10;
    marketShareGrowthRate = 1.08;
  }
  
  return months.map((month, index) => {
    const growthFactor = Math.pow(growthRate, index);
    const variance = (Math.random() - 0.5) * 0.15; // ±7.5% variance
    
    const baseCustomers = scenario.title.toLowerCase().includes('surge') ? 1200 : 
                         scenario.title.toLowerCase().includes('limited') ? 400 : 800;
    const customerGrowth = Math.pow(customerGrowthRate, index);
    
    const baseMarketShare = scenario.title.toLowerCase().includes('surge') ? 0.04 : 
                           scenario.title.toLowerCase().includes('limited') ? 0.015 : 0.025;
    const marketShareGrowth = Math.pow(marketShareGrowthRate, index);
    
    return {
      month,
      date: new Date(month + '-01'),
      revenue: Math.round(baseRevenue * growthFactor * (1 + variance)),
      probability: 0.65 + (Math.random() * 0.25),
      marketShare: Math.min(baseMarketShare * marketShareGrowth, 0.3), // Cap at 30%
      customerCount: Math.round(baseCustomers * customerGrowth),
      operatingCosts: Math.round(baseRevenue * growthFactor * 0.72), // 72% of revenue
      keyEvents: []
    };
  });
};

export default function TimelineVisualizer({ 
  scenarios, 
  selectedMetric, 
  onMetricChange 
}: TimelineVisualizerProps) {
  // Ensure all scenarios have timeline data
  const scenariosWithTimelines = scenarios.map((scenario, index) => {
    if (!scenario.timeline || scenario.timeline.length === 0) {
      return {
        ...scenario,
        timeline: generateDemoTimeline(scenario, index)
      };
    }
    return scenario;
  });

  // Prepare chart data with null checks
  const chartData = scenariosWithTimelines[0]?.timeline?.map((point, index) => {
    const dataPoint: any = {
      month: point?.month ? point.month.substring(5) : `M${index + 1}`, // Get MM part or fallback
      date: point?.date || `2024-${String(index + 1).padStart(2, '0')}-01`
    };

    scenariosWithTimelines.forEach((scenario) => {
      const timelinePoint = scenario.timeline?.[index];
      if (timelinePoint) {
        switch (selectedMetric) {
          case 'revenue':
            dataPoint[scenario.title] = timelinePoint.revenue || 0;
            break;
          case 'customers':
            dataPoint[scenario.title] = timelinePoint.customerCount || 0;
            break;
          case 'marketShare':
            dataPoint[scenario.title] = timelinePoint.marketShare || 0;
            break;
        }
      } else {
        // Provide fallback data if timeline point is missing
        dataPoint[scenario.title] = 0;
      }
    });

    return dataPoint;
  }) || [];

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'revenue': return 'Revenue ($)';
      case 'customers': return 'Customer Count';
      case 'marketShare': return 'Market Share (%)';
      default: return 'Value';
    }
  };

  const formatYAxisValue = (value: number) => {
    switch (selectedMetric) {
      case 'revenue':
        return `$${(value / 1000).toFixed(0)}K`;
      case 'customers':
        return value.toLocaleString();
      case 'marketShare':
        return `${(value * 100).toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  // Don't render if no data
  if (chartData.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-6 rounded-2xl text-center"
      >
        <p className="text-gray-400">No timeline data available for visualization</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-morphism p-6 rounded-2xl"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Scenario Timeline Comparison</h3>
          <p className="text-gray-300">
            Compare how different scenarios evolve over time
          </p>
        </div>
        
        {/* Metric Selector */}
        <div className="flex gap-2 mt-4 md:mt-0">
          <MetricButton
            metric="revenue"
            label="Revenue"
            icon={DollarSign}
            isActive={selectedMetric === 'revenue'}
            onClick={() => onMetricChange('revenue')}
          />
          <MetricButton
            metric="customers"
            label="Customers"
            icon={Users}
            isActive={selectedMetric === 'customers'}
            onClick={() => onMetricChange('customers')}
          />
          <MetricButton
            metric="marketShare"
            label="Market Share"
            icon={TrendingUp}
            isActive={selectedMetric === 'marketShare'}
            onClick={() => onMetricChange('marketShare')}
          />
        </div>
      </div>

      {/* Chart */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A3E" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={formatYAxisValue}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {scenariosWithTimelines.map((scenario, index) => (
              <Line
                key={scenario.id}
                type="monotone"
                dataKey={scenario.title}
                stroke={SCENARIO_COLORS[index % SCENARIO_COLORS.length]}
                strokeWidth={3}
                dot={{ 
                  fill: SCENARIO_COLORS[index % SCENARIO_COLORS.length], 
                  strokeWidth: 2, 
                  r: 5 
                }}
                activeDot={{ 
                  r: 7, 
                  stroke: SCENARIO_COLORS[index % SCENARIO_COLORS.length],
                  strokeWidth: 2,
                  fill: '#0B0F1A'
                }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 justify-center">
        {scenariosWithTimelines.map((scenario, index) => (
          <motion.div
            key={scenario.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-2"
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: SCENARIO_COLORS[index % SCENARIO_COLORS.length] }}
            />
            <span className="text-sm font-medium">{scenario.title}</span>
            <span className="text-xs text-gray-400">({scenario.confidence}% confidence)</span>
          </motion.div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {scenariosWithTimelines.map((scenario, index) => {
          // Safe calculations with null checks
          const timeline = scenario.timeline || [];
          const totalRevenue = timeline.reduce((sum, point) => sum + (point?.revenue || 0), 0);
          const avgCustomers = timeline.length > 0 
            ? (timeline.reduce((sum, point) => sum + (point?.customerCount || 0), 0) / timeline.length)
            : 0;
          const marketShares = timeline.map(point => point?.marketShare || 0);
          const peakMarketShare = marketShares.length > 0 ? Math.max(...marketShares) : 0;
          
          return (
            <motion.div
              key={scenario.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-muted/30 p-4 rounded-lg border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: SCENARIO_COLORS[index % SCENARIO_COLORS.length] }}
                />
                <h4 className="font-semibold text-sm">{scenario.title}</h4>
              </div>
              
              <div className="space-y-1 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Total Revenue:</span>
                  <span className="text-primary">${(totalRevenue / 1000000).toFixed(1)}M</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Customers:</span>
                  <span className="text-accent">{avgCustomers.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Peak Market Share:</span>
                  <span className="text-secondary">{(peakMarketShare * 100).toFixed(1)}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
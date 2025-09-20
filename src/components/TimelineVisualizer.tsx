'use client';

import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TimelinePoint } from '@/types';
import { TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

interface TimelineVisualizerProps {
  scenarios: Array<{
    id: string;
    title: string;
    timeline: TimelinePoint[];
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

export default function TimelineVisualizer({ 
  scenarios, 
  selectedMetric, 
  onMetricChange 
}: TimelineVisualizerProps) {
  // Prepare chart data with null checks
  const chartData = scenarios[0]?.timeline?.map((point, index) => {
    const dataPoint: any = {
      month: point?.month ? point.month.substring(5) : `M${index + 1}`, // Get MM part or fallback
      date: point?.date || `2024-${String(index + 1).padStart(2, '0')}-01`
    };

    scenarios.forEach((scenario, scenarioIndex) => {
      const timelinePoint = scenario.timeline?.[index];
      if (timelinePoint) {
        switch (selectedMetric) {
          case 'revenue':
            dataPoint[`${scenario.title}`] = timelinePoint.revenue || 0;
            break;
          case 'customers':
            dataPoint[`${scenario.title}`] = timelinePoint.customerCount || 0;
            break;
          case 'marketShare':
            dataPoint[`${scenario.title}`] = timelinePoint.marketShare || 0;
            break;
        }
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
            
            {scenarios.map((scenario, index) => (
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
        {scenarios.map((scenario, index) => (
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
        {scenarios.map((scenario, index) => {
          // Safe calculations with null checks
          const totalRevenue = scenario.timeline?.reduce((sum, point) => sum + (point?.revenue || 0), 0) || 0;
          const avgCustomers = scenario.timeline?.length > 0 
            ? (scenario.timeline.reduce((sum, point) => sum + (point?.customerCount || 0), 0) / scenario.timeline.length)
            : 0;
          const marketShares = scenario.timeline?.map(point => point?.marketShare || 0) || [0];
          const peakMarketShare = Math.max(...marketShares);
          
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

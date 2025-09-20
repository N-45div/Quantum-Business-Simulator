'use client';

import { motion } from 'framer-motion';
import { ArrowRight, Zap, Brain, TrendingUp, Sparkles } from 'lucide-react';
import Link from 'next/link';

const FloatingParticle = ({ delay = 0 }: { delay?: number }) => (
  <motion.div
    className="absolute w-2 h-2 bg-primary rounded-full quantum-particle"
    initial={{ opacity: 0 }}
    animate={{ 
      opacity: [0, 1, 0],
      x: [0, Math.random() * 100 - 50],
      y: [0, Math.random() * 100 - 50]
    }}
    transition={{
      duration: 4,
      delay,
      repeat: Infinity,
      repeatType: "loop"
    }}
  />
);

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: {
  icon: any;
  title: string;
  description: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="glass-morphism p-6 rounded-xl hover:bg-white/10 transition-all duration-300 group"
  >
    <div className="flex items-center mb-4">
      <div className="p-3 rounded-lg quantum-gradient mr-4">
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
    </div>
    <p className="text-gray-300 group-hover:text-white transition-colors">
      {description}
    </p>
  </motion.div>
);

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <FloatingParticle key={i} delay={i * 0.2} />
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            <div className="inline-flex items-center px-4 py-2 rounded-full glass-morphism mb-6">
              <Sparkles className="w-4 h-4 text-accent mr-2" />
              <span className="text-sm font-medium">Powered by BigQuery AI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Strategic Decision{' '}
              <span className="quantum-gradient-text">Intelligence</span>
              <br />
              Platform
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-4xl mx-auto">
              Advanced AI-powered scenario modeling for executive decision-making. 
              Analyze strategic alternatives with data-driven insights and predictive analytics.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Link href="/simulator">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 quantum-gradient rounded-xl font-semibold text-lg flex items-center gap-2 quantum-glow"
              >
                Enter the Quantum Simulator
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </Link>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 glass-morphism rounded-xl font-semibold text-lg border border-primary/30 hover:border-primary/60 transition-colors"
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold quantum-gradient-text">∞</div>
              <div className="text-gray-400">Parallel Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold quantum-gradient-text">AI</div>
              <div className="text-gray-400">Powered Analysis</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold quantum-gradient-text">Real-time</div>
              <div className="text-gray-400">Predictions</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              The Future of{' '}
              <span className="quantum-gradient-text">Business Intelligence</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Our quantum-powered simulator uses advanced AI to generate multiple timeline scenarios, 
              helping executives make data-driven decisions with unprecedented clarity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Scenarios"
              description="Generate multiple business timelines using BigQuery's advanced AI capabilities and historical pattern analysis."
              delay={0.1}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Predictive Analytics"
              description="Forecast market trends, revenue projections, and competitive responses across different decision paths."
              delay={0.2}
            />
            <FeatureCard
              icon={Zap}
              title="Real-time Insights"
              description="Get instant analysis and recommendations as scenarios are generated, with live progress tracking."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center glass-morphism p-12 rounded-2xl"
        >
          <h3 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Explore Your Business Multiverse?
          </h3>
          <p className="text-xl text-gray-300 mb-8">
            Join the future of strategic planning. Start simulating parallel business realities today.
          </p>
          <Link href="/simulator">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 quantum-gradient rounded-xl font-semibold text-xl flex items-center gap-3 mx-auto quantum-glow"
            >
              Launch Simulator
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

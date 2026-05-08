/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  ChevronRight, 
  Plus, 
  Minus, 
  Table as TableIcon, 
  ClipboardList, 
  Target, 
  Sparkles,
  Info,
  ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { analyzeDecision, DecisionAnalysis, ProCon } from './services/geminiService';

type TabType = 'proscons' | 'comparison' | 'swot' | 'summary';

export default function App() {
  const [decision, setDecision] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<DecisionAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('summary');
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!decision.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeDecision(decision);
      setAnalysis(result);
      setActiveTab('summary');
    } catch (err) {
      setError('The wisdom failed to arrive. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFB] text-[#1A1A1A] font-sans">
      {/* Header */}
      <header className="border-b border-[#E5E5E5] bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1A1A1A] text-white rounded-lg flex items-center justify-center">
              <Brain size={20} />
            </div>
            <h1 className="font-serif text-xl font-semibold tracking-tight">Wise Pick</h1>
          </div>
          {analysis && (
            <button 
              onClick={() => { setAnalysis(null); setDecision(''); }}
              className="text-xs uppercase tracking-widest font-semibold opacity-50 hover:opacity-100 transition-opacity"
            >
              New Decision
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        {!analysis ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-8"
          >
            <div className="space-y-4">
              <h2 className="text-4xl md:text-6xl font-serif leading-tight">
                Clearer thoughts,<br />
                <span className="italic">better decisions.</span>
              </h2>
              <p className="text-lg text-[#666] max-w-xl mx-auto">
                What's on your mind? Describe your dilemma and let AI provide a structured perspective.
              </p>
            </div>

            <div className="w-full max-w-2xl relative group">
              <textarea
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                placeholder="Ex: Should I learn Rust or Go as my next language?"
                className="w-full min-h-[160px] p-6 text-xl font-serif bg-white border border-[#E5E5E5] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#1A1A1A]/5 focus:border-[#1A1A1A] transition-all resize-none group-hover:shadow-md"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleAnalyze();
                  }
                }}
              />
              <button
                onClick={handleAnalyze}
                disabled={loading || !decision.trim()}
                className="absolute bottom-4 right-4 bg-[#1A1A1A] text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2 hover:bg-[#333] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Wise Pick
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
              <div className="absolute -bottom-8 left-0 text-xs text-[#999] italic">
                Press Cmd+Enter to analyze
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Analysis Header & Summary */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="space-y-2 border-l-4 border-[#1A1A1A] pl-6">
                <span className="text-xs uppercase tracking-widest font-semibold opacity-40">The Decision</span>
                <h2 className="text-2xl md:text-3xl font-serif italic text-balance font-medium">"{decision}"</h2>
              </div>

              <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 shadow-sm">
                <div className="flex items-center gap-3 text-[#1A1A1A]/40 mb-4">
                  <Sparkles size={18} />
                  <h3 className="text-[10px] uppercase tracking-widest font-bold">Executive Brief</h3>
                </div>
                <div className="markdown-body prose prose-slate max-w-none prose-p:text-lg prose-p:font-serif prose-p:leading-relaxed prose-p:text-[#444]">
                  <ReactMarkdown>{analysis.summary}</ReactMarkdown>
                </div>
              </div>
            </motion.div>

            {/* Analysis View Selection - 3 Buttons */}
            <div className="space-y-4">
              <h3 className="text-center text-[10px] uppercase tracking-[0.2em] font-bold text-[#999]">Select Analysis Perspective</h3>
              <div className="flex flex-col sm:flex-row gap-4">
                {[
                  { id: 'proscons', icon: ClipboardList, label: 'Pros & Cons', desc: 'Balanced Trade-offs' },
                  { id: 'comparison', icon: TableIcon, label: 'Comparison Table', desc: 'Side-by-Side Analysis' },
                  { id: 'swot', icon: Target, label: 'SWOT Analysis', desc: 'Strategic Outlook' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`
                      flex-1 flex flex-col items-center gap-2 p-6 rounded-2xl text-center transition-all border-2
                      ${activeTab === tab.id 
                        ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-xl scale-[1.02]' 
                        : 'bg-white border-[#E5E5E5] text-[#1A1A1A] hover:border-[#1A1A1A]/30 hover:bg-[#F9F9F9]'}
                    `}
                  >
                    <tab.icon size={24} className={activeTab === tab.id ? 'text-white' : 'text-[#1A1A1A]'} />
                    <div className="font-serif text-lg font-bold">
                      {tab.label}
                    </div>
                    <span className={`text-[10px] uppercase tracking-widest opacity-60 ${activeTab === tab.id ? 'text-white' : 'text-[#666]'}`}>
                      {tab.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* View Content */}
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 md:p-10 shadow-sm min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'proscons' && (
                    <div className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        {/* Pros */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 text-green-600 font-bold uppercase text-xs tracking-widest">
                            <Plus size={16} /> Pros
                          </h4>
                          <div className="space-y-3">
                            {analysis.prosCons.filter(pc => pc.type === 'pro').map((pc, i) => (
                              <div key={i}>
                                <ProConItem item={pc} />
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Cons */}
                        <div className="space-y-4">
                          <h4 className="flex items-center gap-2 text-red-600 font-bold uppercase text-xs tracking-widest">
                            <Minus size={16} /> Cons
                          </h4>
                          <div className="space-y-3">
                            {analysis.prosCons.filter(pc => pc.type === 'con').map((pc, i) => (
                              <div key={i}>
                                <ProConItem item={pc} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'comparison' && (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr>
                            <th className="text-left py-4 px-6 border-b border-[#E5E5E5] text-xs uppercase tracking-widest font-bold opacity-40">Criteria</th>
                            {analysis.comparison.options.map(option => (
                              <th key={option} className="text-left py-4 px-6 border-b border-[#E5E5E5] font-serif text-lg font-medium">{option}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.comparison.criteria.map((criterion, i) => (
                            <tr key={i} className="group hover:bg-[#F9F9F9] transition-colors">
                              <td className="py-4 px-6 border-b border-[#F0F0F0] font-semibold text-sm">{criterion.name}</td>
                              {analysis.comparison.options.map(option => (
                                <td key={option} className="py-4 px-6 border-b border-[#F0F0F0] text-sm text-[#555] italic">
                                  {criterion.values.find(v => v.option === option)?.text || '—'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeTab === 'swot' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {[
                        { label: 'Strengths', items: analysis.swot.strengths, color: 'bg-blue-50 border-blue-100 text-blue-700' },
                        { label: 'Weaknesses', items: analysis.swot.weaknesses, color: 'bg-orange-50 border-orange-100 text-orange-700' },
                        { label: 'Opportunities', items: analysis.swot.opportunities, color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
                        { label: 'Threats', items: analysis.swot.threats, color: 'bg-rose-50 border-rose-100 text-rose-700' },
                      ].map((quad) => (
                        <div key={quad.label} className={`p-6 rounded-2xl border ${quad.color}`}>
                          <h4 className="text-xs uppercase tracking-[0.2em] font-black mb-4 opacity-70">{quad.label}</h4>
                          <ul className="space-y-2">
                             {quad.items.map((item, i) => (
                               <li key={i} className="flex gap-2 text-sm leading-relaxed font-medium">
                                 <span className="opacity-40 select-none">•</span>
                                 {item}
                                </li>
                             ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto px-6 py-12 border-t border-[#E5E5E5] mt-12 mb-20 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest opacity-30">
            <Info size={14} /> Wise Pick uses AI to simulate perspectives
          </div>
          <p className="text-sm text-[#999] max-w-lg">
            Remember that decisions are personal. This tool is meant to provoke thought, not make choices for you.
          </p>
        </div>
      </footer>
    </div>
  );
}

function ProConItem({ item }: { item: ProCon }) {
  const impactColors = {
    high: 'bg-slate-100 text-slate-900 border-slate-200',
    medium: 'bg-slate-50 text-slate-600 border-slate-100',
    low: 'bg-white text-slate-400 border-slate-100',
  };

  return (
    <div className="group p-4 bg-white border border-[#F0F0F0] rounded-xl hover:border-[#1A1A1A] transition-all flex items-start gap-3 shadow-sm hover:shadow-md">
      <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${item.type === 'pro' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {item.type === 'pro' ? <Plus size={12} strokeWidth={3} /> : <Minus size={12} strokeWidth={3} />}
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-relaxed">{item.text}</p>
        <span className={`text-[10px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded border ${impactColors[item.impact]}`}>
          {item.impact} Impact
        </span>
      </div>
    </div>
  );
}

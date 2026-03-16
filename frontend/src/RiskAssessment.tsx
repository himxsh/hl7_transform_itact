import { motion } from 'motion/react';
import { AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import Header from './Header';
import { useState, useEffect } from 'react';

interface Threat {
  id: string;
  category: string;
  name: string;
  description: string;
  likelihood: number;
  impact: number;
  risk_score: number;
  risk_level: string;
  existing_control: string;
  legal_reference: string;
  residual_risk: string;
}

interface RiskData {
  threats: Threat[];
  summary: { total: number; critical: number; high: number; medium: number; low: number };
  categories: Record<string, Threat[]>;
  average_risk_score: number;
  overall_risk_level: string;
  framework: string;
}

const levelColor: Record<string, string> = {
  CRITICAL: 'bg-red-100 text-red-700 border-red-300',
  HIGH: 'bg-orange-100 text-orange-700 border-orange-300',
  MEDIUM: 'bg-amber-100 text-amber-700 border-amber-300',
  LOW: 'bg-green-100 text-green-700 border-green-300',
};

const cellColor = (score: number) => {
  if (score >= 20) return 'bg-red-500 text-white';
  if (score >= 12) return 'bg-orange-400 text-white';
  if (score >= 6) return 'bg-amber-300 text-amber-900';
  return 'bg-green-200 text-green-800';
};

export default function RiskAssessment() {
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/risk-assessment');
      setData(await res.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // Build 5x5 heatmap
  const heatmap = Array.from({ length: 5 }, () => Array(5).fill(0));
  data?.threats.forEach(t => {
    heatmap[5 - t.impact][t.likelihood - 1] += 1;
  });

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="home" />
      <main className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="flex flex-col mb-16 text-center items-center">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8">
            Risk <span className="italic font-title text-primary-gold">Assessment</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed">
            Quantified risk analysis based on NIST SP 800-30 and ISO 27005 — {data?.summary.total || 0} threats across Confidentiality, Integrity, Availability, Legal, and Operational categories.
          </motion.p>
          <button onClick={fetchData} disabled={loading} className="mt-6 flex items-center gap-2 px-6 py-3 border border-primary-gold/30 text-primary-gold font-mono text-[10px] uppercase tracking-widest hover:bg-primary-gold hover:text-[#1c1a16] transition-all disabled:opacity-50">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {data && (
          <>
            {/* Summary Strip */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
              {(['critical', 'high', 'medium', 'low'] as const).map(level => (
                <div key={level} className={`border p-5 text-center ${levelColor[level.toUpperCase()]}`}>
                  <div className="font-title text-3xl">{data.summary[level]}</div>
                  <div className="font-mono text-[9px] uppercase tracking-widest">{level}</div>
                </div>
              ))}
              <div className="bg-white border border-primary-gold/10 p-5 text-center">
                <div className="font-title text-3xl text-primary-gold">{data.average_risk_score}</div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-dark/40">Avg Score</div>
              </div>
            </div>

            {/* 5x5 Risk Heatmap */}
            <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
              <h2 className="font-title text-2xl mb-6">Risk Heatmap <span className="font-mono text-[10px] text-neutral-dark/30">(Likelihood × Impact)</span></h2>
              <div className="bg-white border border-primary-gold/10 p-8 inline-block">
                <div className="flex">
                  <div className="flex flex-col justify-between pr-3 text-right font-mono text-[9px] text-neutral-dark/40 py-1">
                    {[5,4,3,2,1].map(n => <div key={n} className="h-14 flex items-center">{n}</div>)}
                  </div>
                  <div>
                    {heatmap.map((row, ri) => (
                      <div key={ri} className="flex gap-1 mb-1">
                        {row.map((count, ci) => {
                          const score = (5 - ri) * (ci + 1);
                          return (
                            <div key={ci} className={`w-14 h-14 flex items-center justify-center font-mono text-[11px] font-bold border ${count > 0 ? cellColor(score) : 'bg-neutral-dark/[0.02] border-neutral-dark/5 text-neutral-dark/10'}`}>
                              {count > 0 ? count : '—'}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                    <div className="flex gap-1 mt-2">
                      {[1,2,3,4,5].map(n => <div key={n} className="w-14 text-center font-mono text-[9px] text-neutral-dark/40">{n}</div>)}
                    </div>
                    <div className="text-center font-mono text-[9px] text-neutral-dark/30 mt-1 uppercase tracking-widest">Likelihood →</div>
                  </div>
                </div>
                <div className="font-mono text-[9px] text-neutral-dark/30 -rotate-90 absolute -left-6 top-1/2 uppercase tracking-widest" style={{ position: 'relative', left: -20, top: -80 }}>Impact ↑</div>
              </div>
            </motion.section>

            {/* Threats by Category */}
            {(Object.entries(data.categories) as [string, Threat[]][]).map(([cat, threats], catIdx) => (
              <motion.section key={cat} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: catIdx * 0.08 }} className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                  <Shield size={16} className="text-primary-gold" />
                  <h3 className="font-title text-xl">{cat}</h3>
                  <span className="font-mono text-[9px] text-neutral-dark/30">{threats.length} threats</span>
                </div>
                <div className="space-y-4">
                  {threats.map((t: Threat) => (
                    <div key={t.id} className="bg-white border border-primary-gold/10 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="font-mono text-[10px] text-primary-gold font-bold">{t.id}</span>
                          <span className="font-title text-[15px]">{t.name}</span>
                          <span className={`font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 border rounded-sm ${levelColor[t.risk_level]}`}>{t.risk_level}</span>
                        </div>
                        <div className={`w-10 h-10 flex items-center justify-center font-mono text-[13px] font-bold ${cellColor(t.risk_score)}`}>{t.risk_score}</div>
                      </div>
                      <p className="font-sans text-[12px] text-neutral-dark/50 mb-3">{t.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-mono">
                        <div><span className="text-neutral-dark/30 block">Likelihood</span><span>{t.likelihood}/5</span></div>
                        <div><span className="text-neutral-dark/30 block">Impact</span><span>{t.impact}/5</span></div>
                        <div><span className="text-neutral-dark/30 block">Control</span><span className="text-neutral-dark/60">{t.existing_control}</span></div>
                        <div><span className="text-neutral-dark/30 block">Legal</span><span className="text-primary-gold">{t.legal_reference}</span></div>
                      </div>
                      <p className="font-mono text-[9px] text-neutral-dark/30 mt-2 italic">Residual: {t.residual_risk}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

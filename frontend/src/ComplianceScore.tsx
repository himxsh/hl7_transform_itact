import { motion } from 'motion/react';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import Header from './Header';
import { useState, useEffect } from 'react';

interface Check {
  id: string;
  category: string;
  requirement: string;
  legal_reference: string;
  status: string;
  score: number;
  evidence: string;
  recommendation: string;
}

interface Category {
  name: string;
  score: number;
  max_score: number;
  checks: Check[];
  weight: number;
}

interface ScoreData {
  overall_score: number;
  grade: string;
  total_checks: number;
  passed: number;
  partial: number;
  failed: number;
  categories: Record<string, Category>;
}

const gradeColor: Record<string, string> = {
  A: 'text-green-500', B: 'text-lime-500', C: 'text-amber-500',
  D: 'text-orange-500', F: 'text-red-500',
};

const statusIcon = (s: string) => {
  if (s === 'PASS') return <CheckCircle2 size={14} className="text-green-500" />;
  if (s === 'PARTIAL') return <AlertTriangle size={14} className="text-amber-500" />;
  return <XCircle size={14} className="text-red-500" />;
};

export default function ComplianceScore() {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compliance-score');
      setData(await res.json());
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="home" />
      <main className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="flex flex-col mb-16 text-center items-center">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8">
            Compliance <span className="italic font-title text-primary-gold">Score</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed">
            Real-time compliance assessment across DPDP Act, IT Act 2000, and GDPR — scored across 5 categories with 15 individual checks.
          </motion.p>
          <button onClick={fetchData} disabled={loading} className="mt-6 flex items-center gap-2 px-6 py-3 border border-primary-gold/30 text-primary-gold font-mono text-[10px] uppercase tracking-widest hover:bg-primary-gold hover:text-[#1c1a16] transition-all disabled:opacity-50">
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {data && (
          <>
            {/* Score Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-primary-gold/10 p-10 mb-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-title text-3xl mb-2">Overall Compliance</h2>
                  <p className="font-mono text-[10px] text-neutral-dark/40">{data.total_checks} checks · IS/ISO 27001 framework</p>
                </div>
                <div className="text-right">
                  <div className={`font-title text-7xl ${gradeColor[data.grade] || 'text-primary-gold'}`}>{data.grade}</div>
                  <div className="font-mono text-[9px] text-neutral-dark/40 uppercase tracking-widest">{data.overall_score}/100</div>
                </div>
              </div>
              <div className="w-full bg-primary-gold/10 h-5 rounded-full overflow-hidden mb-6">
                <motion.div initial={{ width: 0 }} animate={{ width: `${data.overall_score}%` }} transition={{ duration: 1.2 }} className="h-full rounded-full bg-primary-gold" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-green-50 border border-green-200 p-5 text-center"><div className="font-title text-3xl text-green-600">{data.passed}</div><div className="font-mono text-[9px] uppercase tracking-widest text-green-500">Passed</div></div>
                <div className="bg-amber-50 border border-amber-200 p-5 text-center"><div className="font-title text-3xl text-amber-600">{data.partial}</div><div className="font-mono text-[9px] uppercase tracking-widest text-amber-500">Partial</div></div>
                <div className="bg-red-50 border border-red-200 p-5 text-center"><div className="font-title text-3xl text-red-600">{data.failed}</div><div className="font-mono text-[9px] uppercase tracking-widest text-red-500">Failed</div></div>
              </div>
            </motion.div>

            {/* Categories */}
            <div className="space-y-10">
              {(Object.entries(data.categories) as [string, Category][]).map(([key, cat], catIdx) => (
                <motion.section key={key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: catIdx * 0.08 }}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-primary-gold" size={18} />
                      <h3 className="font-title text-2xl">{cat.name}</h3>
                      <span className="font-mono text-[9px] text-neutral-dark/30">Weight: {(cat.weight * 100).toFixed(0)}%</span>
                    </div>
                    <span className="font-title text-2xl text-primary-gold">{cat.score}/100</span>
                  </div>
                  <div className="w-full bg-primary-gold/10 h-2 rounded-full overflow-hidden mb-6">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${cat.score}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="h-full rounded-full bg-primary-gold" />
                  </div>
                  <div className="space-y-3">
                    {cat.checks.map((check: Check) => (
                      <div key={check.id} className="bg-white border border-primary-gold/10 p-5 flex items-start gap-4">
                        {statusIcon(check.status)}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1 flex-wrap">
                            <span className="font-mono text-[10px] text-primary-gold font-bold">{check.id}</span>
                            <span className="font-sans text-[13px] text-neutral-dark">{check.requirement}</span>
                          </div>
                          <p className="font-mono text-[9px] text-neutral-dark/40 mb-1">{check.evidence}</p>
                          <span className="font-mono text-[9px] text-primary-gold/60">{check.legal_reference}</span>
                        </div>
                        <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 border rounded-sm ${check.status === 'PASS' ? 'bg-green-50 text-green-600 border-green-200' : check.status === 'PARTIAL' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-red-50 text-red-600 border-red-200'}`}>{check.status}</span>
                      </div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

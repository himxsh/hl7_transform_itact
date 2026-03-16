import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Search, AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import Header from './Header';
import { useState } from 'react';

interface Finding {
  severity: string;
  category: string;
  file: string;
  description: string;
  legal_reference: string;
  line_number: number | null;
  evidence: string | null;
}

interface ScanResult {
  findings: Finding[];
  summary: { total: number; critical: number; high: number; medium: number; low: number };
  risk_score: number;
  files_scanned: number;
  scan_status: string;
}

const severityConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  CRITICAL: { color: 'bg-red-100 text-red-700 border-red-300', icon: <XCircle size={16} className="text-red-600" /> },
  HIGH: { color: 'bg-orange-100 text-orange-700 border-orange-300', icon: <AlertTriangle size={16} className="text-orange-600" /> },
  MEDIUM: { color: 'bg-amber-100 text-amber-700 border-amber-300', icon: <AlertTriangle size={16} className="text-amber-600" /> },
  LOW: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <Info size={16} className="text-blue-600" /> },
};

export default function BreachDetection() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runScan = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/breach-scan', { method: 'POST' });
      const json = await res.json();
      setResult(json);
    } catch {
      setError('Backend not running. Start the FastAPI server to run a breach scan.');
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (score: number) => {
    if (score >= 75) return 'text-red-600';
    if (score >= 50) return 'text-orange-500';
    if (score >= 25) return 'text-amber-500';
    return 'text-green-500';
  };

  const riskBarColor = (score: number) => {
    if (score >= 75) return 'bg-red-500';
    if (score >= 50) return 'bg-orange-500';
    if (score >= 25) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="home" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Hero */}
        <div className="flex flex-col mb-20 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-3xl"
          >
            Breach <span className="italic font-title text-primary-gold">Detection</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            Automated scanning for residual PII leaks, integrity violations, and anomalies in processed HL7 output — as mandated by DPDP Act §15.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={runScan}
            disabled={loading}
            className="mt-8 flex items-center gap-3 px-10 py-4 bg-primary-gold text-[#1c1a16] font-mono text-xs uppercase tracking-widest hover:bg-primary-gold/90 transition-all border border-primary-gold disabled:opacity-50"
          >
            <Search size={14} className={loading ? 'animate-pulse' : ''} />
            {loading ? 'Scanning...' : 'Run Breach Scan'}
          </motion.button>

          {error && (
            <p className="mt-4 font-sans text-[12px] text-red-500">{error}</p>
          )}
        </div>

        {/* Scan Types Reference */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Residual PII Scan', desc: 'Regex-based detection of Aadhaar, PAN, email, phone, SSN patterns in NTE segments that may have survived anonymisation.', legal: 'IT Act §72A, DPDP §15', icon: '🔍' },
              { title: 'Integrity Verification', desc: 'Re-computes SHA-256 hash of every HL7 message body and compares against the stored ZSH segment to detect tampering.', legal: 'IT Act §14, IT Act §43A', icon: '🛡️' },
              { title: 'Anomaly Detection', desc: 'Statistical analysis of file sizes, duplicate content detection, and empty file identification across the output directory.', legal: 'IT Act §43, DPDP §8(4)', icon: '📊' },
            ].map((scan, idx) => (
              <div key={scan.title} className="bg-white border border-primary-gold/10 p-8 hover:border-primary-gold/30 transition-all">
                <span className="text-2xl block mb-4">{scan.icon}</span>
                <h3 className="font-title text-xl mb-2">{scan.title}</h3>
                <p className="font-sans text-[12px] text-neutral-dark/50 leading-relaxed mb-3">{scan.desc}</p>
                <span className="font-mono text-[9px] text-primary-gold/60">{scan.legal}</span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Results */}
        {result && (
          <>
            {/* Risk Score */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-16"
            >
              <div className="bg-white border border-primary-gold/10 p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="font-title text-3xl mb-2">Risk Assessment</h2>
                    <p className="font-mono text-[10px] text-neutral-dark/40">{result.files_scanned} files scanned · {result.summary.total} findings</p>
                  </div>
                  <div className="text-right">
                    <div className={`font-title text-6xl ${riskColor(result.risk_score)}`}>{result.risk_score}</div>
                    <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-dark/40">Risk Score /100</div>
                  </div>
                </div>

                {/* Risk Bar */}
                <div className="w-full bg-neutral-dark/5 h-4 rounded-full overflow-hidden mb-8">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.risk_score}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full rounded-full ${riskBarColor(result.risk_score)}`}
                  />
                </div>

                {/* Severity Breakdown */}
                <div className="grid grid-cols-4 gap-4">
                  {(
                    [
                      { label: 'Critical', count: result.summary.critical, color: 'text-red-600 bg-red-50 border-red-200' },
                      { label: 'High', count: result.summary.high, color: 'text-orange-600 bg-orange-50 border-orange-200' },
                      { label: 'Medium', count: result.summary.medium, color: 'text-amber-600 bg-amber-50 border-amber-200' },
                      { label: 'Low', count: result.summary.low, color: 'text-blue-600 bg-blue-50 border-blue-200' },
                    ] as const
                  ).map(s => (
                    <div key={s.label} className={`border p-6 text-center ${s.color}`}>
                      <div className="font-title text-3xl">{s.count}</div>
                      <div className="font-mono text-[9px] uppercase tracking-widest">{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Findings List */}
            {result.findings.length > 0 ? (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-3 mb-10">
                  <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
                    <ShieldAlert className="text-primary-gold" size={20} />
                  </div>
                  <h2 className="font-title text-3xl">Findings</h2>
                </div>

                <div className="space-y-4">
                  {result.findings.map((finding, idx) => {
                    const config = severityConfig[finding.severity] || severityConfig.LOW;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white border border-primary-gold/10 p-6 flex items-start gap-4"
                      >
                        {config.icon}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className={`font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 border rounded-sm ${config.color}`}>{finding.severity}</span>
                            <span className="font-mono text-[9px] text-neutral-dark/40">{finding.category}</span>
                            <span className="font-mono text-[9px] text-primary-gold bg-primary-gold/10 px-2 py-0.5">{finding.file}</span>
                            {finding.line_number && (
                              <span className="font-mono text-[9px] text-neutral-dark/30">Line {finding.line_number}</span>
                            )}
                          </div>
                          <p className="font-sans text-[13px] text-neutral-dark/60 mb-1">{finding.description}</p>
                          <p className="font-mono text-[9px] text-primary-gold/60">{finding.legal_reference}</p>
                          {finding.evidence && (
                            <p className="font-mono text-[9px] text-red-500 mt-1">{finding.evidence}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.section>
            ) : (
              <div className="bg-green-50 border border-green-200 p-10 text-center">
                <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4" />
                <h3 className="font-title text-2xl text-green-700 mb-2">All Clear</h3>
                <p className="font-sans text-[13px] text-green-600">No breaches detected. All {result.files_scanned} files passed integrity, PII, and anomaly checks.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

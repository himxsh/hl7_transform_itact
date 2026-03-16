import { motion } from 'motion/react';
import { Lock, Clock, ShieldCheck, BarChart3, RefreshCw } from 'lucide-react';
import Header from './Header';
import { useState, useEffect } from 'react';

interface AlgoResult {
  name: string;
  time_ms: number;
  output_size_bytes: number;
  digest_preview: string;
  full_digest: string;
  legal_reference: string;
  algorithm_type: string;
  key_size_bits: number;
}

interface RecordComparison {
  subject_id: string;
  results: AlgoResult[];
}

const algorithmInfo = [
  { name: 'SHA-256', type: 'Hash', bits: 256, standard: 'NIST FIPS 180-4', useCase: 'Tamper-evidence (our ZSH segment)', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  { name: 'AES-256-CBC', type: 'Symmetric Cipher', bits: 256, standard: 'NIST FIPS 197', useCase: 'Encryption at rest — reversible', color: 'bg-amber-100 text-amber-700 border-amber-300' },
  { name: 'HMAC-SHA512', type: 'MAC', bits: 352, standard: 'RFC 2104', useCase: 'Key-bound authentication + integrity', color: 'bg-green-100 text-green-700 border-green-300' },
  { name: 'SHA3-256', type: 'Hash', bits: 256, standard: 'NIST FIPS 202', useCase: 'Future-proof Keccak-family hash', color: 'bg-purple-100 text-purple-700 border-purple-300' },
];

export default function EncryptionComparison() {
  const [data, setData] = useState<RecordComparison[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8000/api/encryption-comparison');
      const json = await res.json();
      setData(json.results || []);
    } catch (e) {
      setError('Backend not running. Showing algorithm reference data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Calculate averages from real data
  const averages = data.length > 0 ? algorithmInfo.map((info) => {
    const allResults = data.flatMap(r => r.results.filter(a => a.name === info.name));
    const avgTime = allResults.reduce((s, r) => s + r.time_ms, 0) / (allResults.length || 1);
    const avgSize = allResults.reduce((s, r) => s + r.output_size_bytes, 0) / (allResults.length || 1);
    return { ...info, avgTime, avgSize };
  }) : null;

  const maxTime = averages ? Math.max(...averages.map(a => a.avgTime)) : 1;

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
            Encryption <span className="italic font-title text-primary-gold">Comparison</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            Four cryptographic algorithms applied to every HL7 message — comparing performance, output size, and security properties per IT Act §43A requirements.
          </motion.p>
          <button
            onClick={fetchData}
            disabled={loading}
            className="mt-6 flex items-center gap-2 px-6 py-3 border border-primary-gold/30 text-primary-gold font-mono text-[10px] uppercase tracking-widest hover:bg-primary-gold hover:text-[#1c1a16] transition-all disabled:opacity-50"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Loading...' : 'Refresh Data'}
          </button>
        </div>

        {/* Algorithm Reference Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Lock className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Algorithm Specifications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {algorithmInfo.map((algo, idx) => (
              <motion.div
                key={algo.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white border border-primary-gold/10 p-8 hover:border-primary-gold/30 transition-all"
              >
                <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 border rounded-sm inline-block mb-4 ${algo.color}`}>{algo.type}</span>
                <h3 className="font-title text-xl mb-2">{algo.name}</h3>
                <div className="space-y-2 font-sans text-[12px] text-neutral-dark/50">
                  <div><span className="text-neutral-dark/30">Key Size:</span> {algo.bits} bits</div>
                  <div><span className="text-neutral-dark/30">Standard:</span> {algo.standard}</div>
                  <div><span className="text-neutral-dark/30">Use Case:</span> {algo.useCase}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Performance Bar Chart */}
        {averages && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24"
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
                <BarChart3 className="text-primary-gold" size={20} />
              </div>
              <h2 className="font-title text-3xl">Performance Comparison</h2>
              <span className="font-mono text-[9px] text-neutral-dark/30 ml-2">(avg across {data.length} records)</span>
            </div>

            <div className="bg-white border border-primary-gold/10 p-10 space-y-8">
              {averages.map((algo, idx) => (
                <div key={algo.name}>
                  <div className="flex justify-between text-[11px] font-mono mb-2">
                    <span className="text-neutral-dark/60 font-bold">{algo.name}</span>
                    <span className="text-primary-gold font-bold">{algo.avgTime.toFixed(4)} ms</span>
                  </div>
                  <div className="w-full bg-primary-gold/10 h-6 rounded-sm overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(5, (algo.avgTime / maxTime) * 100)}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                      className={`h-full rounded-sm ${idx === 0 ? 'bg-blue-400' : idx === 1 ? 'bg-amber-400' : idx === 2 ? 'bg-green-400' : 'bg-purple-400'}`}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-neutral-dark/30 mt-1">
                    <span>Output: {algo.avgSize.toFixed(0)} bytes</span>
                    <span>{algo.standard}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Per-Record Table */}
        {data.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
                <ShieldCheck className="text-primary-gold" size={20} />
              </div>
              <h2 className="font-title text-3xl">Per-Record Results</h2>
            </div>

            <div className="border border-primary-gold/10 bg-white overflow-hidden">
              <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-4 py-4">
                <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Patient</div>
                <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold text-center">SHA-256</div>
                <div className="col-span-3 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold text-center">AES-256-CBC</div>
                <div className="col-span-3 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold text-center">HMAC-SHA512</div>
                <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold text-center">SHA3-256</div>
              </div>
              {data.slice(0, 20).map((record, idx) => (
                <div key={record.subject_id} className={`grid grid-cols-12 gap-0 px-4 py-3 border-b border-primary-gold/5 ${idx % 2 === 0 ? '' : 'bg-primary-gold/[0.01]'}`}>
                  <div className="col-span-2 font-mono text-[11px] text-primary-gold font-bold">{record.subject_id}</div>
                  {record.results.map((r) => (
                    <div key={r.name} className={`${r.name === 'AES-256-CBC' || r.name === 'HMAC-SHA512' ? 'col-span-3' : 'col-span-2'} text-center`}>
                      <div className="font-mono text-[10px] text-neutral-dark/60">{r.time_ms.toFixed(3)}ms</div>
                      <div className="font-mono text-[8px] text-neutral-dark/30 truncate">{r.digest_preview}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Fallback when no data */}
        {data.length === 0 && !loading && (
          <div className="bg-primary-gold/5 border border-primary-gold/10 p-10 text-center">
            <Clock size={32} className="text-primary-gold mx-auto mb-4" />
            <p className="font-sans text-neutral-dark/50">
              {error || 'No encryption comparison data yet. Run the pipeline from the Dashboard to generate comparison data.'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

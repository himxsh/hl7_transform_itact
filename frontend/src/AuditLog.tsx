import { motion } from 'motion/react';
import { FileText, Clock, Filter, RefreshCw, Trash2 } from 'lucide-react';
import Header from './Header';
import { useState, useEffect } from 'react';

interface AuditEntry {
  timestamp: string;
  event_type: string;
  subject_id: string | null;
  details: Record<string, any>;
  legal_reference: string;
  severity: string;
}

interface AuditStats {
  total_entries: number;
  event_counts: Record<string, number>;
  severity_counts: Record<string, number>;
  first_entry: string | null;
  last_entry: string | null;
}

const severityColors: Record<string, string> = {
  INFO: 'bg-blue-50 text-blue-600 border-blue-200',
  WARNING: 'bg-amber-50 text-amber-600 border-amber-200',
  ERROR: 'bg-red-50 text-red-600 border-red-200',
  CRITICAL: 'bg-red-100 text-red-700 border-red-300',
};

const eventIcons: Record<string, string> = {
  PIPELINE_START: '🚀',
  RECORD_INGESTED: '📥',
  PII_DETECTED: '🔍',
  PII_ANONYMISED: '🔒',
  INTEGRITY_SEALED: '🛡️',
  ENCRYPTION_APPLIED: '🔐',
  RECORD_COMPLETE: '✅',
  BREACH_SCAN_START: '🔎',
  BREACH_DETECTED: '🚨',
  PIPELINE_END: '🏁',
};

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.set('event_type', filter);
      params.set('limit', '200');
      const res = await fetch(`/api/audit-log?${params}`);
      const json = await res.json();
      setEntries(json.entries || []);
      setStats(json.stats || null);
    } catch {
      // Backend not running
    } finally {
      setLoading(false);
    }
  };

  const clearLog = async () => {
    try {
      await fetch('/api/audit-log/clear', { method: 'POST' });
      fetchData();
    } catch {}
  };

  useEffect(() => { fetchData(); }, [filter]);

  const eventTypes = stats?.event_counts ? Object.keys(stats.event_counts) : [];

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="home" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Hero */}
        <div className="flex flex-col mb-16 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-3xl"
          >
            Audit <span className="italic font-title text-primary-gold">Log</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            JSON-structured compliance trail — every pipeline action is logged with timestamps, legal references, and severity levels per IT Act §67C.
          </motion.p>
        </div>

        {/* Stats Strip */}
        {stats && stats.total_entries > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12"
          >
            <div className="bg-white border border-primary-gold/10 p-6 text-center">
              <div className="font-title text-3xl text-primary-gold">{stats.total_entries}</div>
              <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-dark/40">Total Entries</div>
            </div>
            {Object.entries(stats.severity_counts).map(([sev, count]) => (
              <div key={sev} className="bg-white border border-primary-gold/10 p-6 text-center">
                <div className="font-title text-3xl text-primary-gold">{count}</div>
                <div className="font-mono text-[9px] uppercase tracking-widest text-neutral-dark/40">{sev}</div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-primary-gold/60" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-dark/40">Filter:</span>
            </div>
            <button
              onClick={() => setFilter('all')}
              className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 border transition-all ${filter === 'all' ? 'bg-primary-gold text-[#1c1a16] border-primary-gold' : 'border-primary-gold/20 text-neutral-dark/50 hover:border-primary-gold/50'}`}
            >
              All
            </button>
            {eventTypes.map(et => (
              <button
                key={et}
                onClick={() => setFilter(et)}
                className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 border transition-all ${filter === et ? 'bg-primary-gold text-[#1c1a16] border-primary-gold' : 'border-primary-gold/20 text-neutral-dark/50 hover:border-primary-gold/50'}`}
              >
                {et.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchData} className="flex items-center gap-1 px-3 py-1.5 border border-primary-gold/20 text-primary-gold font-mono text-[9px] uppercase tracking-widest hover:bg-primary-gold/5 transition-all">
              <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button onClick={clearLog} className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 font-mono text-[9px] uppercase tracking-widest hover:bg-red-50 transition-all">
              <Trash2 size={10} />
              Clear
            </button>
          </div>
        </div>

        {/* Log Entries */}
        {entries.length > 0 ? (
          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            {entries.map((entry, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(idx * 0.02, 0.5) }}
                className={`p-5 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-primary-gold/[0.01]'}`}
              >
                <div className="flex items-start gap-4">
                  <span className="text-lg">{eventIcons[entry.event_type] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-mono text-[11px] font-bold text-neutral-dark">{entry.event_type.replace(/_/g, ' ')}</span>
                      <span className={`font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 border rounded-sm ${severityColors[entry.severity] || ''}`}>{entry.severity}</span>
                      {entry.subject_id && (
                        <span className="font-mono text-[9px] text-primary-gold bg-primary-gold/10 px-2 py-0.5">ID: {entry.subject_id}</span>
                      )}
                    </div>
                    {entry.legal_reference && (
                      <div className="font-mono text-[9px] text-primary-gold/60 mb-1">{entry.legal_reference}</div>
                    )}
                    {Object.keys(entry.details).length > 0 && (
                      <div className="font-mono text-[9px] text-neutral-dark/40 truncate">
                        {JSON.stringify(entry.details).slice(0, 120)}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-mono text-[9px] text-neutral-dark/30">{entry.timestamp?.replace('T', ' ').slice(0, 19)}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-primary-gold/5 border border-primary-gold/10 p-10 text-center">
            <Clock size={32} className="text-primary-gold mx-auto mb-4" />
            <p className="font-sans text-neutral-dark/50">No audit entries yet. Run the pipeline to generate the compliance trail.</p>
          </div>
        )}
      </main>
    </div>
  );
}

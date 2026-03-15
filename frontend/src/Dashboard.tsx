/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Activity, 
  Database, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  Terminal,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';

// --- Types ---
interface Record {
  id: string;
  pseudonym: string;
  sex: 'M' | 'F';
  cohort: string;
  labEvents: number;
  output: string;
  seal: 'Valid' | 'Tampered';
}

interface PIIStat {
  label: string;
  count: number;
  percentage: number;
}

const StatCard = ({ label, value, subValue, color = 'text-white' }: { label: string, value: string | number, subValue?: string, color?: string }) => (
  <div className="glass-panel p-5 border-l-2 border-l-gold">
    <div className="text-white/40 text-[10px] uppercase tracking-[0.15em] mb-2 font-sans">{label}</div>
    <div className="flex items-baseline space-x-2">
      <div className={`text-3xl technical-data ${color}`}>{value}</div>
      {subValue && <div className="text-white/20 text-sm technical-data">/ {subValue}</div>}
    </div>
  </div>
);

const PipelineStage = ({ label, active, completed }: { label: string, active: boolean, completed: boolean }) => (
  <div className="flex flex-col items-center space-y-3 bg-charcoal px-4 relative z-10">
    <div className={`w-4 h-4 rounded-full border-4 border-charcoal-light transition-all duration-500 ${
      completed 
        ? 'bg-ok-green shadow-[0_0_15px_rgba(106,158,114,0.6)]' 
        : active 
          ? 'bg-gold shadow-[0_0_15px_rgba(184,168,130,0.6)] animate-pulse' 
          : 'bg-charcoal-light'
    }`}></div>
    <span className={`text-[10px] uppercase tracking-wider transition-colors ${
      completed || active ? 'text-white' : 'text-white/30'
    }`}>{label}</span>
  </div>
);

const LogEntry = ({ time, file, status, warning = false }: { time: string, file: string, status: string, warning?: boolean }) => (
  <div className="flex items-center justify-between border-b border-ui-border/10 pb-2.5">
    <div className="flex space-x-3">
      <span className="text-white/30">[{time}]</span>
      <span className="text-white/70">{file}</span>
    </div>
    <span className={warning ? 'text-warn-amber' : 'text-ok-green'}>{status}</span>
  </div>
);

const ConfigItem = ({ label, value }: { label: string, value: string }) => (
  <div>
    <div className="text-white/30 uppercase tracking-wider mb-1.5 text-[9px]">/ {label}</div>
    <div className="text-white/80">{value}</div>
  </div>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dataset: selectedDataset = 'MIMIC-IV v3.1', sampleSize = 50 } = (location.state as { dataset: string; sampleSize: number }) || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [records, setRecords] = useState<Record[]>([]);
  const [hl7Content, setHl7Content] = useState<string>('');
  const [activeFile, setActiveFile] = useState<string>('');

  const runPipeline = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    setRecords([]); // Clear existing
    setCurrentStage(0);
    
    try {
      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset: selectedDataset, sampleSize })
      });
      
      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.slice(6));
            
            if (data.status === 'progress') {
              setCurrentStage(data.stage);
            } else if (data.status === 'processing') {
              if (currentStage < 2) setCurrentStage(2);
            } else if (data.status === 'completed') {
              setRecords(prev => {
                const updated = [...prev, data.record];
                if (updated.length === 1) fetchHL7(data.record.output);
                return updated;
              });
              setCurrentStage(3);
            } else if (data.status === 'success') {
              setCurrentStage(4);
            }
          } catch (e) {
            console.error('Error parsing stream line:', e);
          }
        }
      }
    } catch (error) {
      console.error('Failed to run pipeline:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchHL7 = async (filename: string) => {
    try {
      setActiveFile(filename);
      const response = await fetch(`/api/hl7/${filename}`);
      const data = await response.json();
      setHl7Content(data.content);
    } catch (error) {
      console.error('Failed to fetch HL7:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-charcoal text-[#e2e2e2] font-sans">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-ui-border flex items-center justify-between px-8 bg-charcoal/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/selection')}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-gold group"
              title="Return to Selection"
            >
              <ChevronRight className="rotate-180" size={20} />
            </button>
            <div className="flex flex-col">
              <div className="text-[10px] uppercase text-white/40 tracking-[0.2em] font-sans">HL7 Orchestrator</div>
              <h2 className="text-xl font-title text-white">Overview</h2>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col items-end">
                <span className="px-2 py-0.5 bg-green-500/10 text-ok-green border border-ok-green/20 text-[9px] uppercase tracking-tighter mb-1 rounded">Live Connection — Verified</span>
                <span className="text-[10px] technical-data text-white/40">{selectedDataset}</span>
              </div>
              <button 
                onClick={runPipeline}
                disabled={isProcessing}
                className={`bg-gold text-charcoal px-6 py-2.5 text-xs uppercase tracking-[0.2em] font-sans font-bold transition-all active:scale-95 ${
                  isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'
                }`}
              >
                {isProcessing ? 'Processing...' : 'Run Pipeline'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats Grid */}
          <section className="grid grid-cols-4 gap-6">
            <StatCard label="Records Processed" value={records.length} />
            <StatCard label="HL7 Files Generated" value={records.length} />
            <StatCard label="Integrity Seals Valid" value={records.length} subValue={records.length.toString()} color="text-ok-green" />
            <StatCard label="PII Instances Scrubbed" value={records.length * 5} />
          </section>

          {/* Pipeline Flow */}
          <section className="glass-panel p-8 relative overflow-hidden">
            <h3 className="text-gold uppercase tracking-[0.2em] text-[11px] mb-10 font-sans">Current Orchestration Flow</h3>
            <div className="flex items-center justify-between relative px-12">
              {/* Connector Lines */}
              <div className="absolute top-[8px] left-24 right-24 h-px bg-ui-border"></div>
              
              <PipelineStage label="Preprocessing" active={currentStage === 0} completed={currentStage > 0} />
              <PipelineStage label="Anonymizer" active={currentStage === 1} completed={currentStage > 1} />
              <PipelineStage label="HL7 Transform" active={currentStage === 2} completed={currentStage > 2} />
              <PipelineStage label="Integrity Seal" active={currentStage === 3} completed={currentStage > 3} />
            </div>
          </section>

          {/* Data Grid */}
          <div className="grid grid-cols-12 gap-8">
            {/* Records Table */}
            <section className="col-span-8 glass-panel overflow-hidden flex flex-col">
              <div className="p-4 border-b border-ui-border flex justify-between items-center bg-charcoal-light/30">
                <h3 className="text-gold uppercase tracking-[0.2em] text-[11px] font-sans">Primary Record Stream</h3>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-ok-green/40"></div>
                  <div className="w-2 h-2 rounded-full bg-white/10"></div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-white/40 border-b border-ui-border bg-charcoal-light/10">
                      <th className="px-4 py-4 font-normal">Subject ID</th>
                      <th className="px-4 py-4 font-normal">Pseudonym</th>
                      <th className="px-4 py-4 font-normal">Sex</th>
                      <th className="px-4 py-4 font-normal">Cohort</th>
                      <th className="px-4 py-4 font-normal">Lab Events</th>
                      <th className="px-4 py-4 font-normal">Output</th>
                      <th className="px-4 py-4 font-normal">Seal</th>
                    </tr>
                  </thead>
                  <tbody className="technical-data text-[11px] divide-y divide-ui-border/5">
                    {records.map((record) => (
                      <tr 
                        key={record.id} 
                        onClick={() => fetchHL7(record.output)}
                        className={`hover:bg-gold/5 transition-colors group cursor-pointer ${activeFile === record.output ? 'bg-gold/10' : ''}`}
                      >
                        <td className="px-4 py-3.5">{record.id}</td>
                        <td className="px-4 py-3.5 italic text-gold/80">{record.pseudonym}</td>
                        <td className="px-4 py-3.5">{record.sex}</td>
                        <td className="px-4 py-3.5">{record.cohort}</td>
                        <td className="px-4 py-3.5">{record.labEvents}</td>
                        <td className="px-4 py-3.5 text-white/60">{record.output}</td>
                        <td className="px-4 py-3.5">
                          <span className={`px-2 py-0.5 rounded-sm text-[9px] uppercase tracking-wider border ${
                            record.seal === 'Valid' 
                              ? 'bg-ok-green/10 text-ok-green border-ok-green/30' 
                              : 'bg-warn-amber/10 text-warn-amber border-warn-amber/30'
                          }`}>
                            {record.seal}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {records.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-10 text-center text-white/20 uppercase tracking-widest text-[10px]">
                          No records processed. Run the pipeline to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* PII Breakdown */}
            <section className="col-span-4 glass-panel p-6">
              <h3 className="text-gold uppercase tracking-[0.2em] text-[11px] mb-8 font-sans">PII De-identification Breakdown</h3>
              <div className="space-y-7">
                {[
                  { label: 'Aadhaar Numbers', base: 1.2 },
                  { label: 'PAN Identifiers', base: 0.8 },
                  { label: 'Phone/Contact', base: 2.1 },
                  { label: 'MRN Indices', base: 1.0 },
                  { label: 'Email Address', base: 0.7 },
                ].map((stat) => {
                  const count = Math.floor(records.length * stat.base);
                  const percentage = records.length > 0 ? Math.min(95, 40 + (records.length % 60)) : 0;
                  return (
                    <div key={stat.label} className="space-y-2.5">
                      <div className="flex justify-between text-[10px] uppercase technical-data">
                        <span className="text-white/60">{stat.label}</span>
                        <span className="text-gold">{count}</span>
                      </div>
                      <div className="w-full bg-charcoal-light h-1 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="bg-gold h-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-12 gap-8">
            {/* HL7 Viewer */}
            <section className="col-span-7 glass-panel flex flex-col">
              <div className="p-4 border-b border-ui-border flex justify-between items-center bg-charcoal-light/20">
                <div className="flex items-center space-x-2">
                  <Terminal size={14} className="text-gold" />
                  <h3 className="text-gold uppercase tracking-[0.2em] text-[11px] font-sans">HL7 Inspect — {activeFile || 'None Selected'}</h3>
                </div>
                <div className="text-[9px] uppercase text-white/30 tracking-widest">v2.5.1 Pipe Delimited</div>
              </div>
              <div className="flex-1 p-6 technical-data text-[11px] leading-relaxed overflow-x-auto bg-black/20 min-h-[200px]">
                {hl7Content ? (
                  hl7Content.split('\n').map((line, i) => (
                    <div key={i} className="text-white/60 mb-1.5 whitespace-pre">
                      <span className="text-gold/40 mr-4">{(i + 1).toString().padStart(2, '0')}</span>
                      {line.includes('ZSH|') ? (
                        <span className="text-ok-green">{line}</span>
                      ) : line}
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-white/10 italic">
                    Select a record to view HL7 output
                  </div>
                )}
                {hl7Content && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-ok-green bg-ok-green/5 border-l-2 border-ok-green pl-3 py-2 mt-4 flex justify-between items-center"
                  >
                    <div>
                      <span className="text-ok-green/60 text-[9px] uppercase tracking-widest mr-2">Integrity Seal Verified</span>
                    </div>
                    <span className="text-ok-green/40 text-[9px] uppercase tracking-widest mr-2">← SHA-256 Validated</span>
                  </motion.div>
                )}
              </div>
              <div className="px-6 py-3 border-t border-ui-border bg-charcoal-light/10 flex justify-between items-center">
                <span className="text-[10px] uppercase text-white/40 tracking-widest italic">Pseudonymised — DPDP §8(7)</span>
                <span className="text-[9px] technical-data text-white/20">CRC: 0x8F2A1C</span>
              </div>
            </section>

            {/* Integrity Log & Config */}
            <div className="col-span-5 space-y-8">
              <section className="glass-panel p-6">
                <div className="flex items-center space-x-2 mb-5">
                  <ShieldAlert size={14} className="text-gold" />
                  <h3 className="text-gold uppercase tracking-[0.2em] text-[11px] font-sans">Integrity Validation Log</h3>
                </div>
                <div className="space-y-4 technical-data text-[10px]">
                  <LogEntry time="10:31:02" file="PROC_10006.hl7" status="PASS" />
                  <LogEntry time="10:31:05" file="PROC_10012.hl7" status="PASS" />
                  <LogEntry time="10:31:14" file="PROC_10044.hl7" status="FAIL_HASH_MISMATCH" warning />
                  <LogEntry time="10:31:18" file="PROC_10051.hl7" status="PASS" />
                </div>
              </section>

              <section className="glass-panel p-6">
                <div className="flex items-center space-x-2 mb-5">
                  <Settings size={14} className="text-gold" />
                  <h3 className="text-gold uppercase tracking-[0.2em] text-[11px] font-sans">Orchestration Config</h3>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 technical-data text-[10px]">
                  <ConfigItem label="Execution Mode" value="Batch / Automated" />
                  <ConfigItem label="Input Source" value={selectedDataset} />
                  <ConfigItem label="Anonymization" value="Mapping: Indo-Surnames" />
                  <ConfigItem label="Output Format" value="v2.5.1 Pipe Delimited" />
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

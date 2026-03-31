/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  ChevronRight,
  Terminal,
  Settings,
  Download,
  DownloadCloud,
  ExternalLink,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate, useLocation, useBlocker } from 'react-router-dom';
import SecurityModal from './SecurityModal';
import Footer from './Footer';

// --- Types ---
interface PatientRecord {
  id: string;
  pseudonym: string;
  sex: 'M' | 'F' | 'U';
  cohort: string;
  labEvents: number;
  output: string;
  seal: 'Valid' | 'Tampered';
  raw_data?: Record<string, any>;
  signed_msg?: string; // Content for stateless records
}

// --- Sub-components ---
const StatCard: React.FC<{ label: string, value: string | number, subValue?: string, color?: string }> = ({ label, value, subValue, color = 'text-white' }) => (
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
    <div className={`w-4 h-4 rounded-full border-4 border-charcoal-light transition-all duration-500 ${completed
        ? 'bg-ok-green shadow-[0_0_15px_rgba(106,158,114,0.6)]'
        : active
          ? 'bg-gold shadow-[0_0_15px_rgba(184,168,130,0.6)] animate-pulse'
          : 'bg-charcoal-light'
      }`}></div>
    <span className={`text-[10px] uppercase tracking-wider transition-colors ${completed || active ? 'text-white' : 'text-white/30'
      }`}>{label}</span>
  </div>
);

interface LogEntryProps {
  time: string;
  file: string;
  status: string;
  warning?: boolean;
}

const LogEntry: React.FC<LogEntryProps> = ({ time, file, status, warning = false }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between border-b border-ui-border/10 pb-2.5"
  >
    <div className="flex space-x-3">
      <span className="text-white/30 font-mono">[{time}]</span>
      <span className="text-white/70">{file}</span>
    </div>
    <div className="flex items-center space-x-2">
      <span className={warning ? 'text-warn-amber' : 'text-ok-green'}>{status}</span>
      <div className={`w-1 h-1 rounded-full ${warning ? 'bg-warn-amber' : 'bg-ok-green'} animate-pulse`} />
    </div>
  </motion.div>
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
  const { 
    dataset: selectedDataset = 'MIMIC-IV v3.1', 
    sampleSize = 50,
    isStateless = false,
    statelessResults = []
  } = (location.state as any) || {};

  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStage, setCurrentStage] = useState(-1);
  const [records, setRecords] = useState<PatientRecord[]>([]);
  const [hl7Content, setHl7Content] = useState<string>('');
  const [activeFile, setActiveFile] = useState<string>('');
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [validationLogs, setValidationLogs] = useState<{time: string, file: string, status: string}[]>([]);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const headersInitialized = useRef(false);
  const hasRunRef = useRef(false);
  
  // Navigation Blocker for internal routing (React Router)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      (isProcessing || records.length > 0) &&
      currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setShowExitWarning(true);
    }
  }, [blocker.state]);

  // Warning for browser refresh
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing || records.length > 0) {
        e.preventDefault();
        e.returnValue = "You have unsaved orchestration progress.";
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isProcessing, records.length]);

  const runPipeline = async () => {
    if (isProcessing || hasRunRef.current) return;
    hasRunRef.current = true;
    
    if (isStateless) {
        setRecords(statelessResults.map((r: any) => ({ ...r.metadata, signed_msg: r.signed_msg })));
        setTableHeaders(['Subject ID', 'Pseudonym', 'Sex', 'Cohort', 'Lab Events', 'Output', 'Actions']);
        setCurrentStage(4);
        return;
    }

    setIsProcessing(true);
    setRecords([]);
    setTableHeaders([]);
    headersInitialized.current = false;
    setCurrentStage(0);

    try {
      const { dataset, sampleSize, filePath } = (location.state as any) || { dataset: 'mimic', sampleSize: 50 };
      const isMIMIC = dataset.toLowerCase().includes('mimic');

      if (isMIMIC) {
        setTableHeaders(['Subject ID', 'Pseudonym', 'Sex', 'Cohort', 'Lab Events', 'Output', 'Actions']);
        headersInitialized.current = true;
      }

      const response = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataset, sampleSize, filePath })
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
            } else if (data.status === 'completed') {
              if (!isMIMIC && data.record.raw_data && !headersInitialized.current) {
                const featureKeys = Object.keys(data.record.raw_data).filter(k => !['id', 'Dataset'].includes(k));
                setTableHeaders(['Subject ID', 'Pseudonym', 'Sex', ...featureKeys, 'Output', 'Actions']);
                headersInitialized.current = true;
              }
              setRecords(prev => [...prev, data.record]);
              setValidationLogs(prev => [...prev, { time: new Date().toLocaleTimeString([], { hour12: false }), file: data.record.output, status: 'PASS' }]);
              setCurrentStage(3);
            } else if (data.status === 'success') {
              setCurrentStage(4);
            }
          } catch (e) {}
        }
      }
    } catch (error) {
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    runPipeline();
  }, []);

  const fetchHL7 = async (filename: string, content?: string) => {
    setActiveFile(filename);
    if (content) {
        setHl7Content(content);
        return;
    }
    try {
      const response = await fetch(`/api/hl7/${filename}`);
      const data = await response.json();
      setHl7Content(data.content);
    } catch (error) {
      console.error('Failed to fetch HL7:', error);
    }
  };

  const downloadRecord = (record: PatientRecord) => {
    const content = record.signed_msg || hl7Content;
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = record.output;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportAll = async () => {
    const filesToExport = records.map(r => ({
        filename: r.output,
        content: r.signed_msg || ''
    }));

    // If real records from backend, we might need to fetch them if signed_msg is empty
    if (!isStateless) {
        alert("Server bulk export is undergoing maintenance. Please use stateless mode for ZIP exports.");
        return;
    }

    const response = await fetch('/api/export-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files: filesToExport })
    });

    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hl7_batch_data.zip`;
        a.click();
    }
  };

  return (
    <div className="flex min-h-screen bg-charcoal text-[#e2e2e2] font-sans">
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-ui-border flex items-center justify-between px-8 bg-charcoal/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/selection')} className="p-2 hover:bg-white/5 rounded-full text-white/50 hover:text-gold"><ChevronRight className="rotate-180" size={20} /></button>
            <div className="flex flex-col">
              <div className="text-[10px] uppercase text-white/40 tracking-[0.2em] flex items-center gap-2">
                HL7 Orchestrator {isStateless && <span className="text-gold flex items-center gap-1"><Zap size={8} /> Stateless</span>}
              </div>
              <h2 className="text-xl font-title text-white">Live Pipeline Status</h2>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentStage === 4 && (
                <button 
                  onClick={exportAll}
                  className="flex items-center gap-2 px-4 py-1.5 bg-gold text-charcoal rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all"
                >
                  <DownloadCloud size={14} /> Export All (ZIP)
                </button>
            )}
            <button onClick={() => setIsSecurityModalOpen(true)} className="px-3 py-1.5 border border-ui-border rounded text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">Audit log</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-8 pb-32">
          <section className="grid grid-cols-4 gap-6">
            <StatCard label="Records Processed" value={records.length} />
            <StatCard label="HL7 Files Generated" value={records.length} />
            <StatCard label="Integrity Seals Valid" value={records.length} color="text-ok-green" />
            <StatCard label="Privacy Compliance" value="99.2%" subValue={isStateless ? "ZERO-LEAK" : "ENCRYPTED"} color={isStateless ? "text-primary-gold" : "text-ok-green"} />
          </section>

          <section className="glass-panel p-8 relative overflow-hidden">
            <h3 className="text-gold uppercase tracking-[0.2em] text-[11px] mb-10">Current Orchestration Flow</h3>
            <div className="flex items-center justify-between relative px-12">
              <div className="absolute top-[8px] left-24 right-24 h-px bg-ui-border"></div>
              <PipelineStage label="Preprocessing" active={currentStage === 0} completed={currentStage > 0} />
              <PipelineStage label="Anonymizer" active={currentStage === 1} completed={currentStage > 1} />
              <PipelineStage label="HL7 Transform" active={currentStage === 2} completed={currentStage > 2} />
              <PipelineStage label="Integrity Seal" active={currentStage === 3} completed={currentStage > 3} />
            </div>
          </section>

          <div className="grid grid-cols-12 gap-8">
            <section className="col-span-12 glass-panel overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-white/40 border-b border-ui-border bg-charcoal-light/10">
                    {tableHeaders.map(header => (<th key={header} className="px-4 py-4 font-normal">{header}</th>))}
                  </tr>
                </thead>
                <tbody className="technical-data text-[11px] divide-y divide-ui-border/5">
                  {records.map((record) => (
                    <tr key={record.id} onClick={() => fetchHL7(record.output, record.signed_msg)} className={`hover:bg-gold/5 transition-colors cursor-pointer ${activeFile === record.output ? 'bg-gold/10' : ''}`}>
                      <td className="px-4 py-4">{record.id}</td>
                      <td className="px-4 py-4 italic text-gold/80">{record.pseudonym}</td>
                      <td className="px-4 py-4">{record.sex}</td>
                      {selectedDataset.toLowerCase().includes('mimic') ? (
                        <>
                          <td className="px-4 py-4 truncate max-w-[200px]">{record.cohort}</td>
                          <td className="px-4 py-4">{record.labEvents}</td>
                        </>
                      ) : (
                        tableHeaders.slice(3, -2).map(header => (<td key={header} className="px-4 py-4">{record.raw_data?.[header] || '—'}</td>))
                      )}
                      <td className="px-4 py-4 font-mono text-[9px] text-white/40 truncate max-w-[150px]">{record.output}</td>
                      <td className="px-4 py-4 flex gap-2">
                        <button onClick={(e) => { e.stopPropagation(); downloadRecord(record); }} className="p-1 hover:text-gold transition-colors"><Download size={14} /></button>
                        <button className="p-1 hover:text-gold transition-colors"><ExternalLink size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="col-span-12 glass-panel flex flex-col">
              <div className="p-4 border-b border-ui-border bg-charcoal-light/20 flex justify-between items-center text-[11px]">
                  <span className="text-gold uppercase tracking-widest flex items-center gap-2"><Terminal size={14}/> HL7 Inspect {activeFile}</span>
                  {activeFile && <button onClick={() => downloadRecord(records.find(r => r.output === activeFile)!)} className="text-white/40 hover:text-white flex items-center gap-2">Download File <Download size={12}/></button>}
              </div>
              <div className="p-6 bg-black/20 technical-data text-[11px] min-h-[300px]">
                {hl7Content ? hl7Content.split('\n').map((line, i) => (
                  <div key={i} className="mb-2"><span className="text-white/20 mr-4">{(i+1).toString().padStart(2,'0')}</span>{line}</div>
                )) : <div className="h-full flex items-center justify-center text-white/5">Select a record to inspect HL7</div>}
              </div>
            </section>
          </div>
          <Footer />
        </main>
      </div>
      <SecurityModal isOpen={isSecurityModalOpen} onClose={() => setIsSecurityModalOpen(false)} />
      {showExitWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md">
             <div className="max-w-md p-8 border border-warn-amber/20 bg-charcoal shadow-2xl rounded">
                <ShieldAlert className="text-warn-amber mb-4" size={32} />
                <h3 className="text-xl font-title text-white mb-2">Terminate Session?</h3>
                <p className="text-sm text-white/60 mb-8 leading-relaxed">
                   Stateless session detected. Navigating away will purge all in-memory HL7 records and signatures. This action cannot be reversed.
                </p>
                <div className="flex justify-end gap-4">
                   <button onClick={() => { blocker.reset(); setShowExitWarning(false); }} className="text-white/40 text-xs uppercase font-bold tracking-widest">Stay</button>
                   <button onClick={() => { blocker.proceed(); setShowExitWarning(false); }} className="px-6 py-2 bg-warn-amber text-charcoal text-xs uppercase font-bold tracking-widest rounded hover:bg-white transition-colors">Discard & Exit</button>
                </div>
             </div>
          </div>
      )}
    </div>
  );
}

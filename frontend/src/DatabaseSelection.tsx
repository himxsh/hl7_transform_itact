/// <reference types="vite/client" />
import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Plus,
  ArrowRight,
  ShieldCheck,
  FileCode,
  CheckCircle2,
  Loader2,
  Archive,
  Table,
  Layers,
  FileText,
  Trash2,
  Database,
  History,
  Info,
  Zap,
  Keyboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function DatabaseSelection() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const archiveInputRef = useRef<HTMLInputElement>(null);

  // Tabs: 'batch' | 'single'
  const [activeTab, setActiveTab] = useState<'batch' | 'single'>('batch');

  // Batch Mode States
  const [batchType, setBatchType] = useState<'mimic' | 'generalized' | null>(null);
  const [uploadedFile, setUploadedFile] = useState<{ filename: string, content?: File } | null>(null);

  // Single Mode States (Manual Entry)
  const [manualRows, setManualRows] = useState<{ key: string, value: string }[]>([
    { key: '', value: '' }
  ]);

  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'generalized' | 'mimic') => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadedFile({ filename: file.name, content: file });
    // Reset input value to allow re-selection of the same file
    if (event.target) event.target.value = '';
  };

  const addManualRow = () => setManualRows([...manualRows, { key: '', value: '' }]);
  const updateManualRow = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...manualRows];
    updated[index][field] = val;
    setManualRows(updated);
  };
  const removeManualRow = (index: number) => setManualRows(manualRows.filter((_, i) => i !== index));

  const generateDummyData = () => {
    setManualRows([
      { key: 'Subject_ID', value: 'PAT-' + Math.floor(Math.random() * 9000 + 1000) },
      { key: 'Age', value: Math.floor(Math.random() * 50 + 20).toString() },
      { key: 'Gender', value: Math.random() > 0.5 ? 'M' : 'F' },
      { key: 'Heart Rate', value: Math.floor(Math.random() * 40 + 60).toString() },
      { key: 'SpO2', value: Math.floor(Math.random() * 5 + 95).toString() },
      { key: 'Systolic BP', value: Math.floor(Math.random() * 40 + 110).toString() },
      { key: 'Diastolic BP', value: Math.floor(Math.random() * 30 + 70).toString() }
    ]);
  };

  const runPipeline = async (mode: 'batch' | 'single') => {
    setUploading(true);
    const formData = new FormData();

    if (mode === 'single') {
      const filteredRows = manualRows.filter(row => row.key.trim() !== '');
      if (filteredRows.length === 0) {
        alert("Please enter at least one data field.");
        setUploading(false);
        return;
      }
      const manualData = filteredRows.reduce((acc, row) => ({ ...acc, [row.key]: row.value }), {});
      formData.append('mode', 'generalized');
      formData.append('mapping', JSON.stringify({ manual_data: manualData }));
    } else {
      if (!uploadedFile?.content || !batchType) {
        alert("Please select a mode and upload a file first.");
        setUploading(false);
        return;
      }
      formData.append('file', uploadedFile.content);
      formData.append('mode', batchType);
      // Removed sampleSize for full ingestion
    }

    try {
      const response = await fetch('/api/process-instant', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        navigate('/dashboard', {
          state: {
            statelessResults: data.records,
            isStateless: true,
            dataset: mode === 'single' ? 'Manual Entry' : (batchType === 'mimic' ? 'MIMIC Batch' : 'Generalized Batch')
          }
        });
      }
    } catch (error) {
      console.error('Processing failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center">
        <Header activeTab="pipeline" />

        <main className="w-full px-6 pt-32 pb-12 flex flex-col items-center">
          {/* Tab Selection */}
          <div className="flex bg-neutral-dark/5 p-1.5 rounded-full mb-12 shadow-inner border border-neutral-dark/5">
            <button
              onClick={() => setActiveTab('batch')}
              className={`px-10 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'batch' ? 'bg-white text-neutral-dark shadow-md ' : 'text-neutral-dark/30 hover:text-neutral-dark/60'}`}
            >
              <Layers size={14} /> Batch Mode
            </button>
            <button
              onClick={() => setActiveTab('single')}
              className={`px-10 py-3 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'single' ? 'bg-white text-neutral-dark shadow-md' : 'text-neutral-dark/30 hover:text-neutral-dark/60'}`}
            >
              <FileText size={14} /> Single Record
            </button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'batch' ? (
              <motion.div
                key="batch-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full max-w-[1200px]"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                  {/* Box 1: MIMIC Mode */}
                  <div
                    onClick={() => { 
                      if (batchType !== 'mimic') {
                        setBatchType('mimic'); 
                        setUploadedFile(null); 
                      }
                    }}
                    className={`group p-10 border rounded-sm cursor-pointer transition-all relative flex flex-col h-[520px] ${batchType === 'mimic' ? 'border-primary-gold bg-white shadow-2xl ring-1 ring-primary-gold/10' : 'border-neutral-dark/5 hover:border-primary-gold/30 bg-white/50 focus-within:ring-2'}`}
                  >
                    <div className="flex justify-between items-start mb-10">
                      <div className={`p-4 rounded-sm ${batchType === 'mimic' ? 'bg-primary-gold text-white' : 'bg-neutral-dark/5 text-neutral-dark/20'}`}>
                        <Database size={24} />
                      </div>
                      {batchType === 'mimic' && <CheckCircle2 className="text-primary-gold shadow-sm" size={24} />}
                    </div>
                    <h3 className="font-title text-4xl mb-4">MIMIC Mode</h3>
                    <p className="text-sm text-neutral-dark/40 leading-relaxed max-w-xs h-16">Optimized for MIMIC-IV relational datasets. Process complex multi-file archives in zero-residency RAM.</p>

                    <div className="mt-auto pt-8">
                      <AnimatePresence mode="wait">
                        {batchType === 'mimic' ? (
                          <motion.div
                            key="mimic-upload"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                          >
                            <div
                              onClick={(e) => { e.stopPropagation(); archiveInputRef.current?.click(); }}
                              className="border-2 border-dashed border-primary-gold/20 p-12 flex flex-col items-center justify-center gap-4 hover:bg-primary-gold/5 transition-all text-center rounded-sm bg-bg-light/30"
                            >
                              {uploadedFile ? (
                                <>
                                  <CheckCircle2 size={32} className="text-primary-gold" />
                                  <span className="text-xs font-bold text-neutral-dark truncate max-w-[200px]">{uploadedFile.filename}</span>
                                  <span className="text-[10px] uppercase font-bold text-primary-gold/60 underline cursor-pointer">Replace Archive</span>
                                </>
                              ) : (
                                <>
                                  <UploadCloud size={40} className="text-primary-gold/30 group-hover:scale-110 transition-transform" />
                                  <div className="flex flex-col gap-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-dark">Upload Archive</span>
                                    <span className="text-[10px] text-neutral-dark/40">.ZIP / .TAR.GZ</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="mimic-info"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-neutral-dark/50 space-y-4"
                          >
                            <div className="flex items-start gap-3">
                              <Info size={14} className="text-primary-gold mt-1 min-w-[14px]" />
                              <p className="text-xs italic leading-tight">Requires a 3-file archive: ADMISSIONS, LABEVENTS, and D_LABITEMS for relationship mapping.</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <History size={14} className="text-primary-gold mt-1 min-w-[14px]" />
                              <p className="text-xs italic leading-tight">Fast indexing in RAM allows for deep temporal analysis of patient vitals across encounter timelines.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Box 2: Generalized Mode */}
                  <div
                    onClick={() => { 
                      if (batchType !== 'generalized') {
                        setBatchType('generalized'); 
                        setUploadedFile(null); 
                      }
                    }}
                    className={`group p-10 border rounded-sm cursor-pointer transition-all relative flex flex-col h-[520px] ${batchType === 'generalized' ? 'border-primary-gold bg-white shadow-2xl ring-1 ring-primary-gold/10' : 'border-neutral-dark/5 hover:border-primary-gold/30 bg-white/50 focus-within:ring-2'}`}
                  >
                    <div className="flex justify-between items-start mb-10">
                      <div className={`p-4 rounded-sm ${batchType === 'generalized' ? 'bg-primary-gold text-white' : 'bg-neutral-dark/5 text-neutral-dark/20'}`}>
                        <Table size={24} />
                      </div>
                      {batchType === 'generalized' && <CheckCircle2 className="text-primary-gold shadow-sm" size={24} />}
                    </div>
                    <h3 className="font-title text-4xl mb-4">Generalized</h3>
                    <p className="text-sm text-neutral-dark/40 leading-relaxed max-w-xs h-16">Universal spreadsheet transformation. Direct ingestion of hospital clinical tables and Excel files.</p>

                    <div className="mt-auto pt-8">
                      <AnimatePresence mode="wait">
                        {batchType === 'generalized' ? (
                          <motion.div
                            key="gen-upload"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                          >
                            <div
                              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                              className="border-2 border-dashed border-primary-gold/20 p-12 flex flex-col items-center justify-center gap-4 hover:bg-primary-gold/5 transition-all text-center rounded-sm bg-bg-light/30"
                            >
                              {uploadedFile ? (
                                <>
                                  <CheckCircle2 size={32} className="text-primary-gold" />
                                  <span className="text-xs font-bold text-neutral-dark truncate max-w-[200px]">{uploadedFile.filename}</span>
                                  <span className="text-[10px] uppercase font-bold text-primary-gold/60 underline cursor-pointer">Replace Dataset</span>
                                </>
                              ) : (
                                <>
                                  <UploadCloud size={40} className="text-primary-gold/30 group-hover:scale-110 transition-transform" />
                                  <div className="flex flex-col gap-2">
                                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-dark">Upload Spreadsheet</span>
                                    <span className="text-[10px] text-neutral-dark/40">.CSV / .XLSX</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="gen-info"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-neutral-dark/50 space-y-4"
                          >
                            <div className="flex items-start gap-3">
                              <Info size={14} className="text-primary-gold mt-1 min-w-[14px]" />
                              <p className="text-xs italic leading-tight">Accepts any clinical dataset with standardized headers. Automatically maps columns to HL7 PID and OBX segments.</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <History size={14} className="text-primary-gold mt-1 min-w-[14px]" />
                              <p className="text-xs italic leading-tight">Optimized for linear data ingestion. Supports full-session streaming for datasets up to 100MB in RAM.</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-8 mt-20">
                  <button
                    onClick={() => runPipeline('batch')}
                    disabled={uploading || !batchType || !uploadedFile}
                    className={`bg-neutral-dark text-white font-sans text-xs tracking-[0.3em] uppercase px-24 py-8 rounded-sm hover:-translate-y-1 active:translate-y-0 transition-all shadow-2xl relative overflow-hidden group disabled:opacity-30 disabled:pointer-events-none`}
                  >
                    {uploading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="text-primary-gold absolute left-10 opacity-40 group-hover:opacity-100 transition-opacity" />}
                    <span>{uploading ? 'Transforming Dataset...' : 'Initiate Transformation'}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                  </button>

                </div>
              </motion.div>
            ) : (
              <motion.div
                key="single-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="w-full max-w-[1000px] bg-white rounded-sm border border-neutral-dark/5 shadow-xl p-12 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 text-neutral-dark/5 pointer-events-none">
                  <FileText size={200} strokeWidth={0.5} />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-primary-gold/10 rounded-sm flex items-center justify-center text-primary-gold">
                      <Keyboard size={24} />
                    </div>
                    <div>
                      <h2 className="font-title text-3xl italic">Clinical Record Editor</h2>
                      <p className="text-xs text-neutral-dark/40 uppercase tracking-widest font-bold mt-1">Manual HL7 Construction Workspace</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-6 border-b border-neutral-dark/5 pb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-dark/40">Field Mapping</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-dark/40">Encounter Value</span>
                      </div>
                      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4 scrollbar-thin">
                        {manualRows.map((row, i) => (
                          <div key={i} className="flex gap-4 group items-center">
                            <div className="flex-1 flex gap-2">
                              <input
                                placeholder="Measurement Code"
                                value={row.key}
                                onChange={(e) => updateManualRow(i, 'key', e.target.value)}
                                className="w-1/2 p-4 text-xs font-mono bg-bg-light/50 border border-transparent focus:border-primary-gold/30 focus:bg-white outline-none rounded-sm transition-all"
                              />
                              <input
                                placeholder="Clinical Value"
                                value={row.value}
                                onChange={(e) => updateManualRow(i, 'value', e.target.value)}
                                className="w-1/2 p-4 text-xs font-sans bg-bg-light/50 border border-transparent focus:border-primary-gold/30 focus:bg-white outline-none rounded-sm transition-all"
                              />
                            </div>
                            <button onClick={() => removeManualRow(i)} className="opacity-0 group-hover:opacity-100 p-3 text-neutral-dark/20 hover:text-red-400 hover:bg-neutral-dark/5 rounded-sm transition-all"><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button
                          onClick={addManualRow}
                          className="flex-1 py-4 border-2 border-dashed border-primary-gold/20 text-primary-gold text-[10px] font-bold uppercase tracking-widest hover:bg-primary-gold/5 transition-all rounded-sm flex items-center justify-center gap-3 bg-primary-gold/2"
                        >
                          <Plus size={14} /> Append Field
                        </button>
                        <button
                          onClick={generateDummyData}
                          className="flex-1 py-4 border-2 border-neutral-dark/10 text-neutral-dark/60 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-dark/5 transition-all rounded-sm flex items-center justify-center gap-3 bg-neutral-dark/2"
                        >
                          <History size={14} /> Generate Dummy Value
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between bg-neutral-dark/2 rounded-sm p-8 border border-neutral-dark/5">
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 text-primary-gold">
                          <ShieldCheck size={16} />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Trust Engine</span>
                        </div>
                        <div className="space-y-4">
                          <div className="flex items-start gap-4">
                            <div className="min-w-4 h-4 rounded-full bg-primary-gold/20 flex items-center justify-center mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-gold" />
                            </div>
                            <p className="text-[10px] text-neutral-dark/60 leading-relaxed italic">"Direct memory mapping ensures no persistent trace of this record exists on the physical server node."</p>
                          </div>
                          <div className="flex items-start gap-4">
                            <div className="min-w-4 h-4 rounded-full bg-primary-gold/20 flex items-center justify-center mt-0.5">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-gold" />
                            </div>
                            <p className="text-[10px] text-neutral-dark/60 leading-relaxed italic">"HL7 segments are generated using standard Observation [OBX] and Patient [PID] schemas."</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-12 space-y-4">
                        <button
                          onClick={() => runPipeline('single')}
                          disabled={uploading}
                          className="w-full bg-neutral-dark text-white font-sans text-[10px] tracking-[0.2em] uppercase py-6 rounded-sm shadow-xl flex items-center justify-center gap-4 group"
                        >
                          {uploading ? <Loader2 className="animate-spin" size={14} /> : <span>Generate Record</span>}
                          {!uploading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                        </button>
                        <p className="text-[8px] text-center text-neutral-dark/30 uppercase tracking-widest flex items-center justify-center gap-2">
                          <Zap size={8} /> Instant Stateless Transformation
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <input type="file" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'generalized')} className="hidden" accept=".csv,.xlsx,.xls" />
          <input type="file" ref={archiveInputRef} onChange={(e) => handleFileUpload(e, 'mimic')} className="hidden" accept=".zip,.tar.gz,.gz" />
        </main>
      </div>
    </div>
  );
}

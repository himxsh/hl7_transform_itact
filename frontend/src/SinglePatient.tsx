/**
 * SinglePatient.tsx — Manual single-patient data entry form
 *
 * Form-only page: users enter header/value pairs, optionally generate
 * random values, then submit to navigate to the Dashboard for full
 * pipeline processing with all the same features as Batch Mode.
 *
 * [DPDP Act §8(7)] — No data persisted; in-memory only.
 */

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Trash2,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

// Common HL7 field suggestions
const FIELD_SUGGESTIONS = [
  'subject_id', 'gender', 'age',
  'Total_Bilirubin', 'Direct_Bilirubin', 'Alkaline_Phosphotase',
  'Alamine_Aminotransferase', 'Aspartate_Aminotransferase',
  'Total_Protiens', 'Albumin', 'Albumin_and_Globulin_Ratio',
  'Hemoglobin', 'WBC_Count', 'RBC_Count', 'Platelet_Count',
  'Blood_Glucose', 'Creatinine', 'Blood_Urea',
  'Systolic_BP', 'Diastolic_BP', 'Heart_Rate', 'Temperature', 'SpO2',
];

// Random value generators per field type
const RANDOM_VALUES: Record<string, () => string> = {
  subject_id: () => String(Math.floor(Math.random() * 900000) + 100000),
  gender: () => (Math.random() > 0.5 ? 'M' : 'F'),
  age: () => String(Math.floor(Math.random() * 60) + 18),
  Total_Bilirubin: () => (Math.random() * 4 + 0.1).toFixed(1),
  Direct_Bilirubin: () => (Math.random() * 2 + 0.1).toFixed(1),
  Alkaline_Phosphotase: () => String(Math.floor(Math.random() * 400 + 60)),
  Alamine_Aminotransferase: () => String(Math.floor(Math.random() * 200 + 10)),
  Aspartate_Aminotransferase: () => String(Math.floor(Math.random() * 300 + 10)),
  Total_Protiens: () => (Math.random() * 4 + 4).toFixed(1),
  Albumin: () => (Math.random() * 2 + 2.5).toFixed(1),
  Albumin_and_Globulin_Ratio: () => (Math.random() * 1.5 + 0.3).toFixed(2),
  Hemoglobin: () => (Math.random() * 6 + 10).toFixed(1),
  WBC_Count: () => String(Math.floor(Math.random() * 8000 + 4000)),
  RBC_Count: () => (Math.random() * 2 + 3.5).toFixed(2),
  Platelet_Count: () => String(Math.floor(Math.random() * 250000 + 150000)),
  Blood_Glucose: () => String(Math.floor(Math.random() * 150 + 70)),
  Creatinine: () => (Math.random() * 2 + 0.5).toFixed(1),
  Blood_Urea: () => String(Math.floor(Math.random() * 40 + 10)),
  Systolic_BP: () => String(Math.floor(Math.random() * 40 + 100)),
  Diastolic_BP: () => String(Math.floor(Math.random() * 30 + 60)),
  Heart_Rate: () => String(Math.floor(Math.random() * 40 + 60)),
  Temperature: () => (Math.random() * 2 + 97).toFixed(1),
  SpO2: () => String(Math.floor(Math.random() * 5 + 95)),
};

function getRandomValue(header: string): string {
  const generator = RANDOM_VALUES[header];
  if (generator) return generator();
  return (Math.random() * 100).toFixed(2);
}

interface FieldRow {
  id: string;
  header: string;
  value: string;
}

export default function SinglePatient() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<FieldRow[]>([
    { id: crypto.randomUUID(), header: '', value: '' }
  ]);
  const [showSuggestions, setShowSuggestions] = useState<string | null>(null);

  const demographicKeys = new Set(['subject_id', 'gender', 'age']);

  const addField = () => {
    setFields(prev => [...prev, { id: crypto.randomUUID(), header: '', value: '' }]);
  };

  const removeField = (id: string) => {
    setFields(prev => prev.filter(f => f.id !== id));
  };

  const updateField = (id: string, key: 'header' | 'value', val: string) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));
  };

  const generateRandomValues = () => {
    setFields(prev => prev.map(f => ({
      ...f,
      value: f.header ? getRandomValue(f.header) : f.value,
    })));
  };

  const populateAllFields = () => {
    const newFields = FIELD_SUGGESTIONS.map(header => ({
      id: crypto.randomUUID(),
      header,
      value: getRandomValue(header),
    }));
    setFields(newFields);
  };

  const selectSuggestion = (fieldId: string, suggestion: string) => {
    updateField(fieldId, 'header', suggestion);
    setShowSuggestions(null);
  };

  const filteredSuggestions = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return [];
    const usedHeaders = new Set(fields.map(f => f.header));
    return FIELD_SUGGESTIONS.filter(
      s => !usedHeaders.has(s) && s.toLowerCase().includes(field.header.toLowerCase())
    );
  };

  // Build live HL7 preview (client-side, unsigned)
  const livePreview = useMemo(() => {
    const now = new Date().toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const demographics = fields.filter(f => demographicKeys.has(f.header));
    const observations = fields.filter(f => f.header && !demographicKeys.has(f.header));

    const subjectId = demographics.find(f => f.header === 'subject_id')?.value || '000000';
    const gender = demographics.find(f => f.header === 'gender')?.value || 'U';
    const age = demographics.find(f => f.header === 'age')?.value || '0';
    const birthYear = new Date().getFullYear() - (parseInt(age) || 0);

    const segments = [
      `MSH|^~\\&|SINGLE_PATIENT|MANUAL_ENTRY|||${now}||ORU^R01^ORU_R01|${subjectId}|P|2.5.1`,
      `PID|1||${subjectId}^^^MANUAL^MR||[PSEUDONYM]^^^||${birthYear}0101|${gender}`,
    ];

    observations.forEach((obs, i) => {
      const vtype = !isNaN(Number(obs.value)) ? 'NM' : 'ST';
      segments.push(`OBX|${i + 1}|${vtype}|${obs.header}^MANUAL||${obs.value}||||||F|||${now}`);
    });

    return segments.join('\n');
  }, [fields]);

  const filledFields = fields.filter(f => f.header && f.value);
  const canSubmit = filledFields.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const demographics: Record<string, string> = {};
    const observations: { header: string; value: string }[] = [];

    for (const f of filledFields) {
      if (demographicKeys.has(f.header)) {
        demographics[f.header] = f.value;
      } else {
        observations.push({ header: f.header, value: f.value });
      }
    }

    // Navigate to Dashboard with single-patient data
    navigate('/dashboard', {
      state: {
        mode: 'single',
        dataset: 'Single Patient',
        singlePatientData: { fields: demographics, observations },
      }
    });
  };

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center">
        <Header activeTab="pipeline" />

        <main className="w-full max-w-[1100px] px-6 py-20 flex flex-col items-center">
          {/* Title */}
          <div className="flex items-center gap-3 mb-2 mt-12">
            <button
              onClick={() => navigate('/selection')}
              className="p-2 hover:bg-primary-gold/10 rounded-full transition-colors text-neutral-dark/50 hover:text-primary-gold"
            >
              <ChevronRight className="rotate-180" size={20} />
            </button>
            <h1 className="font-title text-5xl md:text-[52px] text-neutral-dark leading-tight">
              Single Patient Mode
            </h1>
          </div>
          <p className="font-sans text-sm text-neutral-dark/60 text-center max-w-lg mb-4 leading-relaxed">
            Enter patient fields manually, then process through the full pipeline with
            anonymization, signing, and encryption comparison.
          </p>

          {/* Stateless disclaimer */}
          <div className="flex items-center gap-2 mb-8 px-4 py-2 bg-primary-gold/5 border border-primary-gold/20 rounded-sm">
            <ShieldCheck size={14} className="text-primary-gold shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary-gold/80">
              Stateless Processing — Zero data persistence
            </span>
          </div>

          <div className="w-[48px] h-[1px] bg-primary-gold mb-12"></div>

          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div className="bg-white border border-primary-gold/20 rounded-sm p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-title text-xl text-neutral-dark">Patient Fields</h2>
                <div className="flex gap-2">
                  <button
                    onClick={populateAllFields}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-gold/10 text-primary-gold text-[10px] font-mono uppercase tracking-wider rounded-sm hover:bg-primary-gold/20 transition-colors"
                    title="Populate all available fields with random values"
                  >
                    <Plus size={12} />
                    Fill All
                  </button>
                  <button
                    onClick={generateRandomValues}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-gold/10 text-primary-gold text-[10px] font-mono uppercase tracking-wider rounded-sm hover:bg-primary-gold/20 transition-colors"
                  >
                    <Sparkles size={12} />
                    Random Values
                  </button>
                </div>
              </div>

              {/* Field Rows */}
              <div className="space-y-3 mb-6 max-h-[400px] overflow-y-auto pr-2">
                <AnimatePresence initial={false}>
                  {fields.map((field) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-3 items-start"
                    >
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Header (e.g. age)"
                          value={field.header}
                          onChange={(e) => {
                            updateField(field.id, 'header', e.target.value);
                            setShowSuggestions(field.id);
                          }}
                          onFocus={() => setShowSuggestions(field.id)}
                          onBlur={() => setTimeout(() => setShowSuggestions(null), 200)}
                          className="w-full px-3 py-2.5 border border-primary-gold/20 rounded-sm text-sm font-mono
                                     focus:outline-none focus:border-primary-gold/60 bg-bg-light/50 transition-colors"
                        />
                        {showSuggestions === field.id && field.header && filteredSuggestions(field.id).length > 0 && (
                          <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-primary-gold/20 rounded-sm shadow-lg max-h-[160px] overflow-y-auto">
                            {filteredSuggestions(field.id).slice(0, 8).map(s => (
                              <button
                                key={s}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectSuggestion(field.id, s);
                                }}
                                className="w-full text-left px-3 py-1.5 text-xs font-mono text-neutral-dark/70
                                           hover:bg-primary-gold/10 hover:text-neutral-dark transition-colors"
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Value"
                        value={field.value}
                        onChange={(e) => updateField(field.id, 'value', e.target.value)}
                        className="flex-1 px-3 py-2.5 border border-primary-gold/20 rounded-sm text-sm font-mono
                                   focus:outline-none focus:border-primary-gold/60 bg-bg-light/50 transition-colors"
                      />
                      <button
                        onClick={() => removeField(field.id)}
                        disabled={fields.length === 1}
                        className="p-2.5 text-neutral-dark/30 hover:text-red-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add Field */}
              <button
                onClick={addField}
                className="w-full py-2.5 border border-dashed border-primary-gold/30 rounded-sm text-primary-gold/60
                           text-[10px] font-mono uppercase tracking-wider flex items-center justify-center gap-2
                           hover:border-primary-gold/60 hover:text-primary-gold hover:bg-primary-gold/5 transition-all"
              >
                <Plus size={12} />
                Add Field
              </button>

              {/* Submit to Dashboard */}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full mt-6 py-4 rounded-sm text-xs font-sans uppercase tracking-[0.2em] flex items-center 
                           justify-center gap-3 transition-all group ${
                  canSubmit
                    ? 'bg-neutral-dark text-white hover:bg-neutral-dark/90'
                    : 'bg-neutral-dark/30 text-white/50 cursor-not-allowed'
                }`}
              >
                <ShieldCheck size={14} />
                Run Pipeline
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Right: Live Preview */}
            <div className="bg-white border border-primary-gold/20 rounded-sm overflow-hidden h-fit">
              <div className="px-6 py-3 border-b border-primary-gold/10 bg-primary-gold/5">
                <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-primary-gold/70">
                  Live HL7 Preview (unsigned)
                </span>
              </div>
              <div className="p-6 font-mono text-[11px] leading-relaxed bg-neutral-dark/[0.02] min-h-[200px] max-h-[400px] overflow-y-auto">
                {livePreview.split('\n').map((line, i) => (
                  <div key={i} className="text-neutral-dark/60 mb-1">
                    <span className="text-primary-gold/40 mr-3 select-none">{(i + 1).toString().padStart(2, '0')}</span>
                    {line}
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 border-t border-primary-gold/10 bg-primary-gold/5">
                <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-primary-gold/50">
                  {filledFields.length} field{filledFields.length !== 1 ? 's' : ''} entered · Preview updates live · Signing happens on submit
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

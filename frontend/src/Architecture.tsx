import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import {
  Database,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Binary,
  FileCode,
  Activity,
  Cloud,
  Layers,
  Search,
  Zap
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

export default function Architecture() {
  const stages = [
    {
      id: 'ingestion',
      title: 'Data Ingestion',
      type: 'original',
      icon: <Database className="text-primary-gold" size={24} />,
      items: ['MIMIC-IV Relational DB', 'Universal CSV Ingestion'],
      description: 'Handles raw clinical data sources. For MIMIC, it uses SQL connectors; for CSV, it uses a generic file reader to initialize stream contexts.'
    },
    {
      id: 'pre-processing',
      title: 'Schema Intelligence',
      type: 'addition',
      icon: <Layers className="text-primary-gold" size={24} />,
      items: ['Automated Mapping', 'Clinical Segment Grouping'],
      description: 'Translates arbitrary CSV headers into standardized internal schema objects. Includes automated detection of Patient IDs, Lab Values, and Vital Signs.'
    },
    {
      id: 'privacy',
      title: 'Anonymization Layer',
      type: 'addition',
      icon: <ShieldCheck className="text-primary-gold" size={24} />,
      items: ['PII Masking (Name, Addr)', 'Date-shifting (DPDP)'],
      description: 'Secures Patient Identification (PID) data. Uses Spacy-based NER for PII detection and deterministic date-shifting to preserve clinical chronology without leaking identity.'
    },
    {
      id: 'core',
      title: 'HL7 Engine',
      type: 'original',
      icon: <Cpu className="text-primary-gold" size={24} />,
      items: ['HL7 v2.5.1 v2.7', 'MSH, PID, PV1, OBX'],
      description: 'The core transformation engine that serializes clinical records into pipe-delimited HL7 messages across multiple message versions (v2.3 to v2.7).'
    },
    {
      id: 'integrity',
      title: 'Security & Integrity',
      type: 'addition',
      icon: <Binary className="text-primary-gold" size={24} />,
      items: ['SHA-256 Hashing', 'IT Act §43 Compliance'],
      description: 'Ensures non-repudiation and data integrity. Every HL7 message is hashed; any tampering with the output file is detected through cryptographic validation.'
    },
    {
      id: 'output',
      title: 'Output Orchestrator',
      type: 'addition',
      icon: <Activity className="text-primary-gold" size={24} />,
      items: ['ER7 Streams', 'Real-time Dashboards'],
      description: 'Aggregates processed segments into the final HL7 transmission stream and pushes live updates to the frontend dashboard.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="architecture" />

      <main className="max-w-[1200px] mx-auto px-6 py-24 flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-20 max-w-2xl mx-auto">

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8"
          >
            Hybrid <span className="italic font-title text-primary-gold">Architecture</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 leading-relaxed"
          >
            A high-fidelity visualization of the data pipeline, showing the integration of the original HL7 transformation engine with our modern security and privacy layers.
          </motion.p>
        </div>


        {/* Flowchart Zig-Zag */}
        <div className="relative w-full max-w-5xl">
          {stages.map((stage, idx) => (
            <div key={stage.id} className="relative flex flex-col items-center w-full">
              {/* Stage Container */}
              <div className={`flex w-full mb-4 px-4 ${idx % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <motion.div
                  initial={{ opacity: 0, x: idx % 2 === 0 ? -40 : 40 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className={`w-full max-w-[440px] bg-white border p-10 rounded-[2.5rem] relative group transition-all duration-700
                    ${stage.type === 'addition'
                      ? 'border-primary-gold shadow-[0_20px_60px_-20px_rgba(193,175,134,0.3)] ring-1 ring-primary-gold/10'
                      : 'border-primary-gold/10 hover:border-primary-gold/30 hover:shadow-xl'}`}
                >
                  {stage.type === 'addition' && (
                    <div className="absolute -top-3 right-10 bg-primary-gold text-[#1c1a16] font-mono text-[8px] px-4 py-1.5 rounded-full uppercase tracking-widest font-bold shadow-lg ring-4 ring-white">
                      Novelty
                    </div>
                  )}

                  <div className="flex items-center gap-8">
                    <div className={`w-16 h-16 rounded-[1.5rem] border flex items-center justify-center transition-all duration-700 shrink-0
                      ${stage.type === 'addition' ? 'bg-primary-gold/10 border-primary-gold/30 rotate-3 group-hover:rotate-12' : 'bg-bg-light border-primary-gold/10 group-hover:bg-primary-gold/5 -rotate-3 group-hover:rotate-0'}`}
                    >
                      {stage.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-title text-2xl text-black mb-1">{stage.title}</h3>
                      <p className="font-sans text-[11px] text-black mb-4 leading-relaxed">{stage.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {stage.items.map(item => (
                          <span key={item} className={`font-mono text-[8px] px-3 py-1 border rounded-full tracking-wide transition-all
                            ${stage.type === 'addition'
                              ? 'border-primary-gold/30 text-black bg-primary-gold/5'
                              : 'border-neutral-dark/10 text-black bg-neutral-dark/[0.02]'}`}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Cursive S-Curve Connector */}
              {idx < stages.length - 1 && <Connector idx={idx} />}
            </div>
          ))}
        </div>

        {/* Technical Summary */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="group relative bg-white border border-primary-gold/10 hover:border-primary-gold/40 p-10 rounded-[2.5rem] transition-all duration-500 hover:shadow-xl hover:-translate-y-2 overflow-hidden"
          >
            <div className="w-12 h-12 rounded-[1rem] bg-bg-light border border-primary-gold/10 flex items-center justify-center mb-6 group-hover:bg-primary-gold/10 group-hover:border-primary-gold/30 transition-all duration-500">
              <Cpu className="text-primary-gold" strokeWidth={1.5} size={22} />
            </div>
            <h4 className="font-title text-xl mb-3 text-black">Original Logic</h4>
            <p className="font-sans text-[13px] text-black leading-relaxed">
              Based on core Python transformation scripts handling CSV grouping and HL7 serialization.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="group relative bg-white border border-primary-gold shadow-[0_20px_60px_-20px_rgba(193,175,134,0.3)] ring-1 ring-primary-gold/10 p-10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-gold/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary-gold/20 transition-colors duration-700" />
            <div className="w-12 h-12 rounded-[1rem] bg-primary-gold/10 border border-primary-gold/30 flex items-center justify-center mb-6 rotate-3 group-hover:rotate-12 transition-transform duration-500 relative z-10">
              <ShieldCheck className="text-primary-gold" strokeWidth={1.5} size={22} />
            </div>
            <h4 className="font-title text-xl mb-3 text-black relative z-10">Privacy Layer</h4>
            <p className="font-sans text-[13px] text-black leading-relaxed relative z-10">
              Security middleware inserted between ingestion and transformation for DPDP compliance.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="group relative bg-white border border-primary-gold shadow-[0_20px_60px_-20px_rgba(193,175,134,0.3)] ring-1 ring-primary-gold/10 p-10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary-gold/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary-gold/20 transition-colors duration-700" />
            <div className="w-12 h-12 rounded-[1rem] bg-primary-gold/10 border border-primary-gold/30 flex items-center justify-center mb-6 rotate-3 group-hover:rotate-12 transition-transform duration-500 relative z-10">
              <Binary className="text-primary-gold" strokeWidth={1.5} size={22} />
            </div>
            <h4 className="font-title text-xl mb-3 text-black relative z-10">Security Audit</h4>
            <p className="font-sans text-[13px] text-black leading-relaxed relative z-10">
              Automated checksum and integrity verification for every processed clinical message.
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Connector({ idx }: { idx: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 75%", "end 25%"]
  });

  const arrowOpacity = useTransform(scrollYProgress, [0.8, 1], [0, 1]);

  const pathD = idx % 2 === 0
    ? "M 220 0 C 220 60, 780 60, 780 120"
    : "M 780 0 C 780 60, 220 60, 220 120";

  return (
    <div ref={ref} className="h-32 w-full relative -mt-6 -mb-6 pointer-events-none">
      <svg width="100%" height="100%" viewBox="0 0 1000 120" fill="none" preserveAspectRatio="none" className="overflow-visible">
        <path
          d={pathD}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="10 10"
          className="text-primary-gold"
          style={{ opacity: 0.15 }}
        />
        <motion.path
          d={pathD}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeDasharray="10 10"
          className="text-primary-gold"
          style={{ pathLength: scrollYProgress, opacity: 1 }}
        />
      </svg>
      <motion.div style={{ opacity: arrowOpacity }} className={`absolute bottom-0 ${idx % 2 === 0 ? 'right-[22%]' : 'left-[22%]'} -mb-4 text-primary-gold`}>
        <ArrowRight className="rotate-90 scale-125" />
      </motion.div>
    </div>
  );
}

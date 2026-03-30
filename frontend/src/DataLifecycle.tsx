import { motion } from 'motion/react';
import { ArrowRight, Globe, Baby, Database, Trash2, RefreshCw } from 'lucide-react';
import Header from './Header';

const lifecycleStages = [
  { id: 'collection', label: 'Collection', icon: '📥', color: 'bg-blue-50 border-blue-200 text-blue-800', description: 'Raw clinical data is ingested from MIMIC-IV or CSV sources. Only essential columns are retained (data minimisation).', legal: 'DPDP §4 (Consent), §8(3) (Purpose Limitation)' },
  { id: 'processing', label: 'Processing', icon: '⚙️', color: 'bg-amber-50 border-amber-200 text-amber-800', description: 'Data is merged, normalised, and grouped by patient. Schema mapping translates headers into clinical attributes.', legal: 'DPDP §8(1) (Grounds for Processing)' },
  { id: 'anonymisation', label: 'Anonymisation', icon: '🔒', color: 'bg-green-50 border-green-200 text-green-800', description: 'PII is replaced with deterministic pseudonyms. Regex scrubs NTE segments for Aadhaar, PAN, email, phone numbers.', legal: 'DPDP §8(7) (De-identification), GDPR Art. 5(1)(f)' },
  { id: 'transformation', label: 'Transformation', icon: '🔄', color: 'bg-purple-50 border-purple-200 text-purple-800', description: 'Anonymised data is serialised into HL7 v2.5.1 format using mapping rules. PID, OBR, OBX, NTE segments are generated.', legal: 'IT Act §4 (Legal Recognition of Electronic Records)' },
  { id: 'sealing', label: 'Integrity Seal', icon: '🛡️', color: 'bg-red-50 border-red-200 text-red-800', description: 'SHA-256 hash is computed over the entire HL7 message. ZSH segment is appended as a tamper-evident cryptographic seal.', legal: 'IT Act §14 (Secure Electronic Record), §43A' },
  { id: 'storage', label: 'Storage / Output', icon: '💾', color: 'bg-indigo-50 border-indigo-200 text-indigo-800', description: 'Sealed HL7 files are written to disk. Audit log entries are appended to pipeline.log for compliance trail.', legal: 'GDPR Art. 5(1)(e) (Storage Limitation), DPDP §8(8)' },
  { id: 'deletion', label: 'Erasure', icon: '🗑️', color: 'bg-slate-50 border-slate-200 text-slate-800', description: 'Output files can be deleted upon request (Right to Erasure). No persistent lookup tables are maintained.', legal: 'DPDP §12(3), GDPR Art. 17 (Right to be Forgotten)' },
];

const crossBorderRules = [
  { jurisdiction: 'DPDP Act 2023 (India)', mechanism: 'Government Whitelist', detail: 'The Central Government will publish a list of countries/territories to which personal data may be transferred. Transfer to all other countries is restricted.', status: 'Pending — whitelist not yet published' },
  { jurisdiction: 'GDPR (EU)', mechanism: 'Adequacy Decisions', detail: 'The European Commission decides whether a country provides "adequate" data protection. Transfers to adequate countries are permitted without further safeguards.', status: 'Active — 15 countries recognised' },
  { jurisdiction: 'GDPR (EU)', mechanism: 'Standard Contractual Clauses (SCCs)', detail: 'Pre-approved contractual templates that parties in different countries sign to ensure adequate protection during cross-border transfers.', status: 'Active — widely used' },
  { jurisdiction: 'GDPR (EU)', mechanism: 'Binding Corporate Rules (BCRs)', detail: 'Internal rules adopted by multinational companies for transferring personal data within the corporate group to entities outside the EU.', status: 'Active — requires DPA approval' },
  { jurisdiction: 'RBI Mandate (India)', mechanism: 'Strict Localisation', detail: 'All payment system data must be stored exclusively in India. No cross-border transfer allowed for financial transaction data.', status: 'Active since 2018' },
  { jurisdiction: 'Health Data (India)', mechanism: 'DISHA Draft', detail: 'Digital health data should be stored and processed within India. Cross-border transfer only for emergency treatment or with explicit consent.', status: 'Draft — not yet enacted' },
];

const childrenData = [
  { aspect: 'Age Definition', dpdp: 'Below 18 years', gdpr: 'Below 16 years (member states can lower to 13)' },
  { aspect: 'Consent Requirement', dpdp: 'Verifiable parental consent before processing', gdpr: 'Consent of holder of parental responsibility' },
  { aspect: 'Behavioural Tracking', dpdp: 'Prohibited — no tracking or targeted advertising', gdpr: 'Restricted — "Legitimate interest" cannot override child protection' },
  { aspect: 'Profiling', dpdp: 'Prohibited — no profiling of children\'s data', gdpr: 'Restricted under Art. 22' },
  { aspect: 'Right to Erasure', dpdp: 'Available at any time until child turns 18', gdpr: 'Art. 17(1)(f) — right to erasure for data collected from a child' },
  { aspect: 'Verification Mechanism', dpdp: 'To be prescribed in DPDP Rules', gdpr: 'Reasonable efforts using available technology' },
  { aspect: 'Healthcare Relevance', dpdp: 'Pediatric records require parental consent', gdpr: 'Child health data is "special category" — Art. 9 applies' },
];

export default function DataLifecycle() {
  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="data-lifecycle" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Hero */}
        <div className="flex flex-col mb-20 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-3xl"
          >
            Data <span className="italic font-title text-primary-gold">Lifecycle</span> &<br />Cross-Border Transfers
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            Tracing personal data from collection to deletion — how our pipeline enforces purpose limitation, storage limitation, and data minimisation at every stage.
          </motion.p>
        </div>

        {/* Lifecycle Diagram */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <RefreshCw className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Data Lifecycle in Our Pipeline</h2>
          </div>

          <div className="space-y-0">
            {lifecycleStages.map((stage, idx) => (
              <div key={stage.id} className="relative">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  className="flex items-start gap-6 py-6"
                >
                  {/* Step Number */}
                  <div className="shrink-0 w-16 text-right">
                    <span className="font-title text-4xl text-primary-gold/30">{String(idx + 1).padStart(2, '0')}</span>
                  </div>

                  {/* Connector */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl ${stage.color}`}>
                      {stage.icon}
                    </div>
                    {idx < lifecycleStages.length - 1 && (
                      <div className="w-px h-8 bg-primary-gold/20 mt-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 bg-white border border-primary-gold/10 p-6 hover:border-primary-gold/30 transition-all">
                    <h3 className="font-title text-xl mb-2">{stage.label}</h3>
                    <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed mb-3">{stage.description}</p>
                    <span className="font-mono text-[10px] text-primary-gold/60">{stage.legal}</span>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Cross-Border Transfers */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Globe className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Cross-Border Data Transfers</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Jurisdiction</div>
              <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Mechanism</div>
              <div className="col-span-5 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Detail</div>
              <div className="col-span-3 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Status</div>
            </div>
            {crossBorderRules.map((r, idx) => (
              <div key={idx} className={`grid grid-cols-12 gap-0 px-6 py-5 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-primary-gold/[0.01]'}`}>
                <div className="col-span-2 font-sans font-bold text-[12px]">{r.jurisdiction}</div>
                <div className="col-span-2 font-mono text-[11px] text-primary-gold">{r.mechanism}</div>
                <div className="col-span-5 font-sans text-[12px] text-neutral-dark/60 leading-relaxed">{r.detail}</div>
                <div className="col-span-3 font-sans text-[11px] text-neutral-dark/40 italic">{r.status}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-primary-gold/5 border border-primary-gold/10 p-8">
            <p className="font-sans text-[13px] text-neutral-dark/50 leading-relaxed italic">
              <strong className="text-primary-gold not-italic">Our Pipeline:</strong> Currently processes all data locally — no cross-border transfer occurs. If deployed for international health research, the DPDP whitelist and GDPR adequacy mechanisms would need to be evaluated. Our anonymisation layer makes cross-border transfer safer by ensuring de-identified data is transmitted rather than raw PII.
            </p>
          </div>
        </motion.section>

        {/* Children's Data */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Baby className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Children's Data Protection</h2>
          </div>

          <p className="font-sans text-neutral-dark/60 max-w-2xl leading-relaxed mb-8">
            Both the DPDP Act (§9–§10) and GDPR (Art. 8) impose stricter requirements for processing children's data.
            In healthcare, this directly impacts how pediatric records are handled.
          </p>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-3 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Aspect</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">DPDP Act (India)</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">GDPR (EU)</div>
            </div>
            {childrenData.map((row, idx) => (
              <div key={row.aspect} className={`grid grid-cols-3 gap-0 px-6 py-4 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-primary-gold/[0.01]'}`}>
                <div className="font-sans font-bold text-[13px]">{row.aspect}</div>
                <div className="font-sans text-[12px] text-neutral-dark/60 leading-relaxed">{row.dpdp}</div>
                <div className="font-sans text-[12px] text-neutral-dark/60 leading-relaxed">{row.gdpr}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-primary-gold/5 border border-primary-gold/10 p-8">
            <p className="font-sans text-[13px] text-neutral-dark/50 leading-relaxed italic">
              <strong className="text-primary-gold not-italic">Healthcare Impact:</strong> Our pipeline processes MIMIC-IV data which includes patients of all ages. Pediatric records (patients under 18) are subject to stricter consent and processing requirements. Our anonymisation layer treats all records equally — ensuring that even children's data has PII removed before any processing occurs, satisfying both DPDP §9 and GDPR Art. 8 requirements.
            </p>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

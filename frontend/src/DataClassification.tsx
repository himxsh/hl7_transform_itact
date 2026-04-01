import { motion } from 'motion/react';
import { Layers, Database, Shield, AlertTriangle } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const categories = [
  {
    type: 'Personal Data',
    color: 'border-blue-300 bg-blue-50',
    tagColor: 'bg-blue-100 text-blue-700 border-blue-200',
    definition: 'Any data about an individual who is identifiable by or in relation to such data.',
    source: 'DPDP Act §2(t)',
    examples: ['Patient Name', 'Subject ID', 'Date of Birth', 'Gender', 'Contact Information', 'Email Address'],
    inPipeline: ['subject_id (→ pseudonymised)', 'gender (retained)', 'anchor_age (→ derived birth_year)'],
    protectionLevel: 'Standard',
    protectionBar: 40,
  },
  {
    type: 'Sensitive Personal Data (SPDI)',
    color: 'border-amber-300 bg-amber-50',
    tagColor: 'bg-amber-100 text-amber-700 border-amber-200',
    definition: 'Passwords, financial data, physical/mental health condition, sexual orientation, medical records, biometric data.',
    source: 'IT Act SPDI Rules 2011, Rule 3',
    examples: ['Health Records', 'Lab Test Results', 'Medical Diagnoses', 'Biometric Data', 'Sexual Orientation', 'Financial Information'],
    inPipeline: ['Lab values (OBX segments)', 'Clinical notes (NTE segments)', 'Health status flags'],
    protectionLevel: 'Enhanced',
    protectionBar: 70,
  },
  {
    type: 'Critical Personal Data',
    color: 'border-red-300 bg-red-50',
    tagColor: 'bg-red-100 text-red-700 border-red-200',
    definition: 'Data designated by the Central Government as critical — military, national security, or data whose breach could impact sovereignty.',
    source: 'PDP Bill 2019 §33 (concept retained in policy)',
    examples: ['Military Health Records', 'National Security Personnel Data', 'Intelligence Agency Records', 'Critical Infrastructure Data'],
    inPipeline: ['Not processed — pipeline handles civilian clinical data only'],
    protectionLevel: 'Maximum',
    protectionBar: 100,
  },
  {
    type: 'Non-Personal Data',
    color: 'border-green-300 bg-green-50',
    tagColor: 'bg-green-100 text-green-700 border-green-200',
    definition: 'Data that does not relate to an identified or identifiable individual. Includes anonymised data, aggregated statistics, and metadata.',
    source: 'NPD Committee Report 2020',
    examples: ['Anonymised Lab Averages', 'Hospital Throughput Statistics', 'Aggregated Disease Prevalence', 'Equipment Metadata'],
    inPipeline: ['Post-anonymisation output (identity is irreversibly masked)', 'Pipeline audit logs (no PII)'],
    protectionLevel: 'Minimal',
    protectionBar: 15,
  },
];

const spdiRuleDetails = [
  { rule: 'Rule 3', title: 'Definition of SPDI', detail: 'Lists 8 categories: passwords, financial, health, sexual orientation, medical records, biometrics, genetic data, transgender status.' },
  { rule: 'Rule 4', title: 'Privacy Policy', detail: 'Body corporate must publish a clear privacy policy covering types of data collected, purpose, recipients, security practices, and grievance officer details.' },
  { rule: 'Rule 5', title: 'Consent Requirements', detail: 'SPDI can only be collected with consent in writing (including electronic). Opt-in only. Consent can be withdrawn at any time.' },
  { rule: 'Rule 5(7)', title: 'Purpose Limitation', detail: 'SPDI shall not be collected unless it is necessary for a lawful purpose connected with a function or activity of the body corporate.' },
  { rule: 'Rule 6', title: 'Disclosure Restrictions', detail: 'SPDI cannot be disclosed to third parties without prior consent, except when required by law or for legally binding contracts.' },
  { rule: 'Rule 7', title: 'Transfer Restrictions', detail: 'Cross-border transfer of SPDI allowed only if the recipient ensures the same level of data protection. Transfer must be contractually required.' },
  { rule: 'Rule 8', title: 'Reasonable Security Practices', detail: 'Body corporate must implement security practices conforming to IS/ISO/IEC 27001 or equivalent. Documented information security policy required.' },
];

const dataTypeBreakdown = [
  { field: 'subject_id', originalType: 'Personal', afterAnonymisation: 'Non-Personal', treatment: 'Used as seed for deterministic pseudonym, not stored in output' },
  { field: 'Patient Name', originalType: 'Personal', afterAnonymisation: 'Non-Personal', treatment: 'Replaced with Faker-generated Indian name (deterministic)' },
  { field: 'Patient Address', originalType: 'Personal', afterAnonymisation: 'Non-Personal', treatment: 'Replaced with Faker-generated Indian address' },
  { field: 'gender', originalType: 'Personal', afterAnonymisation: 'Personal', treatment: 'Retained — clinical necessity for lab reference ranges' },
  { field: 'Lab Values (OBX)', originalType: 'SPDI (Health)', afterAnonymisation: 'SPDI (Health)', treatment: 'Retained — core clinical data, but de-linked from identity' },
  { field: 'Clinical Notes (NTE)', originalType: 'SPDI (Health)', afterAnonymisation: 'SPDI (Health)*', treatment: 'Regex-scrubbed for Aadhaar, PAN, email, phone numbers' },
  { field: 'Aadhaar in Notes', originalType: 'Personal', afterAnonymisation: 'Removed', treatment: 'Regex: 12-digit pattern replaced with [REDACTED]' },
  { field: 'PAN in Notes', originalType: 'Personal', afterAnonymisation: 'Removed', treatment: 'Regex: [A-Z]{5}[0-9]{4}[A-Z] replaced with [REDACTED]' },
  { field: 'SHA-256 Hash (ZSH)', originalType: 'N/A', afterAnonymisation: 'Non-Personal', treatment: 'Generated post-serialisation — cryptographic integrity seal' },
];

export default function DataClassification() {
  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="data-classification" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Hero */}
        <div className="flex flex-col mb-20 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-3xl"
          >
            Data <span className="italic font-title text-primary-gold">Classification</span> Matrix
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            Understanding the taxonomy of data types under Indian law — Personal, Sensitive Personal, Critical, and Non-Personal — and how our pipeline handles each category.
          </motion.p>
        </div>

        {/* Classification Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Layers className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Data Type Taxonomy</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {categories.map((cat, idx) => (
              <motion.div
                key={cat.type}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={`border-2 ${cat.color} p-8`}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-title text-xl">{cat.type}</h3>
                  <span className={`font-mono text-[9px] uppercase tracking-widest px-3 py-1 border ${cat.tagColor}`}>{cat.protectionLevel}</span>
                </div>
                <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed mb-4">{cat.definition}</p>
                <span className="font-mono text-[10px] text-neutral-dark/30 block mb-6">{cat.source}</span>

                <div className="mb-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-dark/40 block mb-2">Examples</span>
                  <div className="flex flex-wrap gap-2">
                    {cat.examples.map(e => (
                      <span key={e} className="font-mono text-[9px] px-2 py-1 bg-white/80 border border-neutral-dark/10 text-neutral-dark/50">{e}</span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-dark/40 block mb-2">In Our Pipeline</span>
                  <div className="space-y-1">
                    {cat.inPipeline.map(i => (
                      <div key={i} className="font-sans text-[11px] text-neutral-dark/50 flex items-start gap-2">
                        <span className="text-primary-gold shrink-0">→</span> {i}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-dark/40 block mb-2">Protection Level</span>
                  <div className="w-full bg-white/60 h-3 rounded-sm overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${cat.protectionBar}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-primary-gold rounded-sm"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* SPDI Rules Detail */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Shield className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">SPDI Rules 2011 — Detailed Provisions</h2>
          </div>

          <div className="space-y-4">
            {spdiRuleDetails.map((r, idx) => (
              <motion.div
                key={r.rule}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white border border-primary-gold/10 p-6 flex items-start gap-6 hover:border-primary-gold/30 transition-all"
              >
                <span className="font-mono text-[11px] text-primary-gold font-bold shrink-0 bg-primary-gold/10 px-3 py-1 rounded-sm">{r.rule}</span>
                <div>
                  <h3 className="font-sans font-bold text-sm mb-1">{r.title}</h3>
                  <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed">{r.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Pipeline Data Type Breakdown Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Database className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Pipeline Data Classification Breakdown</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Field</div>
              <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Original Type</div>
              <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">After Anonymisation</div>
              <div className="col-span-6 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Treatment</div>
            </div>
            {dataTypeBreakdown.map((row, idx) => (
              <div key={row.field} className={`grid grid-cols-12 gap-0 px-6 py-4 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-primary-gold/[0.01]'}`}>
                <div className="col-span-2 font-mono text-[11px] text-neutral-dark/70 font-bold">{row.field}</div>
                <div className="col-span-2 font-sans text-[12px] text-neutral-dark/60">{row.originalType}</div>
                <div className={`col-span-2 font-sans text-[12px] ${row.afterAnonymisation === 'Removed' ? 'text-red-500 font-bold' : row.afterAnonymisation === 'Non-Personal' ? 'text-green-600' : 'text-neutral-dark/60'}`}>
                  {row.afterAnonymisation}
                </div>
                <div className="col-span-6 font-sans text-[12px] text-neutral-dark/50 leading-relaxed">{row.treatment}</div>
              </div>
            ))}
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}

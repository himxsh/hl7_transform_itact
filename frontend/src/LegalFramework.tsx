import { motion } from 'motion/react';
import { BookOpen, Scale, Clock, Layers, ChevronRight } from 'lucide-react';
import Header from './Header';
import { useState } from 'react';

const definitions = [
  { term: 'Data', definition: 'A representation of information, knowledge, facts, concepts or instructions which are being prepared, processed or stored in a formalised manner.', source: 'IT Act §2(1)(o)' },
  { term: 'Personal Data', definition: 'Any data about an individual who is identifiable by or in relation to such data. Includes name, address, biometric data, financial information, etc.', source: 'DPDP Act §2(t)' },
  { term: 'Sensitive Personal Data (SPDI)', definition: 'Passwords, financial data, health data, sexual orientation, medical records, biometric data. Requires higher protection standards.', source: 'SPDI Rules 2011, Rule 3' },
  { term: 'Non-Personal Data', definition: 'Data that does not relate to an identified or identifiable individual. Includes anonymised, aggregated, or statistical data.', source: 'NPD Committee Report 2020' },
  { term: 'Metadata', definition: 'Data about data — describes the structure, context, and provenance of other data. E.g., timestamps, file sizes, sender/receiver info.', source: 'General Definition' },
  { term: 'Big Data', definition: 'Extremely large datasets characterised by Volume, Velocity, Variety, and Veracity (4 V\'s) that require advanced processing capabilities.', source: 'Industry Standard' },
  { term: 'Digital Person', definition: 'A natural person identified or identifiable through digital means — email, IP address, device ID, cookie identifiers, biometric markers.', source: 'GDPR Rec. 26' },
  { term: 'Data Principal', definition: 'The individual to whom the personal data relates. In our pipeline, this is the patient whose clinical records are being processed.', source: 'DPDP Act §2(j)' },
  { term: 'Data Fiduciary', definition: 'Any person (including an organisation) that alone or jointly determines the purpose and means of processing personal data.', source: 'DPDP Act §2(i)' },
  { term: 'Data Processor', definition: 'Any person who processes personal data on behalf of a Data Fiduciary. Our HL7 pipeline acts in this capacity.', source: 'DPDP Act §2(k)' },
  { term: 'Electronic Record', definition: 'Data, record, image or sound stored, received, or sent in an electronic form or micro film or computer generated micro fiche.', source: 'IT Act §2(1)(t)' },
  { term: 'De-identification', definition: 'The process of removing or masking personal identifiers such that the data can no longer be attributed to a specific individual without additional information.', source: 'DPDP Act §2(h)' },
  { term: 'Anonymisation', definition: 'Irreversible de-identification where re-identification is not reasonably possible. Goes beyond pseudonymisation.', source: 'GDPR Rec. 26' },
  { term: 'Health Data', definition: 'Personal data related to physical or mental health, provision of health services, genetic data, and biometric data used for identification.', source: 'DISHA Draft §3' },
];

const principles = [
  { name: 'Notice', description: 'Data principals must be informed about the collection and use of their personal data before or at the time of collection.', icon: '📋' },
  { name: 'Choice & Consent', description: 'Individuals must have the option to provide or withhold consent for data processing activities. Consent must be free, specific, informed, and unambiguous.', icon: '✋' },
  { name: 'Purpose Limitation', description: 'Personal data shall be collected only for specified, clear, and lawful purposes and not further processed in a manner incompatible with those purposes.', icon: '🎯' },
  { name: 'Data Minimisation', description: 'Only the minimum amount of personal data necessary for the purpose should be collected. Our pipeline strips non-essential columns at ingestion.', icon: '📉' },
  { name: 'Data Quality & Accuracy', description: 'Reasonable steps must be taken to ensure personal data is accurate, complete, and not misleading. Stale data must be updated or deleted.', icon: '✅' },
  { name: 'Storage Limitation', description: 'Personal data should not be retained longer than necessary for the purpose for which it was collected. After processing, data should be erased.', icon: '⏰' },
  { name: 'Accountability', description: 'The data fiduciary is responsible for complying with all data protection principles and must be able to demonstrate compliance.', icon: '📊' },
  { name: 'Security Safeguards', description: 'Appropriate technical and organisational measures must be implemented to protect personal data. Our SHA-256 sealing provides tamper-evidence.', icon: '🔒' },
];

const timeline = [
  { year: '2000', event: 'Information Technology Act', detail: 'India\'s first cyber law. Established legal recognition for electronic records and digital signatures. Defined cyber offences and penalties.' },
  { year: '2008', event: 'IT Act Amendment', detail: 'Major overhaul adding §43A (compensation for failure to protect data), §66A-§66F (new cyber offences), §72A (breach of confidentiality).' },
  { year: '2011', event: 'SPDI Rules', detail: 'Sensitive Personal Data or Information Rules notified under §43A. First formal definition of sensitive personal data in India (health data, financial data, passwords, biometrics).' },
  { year: '2017', event: 'Puttaswamy Judgment', detail: 'Landmark 9-judge Supreme Court bench unanimously declared Right to Privacy as a Fundamental Right under Article 21 of the Constitution.' },
  { year: '2018', event: 'Srikrishna Committee', detail: 'Justice B.N. Srikrishna Committee submitted report "A Free and Fair Digital Economy" with draft Personal Data Protection Bill, 2018.' },
  { year: '2019', event: 'PDP Bill 2019', detail: 'Personal Data Protection Bill introduced in Parliament. Covered consent, data localisation, Data Protection Authority, children\'s data. Later withdrawn.' },
  { year: '2023', event: 'DPDP Act 2023', detail: 'Digital Personal Data Protection Act enacted on 11 August 2023. Simplified framework with Data Fiduciary obligations, consent requirements, ₹250 Cr maximum penalties.' },
  { year: '2025', event: 'DPDP Rules (Draft)', detail: 'Draft rules released for public consultation. Operationalise the DPDP Act — consent managers, Data Protection Board procedures, cross-border transfer whitelist.' },
];

export default function LegalFramework() {
  const [expandedDef, setExpandedDef] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="legal-framework" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Hero */}
        <div className="flex flex-col mb-20 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-3xl"
          >
            Legal <span className="italic font-title text-primary-gold">Framework</span> & Definitions
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            The foundational terminology, privacy principles, and legislative history underpinning India's data protection ecosystem.
          </motion.p>
        </div>

        {/* Key Definitions Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <BookOpen className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Key Definitions</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="col-span-3 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Term</div>
              <div className="col-span-7 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Definition</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Source</div>
            </div>

            {/* Table Rows */}
            {definitions.map((def, idx) => (
              <div
                key={def.term}
                className={`grid grid-cols-12 gap-0 px-6 py-5 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors cursor-pointer ${expandedDef === idx ? 'bg-primary-gold/[0.03]' : ''}`}
                onClick={() => setExpandedDef(expandedDef === idx ? null : idx)}
              >
                <div className="col-span-3 font-sans font-bold text-sm flex items-start gap-2">
                  <ChevronRight size={14} className={`text-primary-gold mt-0.5 shrink-0 transition-transform ${expandedDef === idx ? 'rotate-90' : ''}`} />
                  {def.term}
                </div>
                <div className="col-span-7 font-sans text-[13px] text-neutral-dark/70 leading-relaxed">{def.definition}</div>
                <div className="col-span-2 font-mono text-[10px] text-primary-gold/60">{def.source}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 font-mono text-[10px] text-neutral-dark/30 text-right">{definitions.length} definitions indexed</div>
        </motion.section>

        {/* Privacy Principles */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Scale className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Privacy Principles</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {principles.map((principle, idx) => (
              <motion.div
                key={principle.name}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-primary-gold/10 p-8 group hover:border-primary-gold/30 transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-2xl">{principle.icon}</span>
                  <h3 className="font-title text-xl">{principle.name}</h3>
                </div>
                <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed">{principle.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Clock className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Evolution of Indian Data Protection Law</h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[60px] top-0 bottom-0 w-px bg-primary-gold/20" />

            <div className="space-y-0">
              {timeline.map((item, idx) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.08 }}
                  className="flex items-start gap-8 group py-8"
                >
                  <div className="shrink-0 w-[120px] text-right">
                    <span className="font-title text-3xl text-primary-gold group-hover:text-neutral-dark transition-colors">{item.year}</span>
                  </div>
                  <div className="relative -ml-[4px] mt-3">
                    <div className="w-3 h-3 rounded-full bg-primary-gold/30 border-2 border-primary-gold group-hover:scale-150 transition-transform" />
                  </div>
                  <div className="bg-white border border-primary-gold/10 p-8 flex-1 group-hover:border-primary-gold/30 transition-all">
                    <h3 className="font-title text-xl mb-2">{item.event}</h3>
                    <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed">{item.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Info-Privacy Distinction */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Layers className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Legislative Privacy vs Informational Privacy</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white border border-primary-gold/10 p-10">
              <span className="font-mono text-[10px] text-primary-gold uppercase tracking-widest block mb-4">Constitutional</span>
              <h3 className="font-title text-2xl mb-4">Legislative Privacy</h3>
              <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed mb-6">
                Derives from the constitutional right under Article 21 (Right to Life and Personal Liberty). Established by the Supreme Court in <strong>K.S. Puttaswamy v. Union of India (2017)</strong> as a fundamental right.
              </p>
              <ul className="space-y-3 font-sans text-[12px] text-neutral-dark/50">
                <li className="flex items-start gap-2"><span className="text-primary-gold">→</span> Bodily privacy (physical autonomy)</li>
                <li className="flex items-start gap-2"><span className="text-primary-gold">→</span> Decisional privacy (personal choices)</li>
                <li className="flex items-start gap-2"><span className="text-primary-gold">→</span> Privacy of personal information</li>
              </ul>
            </div>
            <div className="bg-white border border-primary-gold/20 p-10 ring-1 ring-primary-gold/10 shadow-[0_10px_40px_-15px_rgba(193,175,134,0.2)]">
              <span className="font-mono text-[10px] text-primary-gold uppercase tracking-widest block mb-4">Statutory</span>
              <h3 className="font-title text-2xl mb-4">Informational Privacy</h3>
              <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed mb-6">
                The right of individuals to control how their personal data is collected, used, stored, and shared. Codified in statutes like the DPDP Act 2023, IT Act 2000, and GDPR.
              </p>
              <ul className="space-y-3 font-sans text-[12px] text-neutral-dark/50">
                <li className="flex items-start gap-2"><span className="text-primary-gold">→</span> Right to know what data is collected</li>
                <li className="flex items-start gap-2"><span className="text-primary-gold">→</span> Right to consent or refuse processing</li>
                <li className="flex items-start gap-2"><span className="text-primary-gold">→</span> Right to correction and erasure</li>
                <li className="flex items-start gap-2"><span className="text-primary-gold">→</span> Right to data portability</li>
              </ul>
            </div>
          </div>
          <div className="mt-8 bg-primary-gold/5 border border-primary-gold/10 p-8">
            <p className="font-sans text-[13px] text-neutral-dark/50 leading-relaxed italic">
              <strong className="text-primary-gold not-italic">Our Pipeline's Position:</strong> By implementing deterministic pseudonymisation (DPDP §8) and SHA-256 integrity sealing (IT Act §43A), we operate at the intersection of both — protecting the patient's informational privacy through statutory compliance, while honouring the constitutional mandate of privacy as a fundamental right.
            </p>
          </div>
        </motion.section>
      </main>
    </div>
  );
}

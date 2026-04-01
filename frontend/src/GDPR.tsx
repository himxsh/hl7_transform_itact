import { motion } from 'motion/react';
import { Globe, Scale, ShieldAlert, BookOpen, ArrowLeftRight } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const gdprPrinciples = [
  { article: 'Art. 5(1)(a)', name: 'Lawfulness, Fairness & Transparency', description: 'Personal data must be processed lawfully, fairly, and transparently. The data subject must be informed of the processing.' },
  { article: 'Art. 5(1)(b)', name: 'Purpose Limitation', description: 'Data collected for specified, explicit, and legitimate purposes and not further processed incompatibly. Our pipeline only processes clinical lab data.' },
  { article: 'Art. 5(1)(c)', name: 'Data Minimisation', description: 'Data must be adequate, relevant, and limited to what is necessary. We strip non-essential columns at CSV ingestion stage.' },
  { article: 'Art. 5(1)(d)', name: 'Accuracy', description: 'Data must be accurate and kept up to date. Inaccurate data must be erased or rectified without delay.' },
  { article: 'Art. 5(1)(e)', name: 'Storage Limitation', description: 'Data must be kept only as long as necessary for the purpose. Identifiable data should be minimised once the purpose is fulfilled.' },
  { article: 'Art. 5(1)(f)', name: 'Integrity & Confidentiality', description: 'Data must be processed with appropriate security — protection against unauthorised access, loss, destruction. Our SHA-256 seal addresses this.' },
  { article: 'Art. 5(2)', name: 'Accountability', description: 'The controller must be able to demonstrate compliance with all the above principles. Our audit log and pipeline.log serve this purpose.' },
];

const dataSubjectRights = [
  { article: 'Art. 15', right: 'Right of Access', description: 'The data subject has the right to obtain confirmation whether personal data concerning them is being processed and access to that data.', pipelineMapping: 'Our HL7 viewer allows inspection of all processed records with full transparency.' },
  { article: 'Art. 16', right: 'Right to Rectification', description: 'The data subject has the right to have inaccurate personal data corrected without undue delay.', pipelineMapping: 'Source data corrections can be re-run through the pipeline to regenerate corrected HL7 output.' },
  { article: 'Art. 17', right: 'Right to Erasure ("Right to be Forgotten")', description: 'The data subject has the right to obtain erasure of personal data when it is no longer necessary, consent is withdrawn, or data was unlawfully processed.', pipelineMapping: 'Our pipeline processes data ephemerally — output files can be deleted to comply with erasure requests.' },
  { article: 'Art. 18', right: 'Right to Restriction of Processing', description: 'The data subject can restrict processing when accuracy is contested, processing is unlawful, or data is needed for legal claims.', pipelineMapping: 'Pipeline can be paused mid-execution to restrict processing of specific patient IDs.' },
  { article: 'Art. 20', right: 'Right to Data Portability', description: 'The data subject has the right to receive their personal data in a structured, machine-readable format and transmit it to another controller.', pipelineMapping: 'HL7 v2.5.1 IS the machine-readable, portable format — standard across all hospitals globally.' },
  { article: 'Art. 21', right: 'Right to Object', description: 'The data subject has the right to object to processing based on legitimate interests, including profiling.', pipelineMapping: 'Our pipeline does not perform profiling. Objection can be exercised before pipeline execution.' },
  { article: 'Art. 22', right: 'Right Against Automated Decision-Making', description: 'The data subject has the right not to be subject to decisions based solely on automated processing that produces legal or significant effects.', pipelineMapping: 'Our pipeline transforms data but makes no clinical decisions — it is a formatting tool, not a diagnostic system.' },
];

const comparisonTable = [
  { aspect: 'Full Name', gdpr: 'General Data Protection Regulation', dpdp: 'Digital Personal Data Protection Act' },
  { aspect: 'Year Enacted', gdpr: '2016 (enforced 2018)', dpdp: '2023 (rules pending)' },
  { aspect: 'Jurisdiction', gdpr: 'EU/EEA + extraterritorial', dpdp: 'India + data processed in India' },
  { aspect: 'Scope', gdpr: 'All personal data (physical + digital)', dpdp: 'Only digital personal data' },
  { aspect: 'Consent Requirement', gdpr: 'Opt-in, freely given, specific, informed', dpdp: 'Free, specific, informed, unconditional, unambiguous' },
  { aspect: 'Children\'s Data', gdpr: 'Below 16 years (member states can lower to 13)', dpdp: 'Below 18 years — verifiable parental consent' },
  { aspect: 'Right to Erasure', gdpr: '✅ Art. 17 — Right to be Forgotten', dpdp: '✅ §12(3) — Right to erasure on withdrawal of consent' },
  { aspect: 'Right to Portability', gdpr: '✅ Art. 20 — Machine-readable format', dpdp: '❌ Not explicitly provided' },
  { aspect: 'DPO Requirement', gdpr: '✅ Mandatory for certain controllers', dpdp: '❌ No DPO concept — Data Protection Board instead' },
  { aspect: 'Cross-Border Transfer', gdpr: 'Adequacy decisions, SCCs, BCRs', dpdp: 'Government whitelist of permitted countries' },
  { aspect: 'Enforcement Body', gdpr: 'National Data Protection Authorities (DPAs)', dpdp: 'Data Protection Board of India (DPBI)' },
  { aspect: 'Maximum Fine', gdpr: '€20 million or 4% global turnover', dpdp: '₹250 Crore (~€28 million)' },
  { aspect: 'Data Localisation', gdpr: 'No strict localisation (adequacy-based)', dpdp: 'Restricted transfer to blacklisted countries' },
  { aspect: 'Right to Object', gdpr: '✅ Art. 21', dpdp: '❌ Not explicitly provided — covered under consent withdrawal' },
  { aspect: 'Breach Notification', gdpr: '72 hours to DPA', dpdp: 'To DPBI and data principal "without delay"' },
];

const penalties = [
  { article: 'Art. 83(4)', category: 'General Violations', amount: 'Up to €10 million or 2% of global annual turnover', examples: 'Inadequate security measures, failure to maintain records, failure to notify breach' },
  { article: 'Art. 83(5)', category: 'Serious Violations', amount: 'Up to €20 million or 4% of global annual turnover', examples: 'Violation of core principles, lawfulness of processing, consent conditions, data subject rights' },
  { article: 'Art. 83(6)', category: 'Non-Compliance with Order', amount: 'Up to €20 million or 4% of global annual turnover', examples: 'Failure to comply with an order by a supervisory authority' },
];

export default function GDPR() {
  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="gdpr" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Hero */}
        <div className="flex flex-col mb-20 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-3xl"
          >
            <span className="italic font-title text-primary-gold">GDPR</span> & Global <br />Data Protection
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            The General Data Protection Regulation — the EU's landmark privacy framework that influenced India's DPDP Act.
            A detailed comparison of rights, principles, and penalties.
          </motion.p>
        </div>

        {/* GDPR Principles */}
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
            <h2 className="font-title text-3xl">Core Principles (Article 5)</h2>
          </div>

          <div className="space-y-4">
            {gdprPrinciples.map((p, idx) => (
              <motion.div
                key={p.article}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white border border-primary-gold/10 p-6 flex items-start gap-6 hover:border-primary-gold/30 transition-all group"
              >
                <span className="font-mono text-[11px] text-primary-gold font-bold shrink-0 bg-primary-gold/10 px-3 py-1 rounded-sm">{p.article}</span>
                <div>
                  <h3 className="font-sans font-bold text-sm mb-1">{p.name}</h3>
                  <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed">{p.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Rights of Data Subjects */}
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
            <h2 className="font-title text-3xl">Rights of Data Subjects</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="col-span-1 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Art.</div>
              <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Right</div>
              <div className="col-span-5 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Description</div>
              <div className="col-span-4 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Pipeline Mapping</div>
            </div>
            {dataSubjectRights.map((r) => (
              <div key={r.article} className="grid grid-cols-12 gap-0 px-6 py-5 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors">
                <div className="col-span-1 font-mono text-[11px] text-primary-gold font-bold">{r.article}</div>
                <div className="col-span-2 font-sans font-bold text-[13px]">{r.right}</div>
                <div className="col-span-5 font-sans text-[12px] text-neutral-dark/60 leading-relaxed">{r.description}</div>
                <div className="col-span-4 font-sans text-[12px] text-neutral-dark/40 leading-relaxed italic">{r.pipelineMapping}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* GDPR vs DPDP Comparison */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <ArrowLeftRight className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">GDPR vs DPDP Act — Comparison</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-3 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Aspect</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">GDPR (EU)</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">DPDP Act (India)</div>
            </div>
            {comparisonTable.map((row, idx) => (
              <div
                key={row.aspect}
                className={`grid grid-cols-3 gap-0 px-6 py-4 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-primary-gold/[0.01]'}`}
              >
                <div className="font-sans font-bold text-[13px]">{row.aspect}</div>
                <div className="font-sans text-[12px] text-neutral-dark/60 leading-relaxed">{row.gdpr}</div>
                <div className="font-sans text-[12px] text-neutral-dark/60 leading-relaxed">{row.dpdp}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Penalties Bar Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <ShieldAlert className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">GDPR Penalties</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {penalties.map((p, idx) => (
              <motion.div
                key={p.article}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-primary-gold/10 p-8 hover:border-primary-gold/30 transition-all"
              >
                <span className="font-mono text-[10px] text-primary-gold font-bold block mb-3">{p.article}</span>
                <h3 className="font-title text-xl mb-2">{p.category}</h3>
                <div className="font-title text-2xl text-primary-gold mb-4">{p.amount}</div>
                <p className="font-sans text-[12px] text-neutral-dark/50 leading-relaxed">{p.examples}</p>
              </motion.div>
            ))}
          </div>

          {/* Penalty Comparison Visual */}
          <div className="bg-white border border-primary-gold/10 p-10">
            <h3 className="font-title text-xl mb-8">Penalty Comparison — GDPR vs DPDP Act</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[11px] font-mono mb-2">
                  <span className="text-neutral-dark/60">GDPR Maximum</span>
                  <span className="text-primary-gold font-bold">€20 Million / 4% Global Turnover</span>
                </div>
                <div className="w-full bg-primary-gold/10 h-8 rounded-sm overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary-gold/60 to-primary-gold rounded-sm"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-mono mb-2">
                  <span className="text-neutral-dark/60">DPDP Act Maximum</span>
                  <span className="text-primary-gold font-bold">₹250 Crore (~€28 Million)</span>
                </div>
                <div className="w-full bg-primary-gold/10 h-8 rounded-sm overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '85%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-primary-gold/40 to-primary-gold/70 rounded-sm"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-mono mb-2">
                  <span className="text-neutral-dark/60">IT Act §43A (India)</span>
                  <span className="text-primary-gold font-bold">₹5 Crore (~€550K)</span>
                </div>
                <div className="w-full bg-primary-gold/10 h-8 rounded-sm overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '8%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
                    className="h-full bg-gradient-to-r from-primary-gold/20 to-primary-gold/40 rounded-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}

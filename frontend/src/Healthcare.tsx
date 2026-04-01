import { motion } from 'motion/react';
import { Heart, Building2, ArrowLeftRight, Shield, FileText, Scale } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const nehaFunctions = [
  'Develop and maintain standards for Electronic Health Records (EHR)',
  'Regulate Health Information Exchanges (HIEs) across the country',
  'Ensure interoperability of digital health systems using HL7, FHIR, SNOMED-CT',
  'Establish privacy and security standards for health data',
  'Promote adoption of digital health technologies in public healthcare',
  'Coordinate with State eHealth Authorities (SeHAs) for implementation',
  'Maintain National Health Information Network (NHIN)',
];

const sehaFunctions = [
  'Implement National eHealth Authority directives at the state level',
  'Manage state-level Health Information Exchanges',
  'Ensure state healthcare facilities comply with EHR standards',
  'Conduct audits of digital health data practices in state hospitals',
  'Coordinate with district-level health infrastructure',
  'Report health data incidents to NeHA',
];

const hieStandards = [
  { standard: 'HL7 v2.x', description: 'Pipe-delimited messaging standard for clinical data exchange between hospital systems. Our pipeline generates HL7 v2.5.1 ORU^R01 messages.', relevance: 'Core output format of our pipeline' },
  { standard: 'HL7 FHIR', description: 'Fast Healthcare Interoperability Resources — RESTful API-based modern alternative. Uses JSON/XML for resource representation.', relevance: 'Next-generation standard (future scope)' },
  { standard: 'SNOMED-CT', description: 'Systematized Nomenclature of Medicine — Clinical Terms. Standardised vocabulary for clinical documentation.', relevance: 'Used in OBX segment coding' },
  { standard: 'LOINC', description: 'Logical Observation Identifiers Names and Codes — universal standard for lab and clinical observations.', relevance: 'Lab test identification in our OBR segments' },
  { standard: 'ICD-10', description: 'International Classification of Diseases — diagnostic coding standard maintained by WHO.', relevance: 'Diagnostic codes referenced in DG1 segments' },
  { standard: 'DICOM', description: 'Digital Imaging and Communications in Medicine — standard for medical imaging data.', relevance: 'Adjacent standard (not used in our pipeline)' },
];

const dishaProvisions = [
  { section: '§3', title: 'Definitions', detail: 'Defines "digital health data," "clinical establishment," "health information exchange," and "owner of health data."' },
  { section: '§7', title: 'Digital Health Data Ownership', detail: 'The health data belongs to the person it relates to (the patient), NOT the hospital or doctor who generated it.' },
  { section: '§8', title: 'Collection & Purpose', detail: 'Health data can only be collected for treatment, public health, medical research, or insurance claims — not commercial purposes.' },
  { section: '§10', title: 'Security Standards', detail: 'Clinical establishments must implement encryption, access controls, audit trails, and breach notification mechanisms.' },
  { section: '§21', title: 'Breach Notification', detail: 'Any breach of digital health data must be reported to NeHA and the affected data owner within 72 hours.' },
  { section: '§29', title: 'Offences & Penalties', detail: 'Unauthorised access: up to ₹5 lakhs. Breach of confidentiality: up to 3 years imprisonment + ₹10 lakhs fine.' },
  { section: '§30', title: 'Commercial Use Prohibition', detail: 'Using digital health data for commercial gain without explicit patient consent is punishable with ₹1 crore fine.' },
];

const ownershipDebate = [
  { stakeholder: 'Patient', claim: 'Fundamental right to privacy extends to health data. The data describes their body — they are the natural owner.', legal: 'DPDP Act §2(j) — Data Principal, DISHA §7' },
  { stakeholder: 'Hospital / Doctor', claim: 'Created the record, invested resources in diagnosis and documentation. Claims custodial ownership.', legal: 'Indian Medical Council Regulations, Clinical Establishments Act' },
  { stakeholder: 'Government', claim: 'Public health surveillance requires aggregated health data. De-identified data serves epidemiological research.', legal: 'Epidemic Diseases Act, DPDP Act §9 (State processing)' },
  { stakeholder: 'Insurance Companies', claim: 'Require health data for underwriting and claims processing. Access should be limited to specific purposes.', legal: 'IRDAI Regulations, DPDP Act §8(1) (purpose limitation)' },
];

export default function Healthcare() {
  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="healthcare" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Hero */}
        <div className="flex flex-col mb-20 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-3xl"
          >
            Healthcare <br />
            <span className="italic font-title text-primary-gold">Data Protection</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            NeHA, SeHA, Health Information Exchanges, and the DISHA framework — how India's healthcare data ecosystem
            is governed, and where our HL7 pipeline fits.
          </motion.p>
        </div>

        {/* NeHA & SeHA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* NeHA */}
            <div className="bg-white border border-primary-gold/20 p-10 shadow-[0_10px_40px_-15px_rgba(193,175,134,0.15)]">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
                  <Building2 className="text-primary-gold" size={24} />
                </div>
                <div>
                  <h2 className="font-title text-2xl">NeHA</h2>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-primary-gold/70">National eHealth Authority</p>
                </div>
              </div>
              <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed mb-6">
                The apex regulatory body proposed under the National Health Policy 2017 for governing digital health data in India.
                Responsible for setting standards, ensuring interoperability, and protecting patient privacy at the national level.
              </p>
              <div className="space-y-3">
                {nehaFunctions.map((fn, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="font-mono text-[10px] text-primary-gold font-bold shrink-0 mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                    <p className="font-sans text-[12px] text-neutral-dark/50 leading-relaxed">{fn}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* SeHA */}
            <div className="bg-white border border-primary-gold/10 p-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
                  <Building2 className="text-primary-gold" size={24} />
                </div>
                <div>
                  <h2 className="font-title text-2xl">SeHA</h2>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-primary-gold/70">State eHealth Authority</p>
                </div>
              </div>
              <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed mb-6">
                State-level bodies that implement NeHA directives locally. Each state is expected to create a SeHA to manage
                digital health infrastructure, enforce data standards, and conduct compliance audits.
              </p>
              <div className="space-y-3">
                {sehaFunctions.map((fn, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="font-mono text-[10px] text-primary-gold font-bold shrink-0 mt-0.5">{String(idx + 1).padStart(2, '0')}</span>
                    <p className="font-sans text-[12px] text-neutral-dark/50 leading-relaxed">{fn}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* HIE Standards Table */}
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
            <h2 className="font-title text-3xl">Health Information Exchange Standards</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Standard</div>
              <div className="col-span-6 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Description</div>
              <div className="col-span-4 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Our Pipeline Relevance</div>
            </div>
            {hieStandards.map((s, idx) => (
              <div key={s.standard} className={`grid grid-cols-12 gap-0 px-6 py-5 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors ${idx === 0 ? 'bg-primary-gold/[0.03]' : ''}`}>
                <div className="col-span-2 font-mono text-[12px] text-primary-gold font-bold">{s.standard}</div>
                <div className="col-span-6 font-sans text-[13px] text-neutral-dark/60 leading-relaxed">{s.description}</div>
                <div className={`col-span-4 font-sans text-[12px] leading-relaxed ${idx === 0 ? 'text-primary-gold font-bold' : 'text-neutral-dark/40 italic'}`}>{s.relevance}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* DISHA Framework */}
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
            <h2 className="font-title text-3xl">DISHA — Digital Information Security in Healthcare Act</h2>
          </div>

          <p className="font-sans text-neutral-dark/60 max-w-2xl leading-relaxed mb-8">
            The Digital Information Security in Healthcare Act (DISHA) is a draft legislation specifically designed for
            healthcare data protection. Though not yet enacted, it provides the most comprehensive framework for governing
            digital health data in India.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dishaProvisions.map((p, idx) => (
              <motion.div
                key={p.section}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white border border-primary-gold/10 p-8 hover:border-primary-gold/30 transition-all"
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-[11px] text-primary-gold font-bold shrink-0 bg-primary-gold/10 px-3 py-1 rounded-sm">{p.section}</span>
                  <div>
                    <h3 className="font-sans font-bold text-sm mb-2">{p.title}</h3>
                    <p className="font-sans text-[12px] text-neutral-dark/50 leading-relaxed">{p.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Data Ownership Debate */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Scale className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Data Ownership — Who Owns Health Data?</h2>
          </div>

          <div className="space-y-6">
            {ownershipDebate.map((item, idx) => (
              <motion.div
                key={item.stakeholder}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="bg-white border border-primary-gold/10 p-8 flex items-start gap-8 hover:border-primary-gold/30 transition-all"
              >
                <div className="shrink-0 w-40">
                  <h3 className="font-title text-2xl text-primary-gold">{item.stakeholder}</h3>
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed mb-3">{item.claim}</p>
                  <span className="font-mono text-[10px] text-primary-gold/50">{item.legal}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 bg-primary-gold/5 border border-primary-gold/10 p-8">
            <p className="font-sans text-[13px] text-neutral-dark/50 leading-relaxed italic">
              <strong className="text-primary-gold not-italic">Our Pipeline's Role:</strong> By anonymizing patient data at the earliest possible stage (before HL7 serialisation) and providing tamper-evident sealing,
              we ensure that health data can be used for legitimate clinical and research purposes without compromising the patient's fundamental ownership rights.
              Our HL7 v2.5.1 output format is the global standard for Health Information Exchange — making our pipeline directly aligned with NeHA's interoperability mandate.
            </p>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}

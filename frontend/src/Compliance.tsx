import { Shield, Lock, FileCheck, Scale, Info, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { motion } from 'motion/react';

export default function Compliance() {
  const laws = [
    {
      title: "DPDP Act 2023",
      subtitle: "Digital Personal Data Protection",
      icon: <Shield className="text-primary-gold" size={24} />,
      sections: [
        { id: "§4", topic: "Consent", details: "Processing of personal data is only permitted for a lawful purpose after obtaining consent of the data principal. Our pipeline requires explicit dataset selection before processing." },
        { id: "§5", topic: "Notice Before Consent", details: "Every data fiduciary must provide a clear notice to the data principal before obtaining consent. Our dashboard displays dataset descriptions and processing purpose before pipeline execution." },
        { id: "§6", topic: "Consent Characteristics", details: "Consent must be free, specific, informed, and unambiguous. Our pipeline separates each processing purpose — clinical processing, anonymisation, and sealing are distinct, auditable steps." },
        { id: "§7", topic: "Deemed Consent", details: "Certain purposes (voluntary sharing, medical emergencies, employment) allow processing without explicit consent. Our clinical research use case falls under legitimate processing for medical purposes." },
        { id: "§8(3)", topic: "Purpose Limitation", details: "Personal data shall be processed only for the purpose for which consent was given. Our pipeline processes data only for HL7 transformation and clinical reporting — no secondary use." },
        { id: "§8(4)", topic: "Data Minimisation", details: "Only the minimum amount of personal data necessary for the stated purpose shall be collected. We strip non-essential CSV columns at the ingestion stage." },
        { id: "§8(7)", topic: "De-identification", details: "Mandatory automated masking of PII (Name, Address, Phone) using deterministic shifting to ensure 'Reasonable Anonymisation' before HL7 field population." },
        { id: "§8(8)", topic: "Storage Limitation", details: "Personal data shall be erased once the purpose has been fulfilled. Our pipeline does not persist raw data — only anonymised HL7 output is retained." },
        { id: "§9", topic: "Children's Data", details: "Processing data of children (below 18) requires verifiable parental consent. Behavioral tracking and profiling of children is prohibited. MIMIC-IV contains pediatric records subject to this provision." },
        { id: "§11", topic: "Data Principal Rights", details: "Providing full transparency through a real-time audit trail, allowing data fiduciaries to track the lifecycle of every transformed record." },
        { id: "§12(3)", topic: "Right to Erasure", details: "Data principal can request erasure of personal data when consent is withdrawn. Our pipeline output files can be deleted to comply with erasure requests." },
        { id: "§15", topic: "Data Breach Notification", details: "The data fiduciary must notify the Data Protection Board and each affected data principal of any breach. Our audit log provides the evidence trail for breach investigation." },
      ]
    },
    {
      title: "IT Act 2000",
      subtitle: "Information Technology Compliance",
      icon: <Scale className="text-primary-gold" size={24} />,
      sections: [
        { id: "§14", topic: "Secure Electronic Record", details: "An electronic record is 'secure' if a specific security procedure has been applied. Our SHA-256 ZSH segment makes every HL7 output a secure electronic record under this section." },
        { id: "§43", topic: "Penalty for Damage", details: "Compensation up to ₹1 Crore for unauthorised access, download, virus introduction, or denial of access to a computer system. Our access controls prevent unauthorised pipeline execution." },
        { id: "§43A", topic: "Security Practices", details: "Implementation of SHA-256 Hashing for every processed record to ensure data integrity and non-repudiation during inter-hospital transfers. Conforming to IS/ISO/IEC 27001 equivalent." },
        { id: "§65", topic: "Source Code Tampering", details: "Our pipeline's source code is version-controlled (Git). Any modification creates an auditable commit, preventing the offence of intentional source code tampering." },
        { id: "§66C", topic: "Identity Protection", details: "Protection against identity theft through secure local processing. No patient data leaves the secure execution environment until de-identification is complete." },
        { id: "§67C", topic: "Record Preservation", details: "Intermediaries must preserve and retain information as prescribed. Our pipeline.log serves as the preserved record of all processing activities." },
        { id: "§69", topic: "Interception Capability", details: "The system is designed to allow authorised government agencies to access processing records if lawfully directed, through the audit log interface." },
        { id: "§72A", topic: "Breach Prevention", details: "Encrypted output streams and integrity sealing designed to prevent accidental disclosure of Sensitive Personal Data or Information (SPDI)." },
      ]
    }
  ];

  const complianceMatrix = [
    { requirement: "PII De-identification", dpdp: true, itAct: false, gdpr: true, pipeline: true },
    { requirement: "SHA-256 Integrity Seal", dpdp: false, itAct: true, gdpr: true, pipeline: true },
    { requirement: "Audit Logging", dpdp: true, itAct: true, gdpr: true, pipeline: true },
    { requirement: "Purpose Limitation", dpdp: true, itAct: false, gdpr: true, pipeline: true },
    { requirement: "Data Minimisation", dpdp: true, itAct: false, gdpr: true, pipeline: true },
    { requirement: "Storage Limitation", dpdp: true, itAct: false, gdpr: true, pipeline: true },
    { requirement: "Right to Erasure", dpdp: true, itAct: false, gdpr: true, pipeline: true },
    { requirement: "Breach Notification", dpdp: true, itAct: true, gdpr: true, pipeline: false },
    { requirement: "Consent Management", dpdp: true, itAct: false, gdpr: true, pipeline: false },
    { requirement: "Children's Data Protection", dpdp: true, itAct: false, gdpr: true, pipeline: false },
    { requirement: "Cross-Border Restriction", dpdp: true, itAct: false, gdpr: true, pipeline: true },
    { requirement: "Data Portability (HL7)", dpdp: false, itAct: false, gdpr: true, pipeline: true },
    { requirement: "Source Code Integrity", dpdp: false, itAct: true, gdpr: false, pipeline: true },
    { requirement: "Secure Electronic Record", dpdp: false, itAct: true, gdpr: false, pipeline: true },
  ];

  const fiduciaryObligations = [
    { id: "1", obligation: "Appoint a contact person for grievance redressal", implemented: true },
    { id: "2", obligation: "Publish a privacy policy in clear, plain language", implemented: true },
    { id: "3", obligation: "Process data only for lawful purposes with valid consent", implemented: true },
    { id: "4", obligation: "Implement reasonable security safeguards", implemented: true },
    { id: "5", obligation: "Notify the Board and data principals of any breach", implemented: false },
    { id: "6", obligation: "Erase personal data when purpose is fulfilled or consent withdrawn", implemented: true },
    { id: "7", obligation: "Ensure accuracy and completeness of data", implemented: true },
    { id: "8", obligation: "Engage only those data processors with sufficient guarantees", implemented: true },
  ];

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="compliance" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Intro */}
        <div className="flex flex-col mb-20 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-2xl"
          >
            Compliance & <br />
            <span className="italic font-title text-primary-gold">Digital Integrity</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            HL7 Orchestrator operates under a strict "Privacy by Design" architecture, mapping every clinical transformation step to specific legislative mandates in the Indian legal landscape.
          </motion.p>
        </div>

        {/* Laws Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          {laws.map((law, idx) => (
            <motion.div
              key={law.title}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + (idx * 0.1) }}
              className="bg-white border border-primary-gold/10 p-10 rounded-sm relative group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary-gold/5 -mr-12 -mt-12 rounded-full group-hover:scale-150 transition-transform duration-700" />

              <div className="flex items-center gap-4 mb-8 relative">
                <div className="w-12 h-12 bg-bg-light rounded-sm flex items-center justify-center border border-primary-gold/20">
                  {law.icon}
                </div>
                <div>
                  <h2 className="font-title text-3xl text-neutral-dark">{law.title}</h2>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-primary-gold/70">{law.subtitle}</p>
                </div>
              </div>

              <div className="space-y-6 relative">
                {law.sections.map((section) => (
                  <div key={section.id} className="border-l-2 border-primary-gold/20 pl-6 group/item hover:border-primary-gold transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-[10px] text-primary-gold font-bold">{section.id}</span>
                      <h3 className="font-sans font-bold text-xs uppercase tracking-wider">{section.topic}</h3>
                    </div>
                    <p className="font-sans text-[12px] text-neutral-dark/60 leading-relaxed">
                      {section.details}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Compliance Matrix Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <FileCheck className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Compliance Checklist Matrix</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="col-span-4 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Requirement</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold text-center">DPDP Act</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold text-center">IT Act</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold text-center">GDPR</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold text-center">Our Pipeline</div>
            </div>
            {complianceMatrix.map((row, idx) => (
              <div key={row.requirement} className={`grid grid-cols-12 gap-0 px-6 py-4 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-primary-gold/[0.01]'}`}>
                <div className="col-span-4 font-sans text-[13px] font-medium">{row.requirement}</div>
                <div className="col-span-2 flex justify-center">{row.dpdp ? <CheckCircle2 size={16} className="text-green-500" /> : <span className="text-neutral-dark/20">—</span>}</div>
                <div className="col-span-2 flex justify-center">{row.itAct ? <CheckCircle2 size={16} className="text-green-500" /> : <span className="text-neutral-dark/20">—</span>}</div>
                <div className="col-span-2 flex justify-center">{row.gdpr ? <CheckCircle2 size={16} className="text-green-500" /> : <span className="text-neutral-dark/20">—</span>}</div>
                <div className="col-span-2 flex justify-center">{row.pipeline ? <CheckCircle2 size={16} className="text-primary-gold" /> : <AlertTriangle size={16} className="text-amber-400" />}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-6 justify-end">
            <div className="flex items-center gap-2 font-mono text-[9px] text-neutral-dark/40">
              <CheckCircle2 size={12} className="text-green-500" /> Required / Implemented
            </div>
            <div className="flex items-center gap-2 font-mono text-[9px] text-neutral-dark/40">
              <AlertTriangle size={12} className="text-amber-400" /> Planned
            </div>
          </div>
        </motion.section>

        {/* Obligations of Data Fiduciary */}
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
            <h2 className="font-title text-3xl">Obligations of a Data Fiduciary (DPDP §8)</h2>
          </div>

          <div className="space-y-4">
            {fiduciaryObligations.map((ob) => (
              <div key={ob.id} className="bg-white border border-primary-gold/10 p-6 flex items-center gap-6 hover:border-primary-gold/30 transition-all">
                <span className="font-mono text-[12px] text-primary-gold font-bold shrink-0 w-8">{ob.id}.</span>
                <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed flex-1">{ob.obligation}</p>
                {ob.implemented ? (
                  <span className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 bg-green-50 text-green-600 border border-green-200 shrink-0">Implemented</span>
                ) : (
                  <span className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 shrink-0">Planned</span>
                )}
              </div>
            ))}
          </div>
        </motion.section>

        {/* Audit Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="pt-12 border-t border-primary-gold/10 flex flex-col md:flex-row justify-between items-start gap-8"
        >
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="text-primary-gold" size={18} />
              <span className="font-title text-xl">Verification Hash</span>
            </div>
            <p className="font-sans text-xs text-neutral-dark/40 leading-relaxed mb-6">
              Every transformed HL7 message is automatically tagged with a cryptographic hash. This ensures the de-identified output can be verified against the source for compliance audits without exposing PII.
            </p>
            <div className="font-mono text-[10px] p-4 bg-bg-light rounded-sm border border-primary-gold/10 text-primary-gold/60 break-all">
              SHA256: 99A46234EB EFC795FF8C...AFF230D
            </div>
          </div>

          <div className="bg-primary-gold/5 p-8 rounded-sm border border-primary-gold/10 flex-1 w-full md:w-auto">
            <div className="flex items-center gap-3 mb-4">
              <Info className="text-primary-gold" size={18} />
              <span className="font-sans font-bold text-xs uppercase">Compliance Notice</span>
            </div>
            <p className="font-sans text-xs text-neutral-dark/60 leading-relaxed italic">
              "Anonymization is a dynamic process. Our system adopts a risk-based approach to ensure that the likelihood of re-identification is kept below acceptable clinical thresholds, meeting both international GDPR and domestic DPDP guidelines."
            </p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

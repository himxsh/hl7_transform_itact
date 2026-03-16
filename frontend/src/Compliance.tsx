import { Shield, Lock, FileCheck, Scale, Info } from 'lucide-react';
import Header from './Header';
import { motion } from 'motion/react';

export default function Compliance() {
  const laws = [
    {
      title: "DPDP Act 2023",
      subtitle: "Digital Personal Data Protection",
      icon: <Shield className="text-primary-gold" size={24} />,
      sections: [
        {
          id: "Sec 4",
          topic: "Data Minimization",
          details: "Our pipeline processes only the essential clinical segments (OBX, OBR, PID) required for HL7 transformation, stripping out non-essential metadata at ingestion."
        },
        {
          id: "Sec 7",
          topic: "De-identification",
          details: "Mandatory automated masking of PII (Name, Address, Phone) using deterministic shifting to ensure 'Reasonable Anonymization' as per the latest government standards."
        },
        {
          id: "Sec 11",
          topic: "Data Principal Rights",
          details: "Providing full transparency through a real-time audit trail, allowing data fiduciaries to track the lifecycle of every transformed record."
        }
      ]
    },
    {
      title: "IT Act 2000",
      subtitle: "Information Technology Compliance",
      icon: <Scale className="text-primary-gold" size={24} />,
      sections: [
        {
          id: "Sec 43A",
          topic: "Security Practices",
          details: "Implementation of SHA-256 Hashing for every processed record to ensure data integrity and non-repudiation during inter-hospital transfers."
        },
        {
          id: "Sec 66C",
          topic: "Identity Protection",
          details: "Protection against identity theft through secure local processing. No patient data leaves the secure execution environment until de-identification is complete."
        },
        {
          id: "Sec 72A",
          topic: "Breach Prevention",
          details: "Encrypted output streams and clinical intelligence layers designed to prevent accidental disclosure of Sensitive Personal Data or Information (SPDI)."
        }
      ]
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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

              <div className="space-y-8 relative">
                {law.sections.map((section) => (
                  <div key={section.id} className="border-l-2 border-primary-gold/20 pl-6 group/item hover:border-primary-gold transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-[10px] text-primary-gold font-bold">{section.id}</span>
                      <h3 className="font-sans font-bold text-xs uppercase tracking-wider">{section.topic}</h3>
                    </div>
                    <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed">
                      {section.details}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Audit Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-20 pt-12 border-t border-primary-gold/10 flex flex-col md:flex-row justify-between items-start gap-8"
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
              "Anonymization is a dynamic process. Our system adopts a risk-based approach to ensure that the likelihood of re-identification is kept below acceptable clinical thresholds, meeting both international HIPAA and domestic DPDP guidelines."
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}


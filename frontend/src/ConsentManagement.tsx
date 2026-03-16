import { motion } from 'motion/react';
import { UserCheck, ToggleRight, FileText, Shield, Clock, AlertTriangle } from 'lucide-react';
import Header from './Header';
import { useState } from 'react';

interface ConsentRecord {
  purpose: string;
  granted: boolean;
  timestamp: string;
  legalBasis: string;
}

const initialConsents: ConsentRecord[] = [
  { purpose: 'Clinical Lab Processing', granted: true, timestamp: '2026-03-14 09:15:22 IST', legalBasis: 'DPDP §4(1) — Consent for specified purpose' },
  { purpose: 'HL7 Message Generation', granted: true, timestamp: '2026-03-14 09:15:22 IST', legalBasis: 'DPDP §8(1) — Legitimate processing' },
  { purpose: 'Anonymisation of PII', granted: true, timestamp: '2026-03-14 09:15:22 IST', legalBasis: 'DPDP §8(7) — De-identification required by law' },
  { purpose: 'SHA-256 Integrity Sealing', granted: true, timestamp: '2026-03-14 09:15:22 IST', legalBasis: 'IT Act §14 — Secure Electronic Record' },
  { purpose: 'Clinical Research (Secondary Use)', granted: false, timestamp: '—', legalBasis: 'DPDP §8(3) — Requires separate consent' },
  { purpose: 'Cross-Border Data Transfer', granted: false, timestamp: '—', legalBasis: 'DPDP §16 — Government whitelist required' },
  { purpose: 'Marketing & Commercial Use', granted: false, timestamp: '—', legalBasis: 'DPDP §5 — Not a legitimate purpose' },
  { purpose: 'Behavioural Profiling', granted: false, timestamp: '—', legalBasis: 'DPDP §9(3) — Prohibited for health data' },
];

const consentRequirements = [
  { requirement: 'Free', description: 'Consent must not be coerced, bundled, or contingent on a service. The data principal must have a genuine choice.', section: 'DPDP §6(1)', example: 'Patient cannot be denied treatment for refusing marketing consent.' },
  { requirement: 'Specific', description: 'Consent must be given for each distinct purpose. Blanket consent for all purposes is invalid.', section: 'DPDP §6(2)', example: 'Separate toggles for "Lab Processing" vs "Research Use" vs "Commercial Use."' },
  { requirement: 'Informed', description: 'The data principal must be provided with clear, plain-language information about what data is collected, why, and how.', section: 'DPDP §5(1)', example: 'Privacy notice explaining: "We will anonymise your name and generate HL7 messages."' },
  { requirement: 'Unambiguous', description: 'Consent must be a clear affirmative act. Pre-ticked checkboxes and silence do not constitute valid consent.', section: 'DPDP §6(3)', example: 'Active click on "I Consent" button — not a pre-filled form.' },
  { requirement: 'Withdrawable', description: 'The data principal has the right to withdraw consent at any time with the same ease with which it was given.', section: 'DPDP §6(4)', example: 'A "Revoke Consent" button as easy to access as the original "I Consent" button.' },
];

const dataPrincipalRights = [
  { right: 'Right to Information', section: 'DPDP §11(1)', description: 'The data principal has the right to obtain a summary of their personal data being processed, the processing activities performed, and the identities of data fiduciaries.', status: 'Supported' },
  { right: 'Right to Correction', section: 'DPDP §12(1)', description: 'The data principal has the right to correct inaccurate or misleading personal data, complete incomplete data, and update data that is no longer current.', status: 'Supported' },
  { right: 'Right to Erasure', section: 'DPDP §12(3)', description: 'The data principal has the right to have their personal data erased when consent is withdrawn or when the purpose for processing has been fulfilled.', status: 'Supported' },
  { right: 'Right to Grievance Redressal', section: 'DPDP §13', description: 'The data principal has the right to access an effective grievance redressal mechanism provided by the data fiduciary.', status: 'Planned' },
  { right: 'Right to Nominate', section: 'DPDP §14', description: 'The data principal has the right to nominate another person to exercise their rights in case of death or incapacity.', status: 'Planned' },
];

export default function ConsentManagement() {
  const [consents, setConsents] = useState(initialConsents);

  const toggleConsent = (idx: number) => {
    setConsents(prev => prev.map((c, i) => {
      if (i !== idx) return c;
      // Don't allow toggling mandatory consents (first 4)
      if (i < 4) return c;
      return {
        ...c,
        granted: !c.granted,
        timestamp: !c.granted ? new Date().toISOString().replace('T', ' ').slice(0, 19) + ' IST' : '—'
      };
    }));
  };

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="consent" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Hero */}
        <div className="flex flex-col mb-20 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-3xl"
          >
            Consent <span className="italic font-title text-primary-gold">Management</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            A simulated patient consent portal demonstrating how data processing purposes must be individually consented to under the DPDP Act 2023.
          </motion.p>
        </div>

        {/* Consent Dashboard (Simulated) */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <ToggleRight className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Patient Consent Dashboard</h2>
            <span className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 ml-4">Simulated</span>
          </div>

          <div className="bg-white border border-primary-gold/10 overflow-hidden">
            <div className="p-6 bg-primary-gold/5 border-b border-primary-gold/10">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono text-[10px] text-primary-gold uppercase tracking-widest block mb-1">Data Principal</span>
                  <span className="font-title text-xl">Patient ID: MIMIC-10006</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[10px] text-neutral-dark/40 block">Consents: {consents.filter(c => c.granted).length}/{consents.length}</span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-primary-gold/5">
              {consents.map((consent, idx) => (
                <div key={consent.purpose} className={`p-6 flex items-center gap-6 ${consent.granted ? '' : 'bg-red-50/30'}`}>
                  {/* Toggle */}
                  <button
                    onClick={() => toggleConsent(idx)}
                    className={`shrink-0 w-12 h-6 rounded-full transition-all relative ${
                      consent.granted ? 'bg-green-500' : 'bg-neutral-dark/20'
                    } ${idx < 4 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:shadow-md'}`}
                    disabled={idx < 4}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${consent.granted ? 'left-6' : 'left-0.5'}`} />
                  </button>

                  {/* Purpose */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-sans font-bold text-sm">{consent.purpose}</h3>
                      {idx < 4 && (
                        <span className="font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 bg-primary-gold/10 text-primary-gold border border-primary-gold/20">Mandatory</span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-neutral-dark/40">{consent.legalBasis}</p>
                  </div>

                  {/* Status */}
                  <div className="shrink-0 text-right">
                    <span className={`font-mono text-[10px] uppercase tracking-widest ${consent.granted ? 'text-green-600' : 'text-red-500'}`}>
                      {consent.granted ? 'Granted' : 'Denied'}
                    </span>
                    <div className="font-mono text-[9px] text-neutral-dark/30 mt-0.5">{consent.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2">
            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="font-sans text-[11px] text-neutral-dark/40 leading-relaxed">
              First 4 consents are mandatory for pipeline operation and cannot be disabled. Optional consents (Research, Transfer, Marketing, Profiling) can be toggled by the data principal.
            </p>
          </div>
        </motion.section>

        {/* Consent Requirements */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <FileText className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Valid Consent — Five Requirements</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {consentRequirements.map((req, idx) => (
              <motion.div
                key={req.requirement}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="bg-white border border-primary-gold/10 p-8 flex items-start gap-8 hover:border-primary-gold/30 transition-all"
              >
                <div className="shrink-0 w-28">
                  <span className="font-title text-3xl text-primary-gold">{req.requirement}</span>
                  <span className="font-mono text-[10px] text-primary-gold/50 block mt-1">{req.section}</span>
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed mb-3">{req.description}</p>
                  <div className="bg-primary-gold/5 border-l-2 border-primary-gold px-4 py-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-primary-gold/60 block mb-1">Example</span>
                    <p className="font-sans text-[12px] text-neutral-dark/50 italic">{req.example}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Data Principal Rights */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <UserCheck className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Rights of the Data Principal</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="col-span-3 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Right</div>
              <div className="col-span-1 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Section</div>
              <div className="col-span-6 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Description</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Status</div>
            </div>
            {dataPrincipalRights.map((r, idx) => (
              <div key={r.right} className={`grid grid-cols-12 gap-0 px-6 py-5 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-primary-gold/[0.01]'}`}>
                <div className="col-span-3 font-sans font-bold text-[13px]">{r.right}</div>
                <div className="col-span-1 font-mono text-[11px] text-primary-gold">{r.section}</div>
                <div className="col-span-6 font-sans text-[12px] text-neutral-dark/60 leading-relaxed">{r.description}</div>
                <div className="col-span-2">
                  <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 border rounded-sm ${
                    r.status === 'Supported' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                  }`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}

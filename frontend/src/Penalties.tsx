import { motion } from 'motion/react';
import { AlertTriangle, Scale, ShieldAlert, Gavel } from 'lucide-react';
import Header from './Header';

const itActOffences = [
  { section: '§43', offence: 'Damage to Computer System', penalty: 'Compensation up to ₹1 Crore', type: 'Civil', severity: 60, details: 'Unauthorised access, download, virus introduction, damage, disruption, denial of access, manipulation, theft of computer source code.' },
  { section: '§43A', offence: 'Failure to Protect Data', penalty: 'Compensation (no limit specified)', type: 'Civil', severity: 50, details: 'Failure to implement and maintain reasonable security practices while handling SPDI, causing wrongful loss to any person.' },
  { section: '§65', offence: 'Tampering with Source Code', penalty: '3 years imprisonment + ₹2 Lakh fine', type: 'Criminal', severity: 65, details: 'Intentionally concealing, destroying, or altering source code required to be maintained by law.' },
  { section: '§66', offence: 'Computer-Related Offences', penalty: '3 years imprisonment + ₹5 Lakh fine', type: 'Criminal', severity: 70, details: 'Dishonestly or fraudulently doing any act under §43. Converts civil wrong to criminal offence when done with criminal intent.' },
  { section: '§66B', offence: 'Receiving Stolen Computer/Device', penalty: '3 years imprisonment + ₹1 Lakh fine', type: 'Criminal', severity: 45, details: 'Dishonestly receiving or retaining any stolen computer resource or communication device.' },
  { section: '§66C', offence: 'Identity Theft', penalty: '3 years imprisonment + ₹1 Lakh fine', type: 'Criminal', severity: 75, details: 'Fraudulent use of the electronic signature, password, or any other unique identification feature of another person.' },
  { section: '§66D', offence: 'Cheating by Personation', penalty: '3 years imprisonment + ₹1 Lakh fine', type: 'Criminal', severity: 70, details: 'Cheating by personation using computer resource or communication device.' },
  { section: '§66E', offence: 'Violation of Privacy', penalty: '3 years imprisonment + ₹2 Lakh fine', type: 'Criminal', severity: 80, details: 'Intentionally capturing, publishing, or transmitting the image of a private area of any person without consent.' },
  { section: '§66F', offence: 'Cyber Terrorism', penalty: 'Life imprisonment', type: 'Criminal', severity: 100, details: 'Denial of access, unauthorised access to restricted data, introduction of contaminant with intent to threaten the unity, integrity, security of India.' },
  { section: '§67', offence: 'Publishing Obscene Material', penalty: '1st: 3 years + ₹5 Lakh; 2nd: 5 years + ₹10 Lakh', type: 'Criminal', severity: 55, details: 'Publishing or transmitting obscene material in electronic form.' },
  { section: '§67C', offence: 'Failure to Preserve Records', penalty: '3 years imprisonment + fine', type: 'Criminal', severity: 50, details: 'Intermediary failing to preserve and retain information as prescribed by the Central Government.' },
  { section: '§69', offence: 'Failure to Assist Decryption', penalty: '7 years imprisonment + fine', type: 'Criminal', severity: 85, details: 'Failure to comply with government direction to intercept, monitor, or decrypt information. Subscriber must assist when directed.' },
  { section: '§72', offence: 'Breach of Confidentiality', penalty: '2 years imprisonment + ₹1 Lakh fine', type: 'Criminal', severity: 65, details: 'Securing access to electronic record/information in exercise of powers and disclosing it without consent.' },
  { section: '§72A', offence: 'Disclosure of Information in Breach of Contract', penalty: '3 years imprisonment + ₹5 Lakh fine', type: 'Criminal', severity: 75, details: 'Intermediary disclosing personal information while providing services under lawful contract, causing wrongful loss.' },
];

const dpdpPenalties = [
  { section: 'Schedule I, Item 1', offence: 'Non-fulfilment of obligations for children\'s data', penalty: 'Up to ₹200 Crore', severity: 85 },
  { section: 'Schedule I, Item 2', offence: 'Failure to implement security safeguards to prevent data breach', penalty: 'Up to ₹250 Crore', severity: 100 },
  { section: 'Schedule I, Item 3', offence: 'Failure to notify Data Protection Board and affected data principals of breach', penalty: 'Up to ₹200 Crore', severity: 85 },
  { section: 'Schedule I, Item 4', offence: 'Non-fulfilment of additional obligations by Significant Data Fiduciary', penalty: 'Up to ₹150 Crore', severity: 70 },
  { section: 'Schedule I, Item 5', offence: 'Non-fulfilment of duties by data principal (furnishing false info, filing frivolous complaints)', penalty: 'Up to ₹10,000', severity: 5 },
];

const gdprFines = [
  { company: 'Amazon (Luxembourg)', year: 2021, fine: '€746 Million', reason: 'Processing personal data contrary to GDPR' },
  { company: 'Meta / Instagram (Ireland)', year: 2022, fine: '€405 Million', reason: 'Children\'s privacy violations' },
  { company: 'Meta / WhatsApp (Ireland)', year: 2021, fine: '€225 Million', reason: 'Lack of transparency in processing' },
  { company: 'Google LLC (France)', year: 2022, fine: '€150 Million', reason: 'Cookie consent violations' },
  { company: 'H&M (Germany)', year: 2020, fine: '€35 Million', reason: 'Employee surveillance' },
  { company: 'British Airways (UK)', year: 2020, fine: '€22 Million', reason: 'Data breach — 400K customers affected' },
  { company: 'Marriott (UK)', year: 2020, fine: '€20 Million', reason: 'Data breach — 339M guest records' },
  { company: 'Google LLC (France)', year: 2019, fine: '€50 Million', reason: 'Lack of valid consent, transparency violations' },
];

export default function Penalties() {
  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="penalties" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Hero */}
        <div className="flex flex-col mb-20 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-3xl"
          >
            Offences & <span className="italic font-title text-primary-gold">Penalties</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            A comprehensive reference of cyber offences, data protection violations, and their consequences under the IT Act 2000, DPDP Act 2023, and GDPR.
          </motion.p>
        </div>

        {/* IT Act Offences */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Gavel className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">IT Act 2000 — Offences & Penalties</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-4 py-4">
              <div className="col-span-1 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">§</div>
              <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Offence</div>
              <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Penalty</div>
              <div className="col-span-1 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Type</div>
              <div className="col-span-2 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Severity</div>
              <div className="col-span-4 font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Details</div>
            </div>
            {itActOffences.map((o, idx) => (
              <div key={o.section} className={`grid grid-cols-12 gap-0 px-4 py-4 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-primary-gold/[0.01]'}`}>
                <div className="col-span-1 font-mono text-[11px] text-primary-gold font-bold">{o.section}</div>
                <div className="col-span-2 font-sans font-bold text-[11px]">{o.offence}</div>
                <div className="col-span-2 font-sans text-[11px] text-red-600">{o.penalty}</div>
                <div className="col-span-1">
                  <span className={`font-mono text-[8px] uppercase px-2 py-0.5 border rounded-sm ${o.type === 'Criminal' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>{o.type}</span>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <div className="flex-1 bg-primary-gold/10 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${o.severity}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${o.severity >= 80 ? 'bg-red-500' : o.severity >= 60 ? 'bg-amber-500' : 'bg-primary-gold'}`}
                    />
                  </div>
                  <span className="font-mono text-[9px] text-neutral-dark/30 w-8">{o.severity}%</span>
                </div>
                <div className="col-span-4 font-sans text-[11px] text-neutral-dark/50 leading-relaxed">{o.details}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* DPDP Penalties */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <ShieldAlert className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">DPDP Act 2023 — Penalty Schedule</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {dpdpPenalties.map((p, idx) => (
              <motion.div
                key={p.section}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white border border-primary-gold/10 p-8 flex items-center gap-8 hover:border-primary-gold/30 transition-all"
              >
                <div className="shrink-0 w-32">
                  <span className="font-mono text-[10px] text-primary-gold/60 block mb-1">{p.section}</span>
                  <span className="font-title text-2xl text-red-500">{p.penalty}</span>
                </div>
                <div className="flex-1">
                  <p className="font-sans text-[13px] text-neutral-dark/60 leading-relaxed">{p.offence}</p>
                </div>
                <div className="shrink-0 w-32">
                  <div className="w-full bg-primary-gold/10 h-3 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${p.severity}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${p.severity >= 80 ? 'bg-red-500' : p.severity >= 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Top GDPR Fines */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Scale className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Largest GDPR Fines to Date</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="col-span-3 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Company</div>
              <div className="col-span-1 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Year</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Fine</div>
              <div className="col-span-6 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Reason</div>
            </div>
            {gdprFines.map((f, idx) => (
              <div key={`${f.company}-${f.year}`} className={`grid grid-cols-12 gap-0 px-6 py-4 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors ${idx % 2 === 0 ? '' : 'bg-primary-gold/[0.01]'}`}>
                <div className="col-span-3 font-sans font-bold text-[13px]">{f.company}</div>
                <div className="col-span-1 font-mono text-[12px] text-neutral-dark/40">{f.year}</div>
                <div className="col-span-2 font-title text-lg text-red-500">{f.fine}</div>
                <div className="col-span-6 font-sans text-[12px] text-neutral-dark/50 leading-relaxed">{f.reason}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 font-mono text-[10px] text-neutral-dark/30 text-right">
            Total fines listed: €1.653 Billion
          </div>
        </motion.section>
      </main>
    </div>
  );
}

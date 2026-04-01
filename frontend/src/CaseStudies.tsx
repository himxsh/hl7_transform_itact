import { motion } from 'motion/react';
import { Gavel, Scale, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { useState } from 'react';

type CaseCategory = 'all' | 'it-act' | 'dpdp' | 'gdpr';

const cases = [
  {
    id: 1,
    category: 'it-act',
    badge: 'IT Act',
    title: 'Shreya Singhal v. Union of India (2015)',
    court: 'Supreme Court of India',
    verdict: 'Struck Down',
    verdictColor: 'text-red-500 bg-red-50 border-red-200',
    facts: 'A woman was arrested in Mumbai under IT Act §66A for posting a comment on Facebook criticising a city-wide shutdown. The section criminalised sending "offensive" messages through electronic communication.',
    issue: 'Whether §66A of the IT Act was unconstitutional for violating the fundamental right to freedom of speech and expression under Article 19(1)(a).',
    outcome: 'The Supreme Court struck down §66A in its entirety, holding it unconstitutionally vague and overbroad. The court noted that terms like "grossly offensive" and "menacing" were too subjective to form the basis of criminal liability.',
    relevance: 'Established that data protection laws must be precise — vague provisions can be struck down. Our pipeline uses specific, well-defined anonymisation rules (regex patterns for Aadhaar, PAN, etc.) rather than vague "protection" measures.'
  },
  {
    id: 2,
    category: 'it-act',
    badge: 'IT Act',
    title: 'Avnish Bajaj v. State (Bazee.com Case, 2005)',
    court: 'Delhi High Court',
    verdict: 'Acquitted',
    verdictColor: 'text-green-500 bg-green-50 border-green-200',
    facts: 'Avnish Bajaj, CEO of Bazee.com (now eBay India), was arrested when a user uploaded objectionable content on the platform. Bajaj was charged under IT Act §67 (publishing obscene material electronically).',
    issue: 'Whether an intermediary (platform) is liable for content uploaded by its users under the IT Act.',
    outcome: 'The court acquitted Bajaj, noting he had no knowledge of the specific content and was acting as an intermediary. This case led to the strengthening of §79 (Safe Harbour for intermediaries) in the 2008 Amendment.',
    relevance: 'Clarified intermediary liability — our pipeline processes data on behalf of hospitals (data fiduciaries). As a data processor, our liability is limited if we follow "reasonable security practices" per §43A.'
  },
  {
    id: 3,
    category: 'it-act',
    badge: 'IT Act',
    title: 'Pune Citibank Phishing Case (2005)',
    court: 'Pune Police Cyber Cell',
    verdict: 'Convicted',
    verdictColor: 'text-amber-600 bg-amber-50 border-amber-200',
    facts: 'Employees at a BPO centre in Pune illegally accessed Citibank customer accounts using stolen PINs and passwords. They transferred funds worth ₹1.5 crore to fraudulent accounts.',
    issue: 'Application of IT Act §66C (Identity Theft) and §66D (Cheating by Personation using Computer Resources) in a corporate data theft scenario.',
    outcome: 'Multiple employees were arrested and convicted under §66C and §66D. The case highlighted the vulnerability of financial data in outsourced operations.',
    relevance: 'Directly validates our identity protection layer. §66C (identity theft) is exactly what our Anonymiser prevents — if patient IDs are stolen from HL7 messages, the pseudonymised data is useless to attackers.'
  },
  {
    id: 4,
    category: 'dpdp',
    badge: 'DPDP / Privacy',
    title: 'K.S. Puttaswamy v. Union of India (2017)',
    court: 'Supreme Court of India (9-Judge Bench)',
    verdict: 'Landmark — Privacy is a Fundamental Right',
    verdictColor: 'text-primary-gold bg-primary-gold/10 border-primary-gold/30',
    facts: 'Justice K.S. Puttaswamy challenged the Aadhaar scheme, arguing that mandatory biometric collection violated the right to privacy. The government contended that the Constitution does not explicitly guarantee a right to privacy.',
    issue: 'Whether the Right to Privacy is a fundamental right under the Indian Constitution.',
    outcome: 'A unanimous 9-judge bench declared that the Right to Privacy is a fundamental right under Article 21 (Right to Life and Personal Liberty). The court held that privacy includes informational privacy — the right to control dissemination of personal information.',
    relevance: 'This is the single most important judgment for our project. It legally mandates that clinical data processing MUST protect patient privacy. Our entire anonymisation layer exists to satisfy this constitutional requirement.'
  },
  {
    id: 5,
    category: 'dpdp',
    badge: 'DPDP / Privacy',
    title: 'Aadhaar Judgment — Puttaswamy II (2018)',
    court: 'Supreme Court of India (5-Judge Bench)',
    verdict: 'Partially Upheld',
    verdictColor: 'text-blue-500 bg-blue-50 border-blue-200',
    facts: 'Following Puttaswamy I, the validity of the Aadhaar Act itself was challenged. The question was whether mandatory Aadhaar linkage with bank accounts, mobile numbers, and government services was proportionate.',
    issue: 'Whether the Aadhaar Act passed the proportionality test established in Puttaswamy I.',
    outcome: 'The court upheld Aadhaar for government subsidies but struck down §57 (allowing private entities to use Aadhaar). Made it voluntary for banks and telecom. Imposed data minimisation requirements.',
    relevance: 'Established the proportionality test for data collection: (1) legitimate aim, (2) rational connection, (3) necessity, (4) balancing. Our pipeline collects only clinical lab data (minimal) for HL7 transformation (legitimate aim).'
  },
  {
    id: 6,
    category: 'dpdp',
    badge: 'DPDP / Privacy',
    title: 'WhatsApp Privacy Policy Controversy (2021)',
    court: 'Delhi High Court / CCI',
    verdict: 'Under Investigation',
    verdictColor: 'text-amber-600 bg-amber-50 border-amber-200',
    facts: 'WhatsApp updated its privacy policy to share user metadata with parent company Meta (Facebook). Users were given a "take-it-or-leave-it" ultimatum. The CCI initiated an investigation, and the Delhi HC heard multiple petitions.',
    issue: 'Whether a dominant platform can force consent for data sharing, and whether such consent is truly "free" and "informed" as required by data protection principles.',
    outcome: 'CCI found prima facie abuse of dominant position. The case highlighted the need for strong data protection legislation — which resulted in the DPDP Act 2023 requiring consent to be "free, specific, informed, and unambiguous."',
    relevance: 'Demonstrates why consent must be meaningful. In healthcare, patient consent for data processing cannot be coerced. Our pipeline processes data under legitimate clinical use — not commercial exploitation.'
  },
  {
    id: 7,
    category: 'gdpr',
    badge: 'GDPR',
    title: 'Google LLC v. CNIL (France, 2019)',
    court: 'CNIL (French Data Protection Authority)',
    verdict: '€50 Million Fine',
    verdictColor: 'text-red-500 bg-red-50 border-red-200',
    facts: 'Google was found to have violated GDPR by not providing transparent information about data processing in its Android setup process. Users had to navigate through 5-6 screens to find privacy settings, and consent was "bundled."',
    issue: 'Whether Google met the GDPR requirements for valid consent (Art. 4(11)) and transparency (Art. 12).',
    outcome: 'CNIL fined Google €50 million — the first major GDPR fine. Found that consent was neither "specific" nor "unambiguous" because it was bundled with other terms.',
    relevance: 'Validates the need for clear, unbundled consent. In our pipeline context, if deployed commercially, each data processing purpose would need separate, clear consent — not a single "I agree" checkbox.'
  },
  {
    id: 8,
    category: 'gdpr',
    badge: 'GDPR',
    title: 'British Airways Data Breach (2020)',
    court: 'ICO (UK Information Commissioner)',
    verdict: '£20 Million Fine',
    verdictColor: 'text-red-500 bg-red-50 border-red-200',
    facts: 'British Airways suffered a data breach where attackers modified the baggage claim page to skim credit card details. Over 400,000 customers were affected. The breach went undetected for two months.',
    issue: 'Whether BA had implemented adequate security measures under GDPR Art. 5(1)(f) (integrity and confidentiality) and Art. 32 (security of processing).',
    outcome: 'ICO fined BA £20 million (reduced from initial £183 million due to COVID). Found BA failed to implement adequate security measures that were available at the time.',
    relevance: 'Directly justifies our SHA-256 integrity sealing. If a clinical HL7 message is tampered with (like BA\'s page was modified), our ZSH segment would immediately detect it — preventing the kind of silent breach that BA suffered.'
  },
  {
    id: 9,
    category: 'gdpr',
    badge: 'GDPR',
    title: 'Google Spain v. AEPD — "Right to be Forgotten" (2014)',
    court: 'Court of Justice of the EU (CJEU)',
    verdict: 'Right Established',
    verdictColor: 'text-primary-gold bg-primary-gold/10 border-primary-gold/30',
    facts: 'A Spanish citizen, Mario Costeja González, requested that Google remove links to a 1998 newspaper article about his property being auctioned for social security debts. The debts had been fully resolved.',
    issue: 'Whether search engines must remove links to lawful but outdated personal information upon request — the "Right to be Forgotten."',
    outcome: 'The CJEU ruled that individuals have the right to request removal of search results containing personal data that is "inadequate, irrelevant, or no longer relevant." This became Art. 17 of the GDPR.',
    relevance: 'Relevant to our pipeline because patient clinical data, once used for research, should be erasable. Our pipeline does not persist data unnecessarily — output files can be deleted to comply with erasure requests.'
  },
];

export default function CaseStudies() {
  const [filter, setFilter] = useState<CaseCategory>('all');

  const filtered = filter === 'all' ? cases : cases.filter(c => c.category === filter);

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="case-studies" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Hero */}
        <div className="flex flex-col mb-16 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-3xl"
          >
            Case <span className="italic font-title text-primary-gold">Studies</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            Landmark judgments and enforcement actions that shaped India's cyber law and global data protection. Each case is mapped to our pipeline's relevance.
          </motion.p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-12 justify-center">
          {[
            { id: 'all', label: 'All Cases' },
            { id: 'it-act', label: 'IT Act' },
            { id: 'dpdp', label: 'DPDP / Privacy' },
            { id: 'gdpr', label: 'GDPR' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as CaseCategory)}
              className={`font-mono text-[10px] uppercase tracking-widest px-5 py-2.5 border transition-all ${
                filter === f.id
                  ? 'bg-primary-gold text-[#1c1a16] border-primary-gold'
                  : 'border-primary-gold/20 text-neutral-dark/50 hover:border-primary-gold/50 hover:text-neutral-dark'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Case Cards */}
        <div className="space-y-8">
          {filtered.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white border border-primary-gold/10 p-10 hover:border-primary-gold/30 transition-all group"
            >
              {/* Header Row */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-mono text-[9px] uppercase tracking-widest px-3 py-1 bg-primary-gold/10 text-primary-gold border border-primary-gold/20">{c.badge}</span>
                    <span className="font-mono text-[9px] text-neutral-dark/30">{c.court}</span>
                  </div>
                  <h3 className="font-title text-2xl leading-tight">{c.title}</h3>
                </div>
                <span className={`font-mono text-[10px] px-4 py-2 border rounded-sm shrink-0 ml-6 ${c.verdictColor}`}>
                  {c.verdict}
                </span>
              </div>

              {/* Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-primary-gold/60" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Facts</span>
                  </div>
                  <p className="font-sans text-[12px] text-neutral-dark/60 leading-relaxed">{c.facts}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Scale size={14} className="text-primary-gold/60" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Legal Issue</span>
                  </div>
                  <p className="font-sans text-[12px] text-neutral-dark/60 leading-relaxed">{c.issue}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Gavel size={14} className="text-primary-gold/60" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Outcome</span>
                  </div>
                  <p className="font-sans text-[12px] text-neutral-dark/60 leading-relaxed">{c.outcome}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={14} className="text-primary-gold/60" />
                    <span className="font-mono text-[9px] uppercase tracking-widest text-primary-gold font-bold">Pipeline Relevance</span>
                  </div>
                  <p className="font-sans text-[12px] text-neutral-dark/40 leading-relaxed italic">{c.relevance}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 font-mono text-[10px] text-neutral-dark/30 text-center">{filtered.length} case{filtered.length !== 1 ? 's' : ''} displayed</div>
      </main>
      <Footer />
    </div>
  );
}

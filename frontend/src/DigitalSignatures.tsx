import { motion } from 'motion/react';
import { KeyRound, ShieldCheck, Landmark, FileKey, UserCheck, ArrowRight } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const itActSections = [
  { id: '§2(1)(p)', title: 'Digital Signature', description: 'Authentication of an electronic record by a subscriber by means of an electronic method in accordance with the provisions of §3.' },
  { id: '§3', title: 'Authentication of Electronic Records', description: 'An electronic record shall be authenticated by affixing a digital signature using an asymmetric crypto system and a hash function.' },
  { id: '§3A', title: 'Electronic Signature', description: '(Added 2008 Amendment) Any electronic technique for authentication, as specified in the Second Schedule. Broader than digital signatures.' },
  { id: '§4', title: 'Legal Recognition of Electronic Records', description: 'Where any law requires information to be in writing/typewritten/printed — that requirement is satisfied if information is in an electronic form accessible for subsequent reference.' },
  { id: '§5', title: 'Legal Recognition of Electronic Signatures', description: 'Where any law requires a document to be authenticated by a signature — that requirement is satisfied if authenticated by means of an electronic signature.' },
  { id: '§14', title: 'Secure Electronic Record', description: 'An electronic record is deemed "secure" if a specific security procedure has been applied at a specific point of time. Our SHA-256 ZSH segment makes HL7 output a "secure electronic record."' },
  { id: '§15', title: 'Secure Electronic Signature', description: 'A signature applied using a secure procedure, with the private key being under the sole control of the signer at the time of signing.' },
  { id: '§35', title: 'Certifying Authority to Issue Licence', description: 'The Controller of Certifying Authorities (CCA) can grant licences to Certifying Authorities (CAs) for issuing Digital Signature Certificates.' },
];

const eGovernanceSections = [
  { id: '§6', title: 'Use of Electronic Records in Government', description: 'Any government department may accept filing, creation or retention of documents in electronic form. Enables paperless governance.' },
  { id: '§6A', title: 'Delivery of Services by Service Provider', description: 'The Central/State Government may authorise any service provider to deliver e-governance services through electronic means.' },
  { id: '§7', title: 'Retention of Electronic Records', description: 'Where any law requires retention of documents — that requirement is met if the information is accessible in electronic form, remains unaltered, and the origin/destination/date is identifiable.' },
  { id: '§7A', title: 'Audit of Documents in Electronic Form', description: 'Where any law provides for audit — that audit can be conducted with respective electronic form of documents.' },
  { id: '§8', title: 'Publication of Rules in Electronic Gazette', description: 'Where any law requires publication of rules in the Official Gazette — that requirement is met if published in the Electronic Gazette.' },
  { id: '§9', title: 'Sections 6, 7, 8 Not to Confer Right', description: 'Nothing in these sections confers a right upon any person to insist that any government ministry accept electronic records. Adoption is at discretion.' },
  { id: '§10', title: 'Power to Make Rules by Central Government', description: 'The Central Government may prescribe the type of digital signature, manner and format of electronic signature, security procedures, etc.' },
];

const subscriberDuties = [
  { id: '§40', title: 'Generating Key Pair', description: 'The subscriber shall generate key pair using a secure system, and exercise reasonable care to retain control of the private key.' },
  { id: '§40A', title: 'Duties of Subscriber of Electronic Signature Certificate', description: 'Ensure control over authentication data relating to the electronic signature certificate at all times.' },
  { id: '§41', title: 'Acceptance of Digital Signature Certificate', description: 'A subscriber shall be deemed to have accepted a DSC if they publish or authorise its publication, or fail to object within the prescribed period.' },
  { id: '§42', title: 'Control of Private Key', description: 'Every subscriber shall exercise reasonable care to retain control of the private key and prevent its disclosure. Failure attracts liability for all verified communications.' },
];

export default function DigitalSignatures() {
  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <Header activeTab="digital-signatures" />

      <main className="max-w-[1200px] mx-auto px-6 py-24">
        {/* Hero */}
        <div className="flex flex-col mb-20 text-center items-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-title text-5xl lg:text-7xl leading-[0.9] tracking-tighter mb-8 max-w-3xl"
          >
            Digital Signatures & <br />
            <span className="italic font-title text-primary-gold">E-Governance</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-sans text-neutral-dark/60 max-w-xl leading-relaxed"
          >
            IT Act 2000 §§2–15 establish the legal framework for digital signatures, electronic records, and secure e-governance — 
            directly relevant to our SHA-256 cryptographic sealing mechanism.
          </motion.p>
        </div>

        {/* How Digital Signatures Work — Visual */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <KeyRound className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">How Digital Signatures Work</h2>
          </div>

          <div className="bg-white border border-primary-gold/10 p-10">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
              {[
                { step: '01', title: 'Original Message', desc: 'The sender creates an electronic record (e.g., an HL7 message).', color: 'bg-blue-50 border-blue-200' },
                { step: '02', title: 'Hash Function', desc: 'A hash algorithm (SHA-256) computes a fixed-size digest of the message.', color: 'bg-amber-50 border-amber-200' },
                { step: '03', title: 'Private Key Sign', desc: 'The hash is encrypted with the sender\'s private key, creating the digital signature.', color: 'bg-red-50 border-red-200' },
                { step: '04', title: 'Transmission', desc: 'The original message + digital signature are sent together to the receiver.', color: 'bg-purple-50 border-purple-200' },
                { step: '05', title: 'Verification', desc: 'Receiver decrypts the signature using sender\'s public key and compares hashes.', color: 'bg-green-50 border-green-200' },
              ].map((item, idx) => (
                <div key={item.step} className="flex flex-col items-center text-center relative">
                  <div className={`w-full border ${item.color} p-6 rounded-sm`}>
                    <div className="font-mono text-[10px] text-primary-gold font-bold mb-2">STEP {item.step}</div>
                    <h4 className="font-title text-lg mb-2">{item.title}</h4>
                    <p className="font-sans text-[11px] text-neutral-dark/50 leading-relaxed">{item.desc}</p>
                  </div>
                  {idx < 4 && (
                    <ArrowRight size={16} className="text-primary-gold/40 absolute -right-3 top-1/2 -translate-y-1/2 hidden md:block" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-10 bg-primary-gold/5 border border-primary-gold/10 p-6">
              <p className="font-sans text-[12px] text-neutral-dark/50 leading-relaxed">
                <strong className="text-primary-gold">Our Implementation:</strong> Our ZSH segment follows Steps 1–3 using SHA-256.
                The full HL7 message body is hashed, and the digest is appended as a custom Z-segment: <code className="font-mono text-[10px] bg-primary-gold/10 px-1.5 py-0.5">ZSH|1|SHA256|&lt;hex_digest&gt;|SIGNED|&lt;timestamp&gt;</code>.
                While we use hash-based integrity (not asymmetric PKI), the principle under IT Act §14 ("Secure Electronic Record") still applies.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Certifying Authority Chain */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <ShieldCheck className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Certificate Authority Chain</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {[
              { level: 'Root', title: 'Controller of CAs (CCA)', desc: 'The apex body under IT Act §17. Supervises all Certifying Authorities in India. Maintains the Root Certificate.', section: '§17–§34' },
              { level: 'Tier 1', title: 'Licensed CAs', desc: 'Certifying Authorities licensed under §24. Examples: NIC-CA, IDRBT-CA, (n)Code Solutions. Issue Digital Signature Certificates.', section: '§35–§36' },
              { level: 'Tier 2', title: 'Registration Authorities', desc: 'Verify identity of applicants on behalf of Licensed CAs. Collect biometrics, verify documents before DSC issuance.', section: '§35(4)' },
              { level: 'End User', title: 'Subscribers', desc: 'Individuals/organisations who hold a Digital Signature Certificate. Must protect their private keys per §42.', section: '§40–§42' },
            ].map((tier, idx) => (
              <motion.div
                key={tier.level}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex-1 bg-white border border-primary-gold/10 p-8 relative hover:border-primary-gold/30 transition-all group"
              >
                <div className="font-mono text-[10px] text-primary-gold uppercase tracking-widest mb-4">{tier.level}</div>
                <h3 className="font-title text-xl mb-3">{tier.title}</h3>
                <p className="font-sans text-[12px] text-neutral-dark/50 leading-relaxed mb-4">{tier.desc}</p>
                <span className="font-mono text-[10px] text-primary-gold/50">{tier.section}</span>
                {idx < 3 && (
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-primary-gold/30 hidden md:block z-10">
                    <ArrowRight size={16} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* IT Act Sections Table */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <FileKey className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">IT Act — Digital Signature Provisions</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Section</div>
              <div className="col-span-3 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Title</div>
              <div className="col-span-7 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Description</div>
            </div>
            {itActSections.map((s) => (
              <div key={s.id} className="grid grid-cols-12 gap-0 px-6 py-5 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors">
                <div className="col-span-2 font-mono text-[12px] text-primary-gold font-bold">{s.id}</div>
                <div className="col-span-3 font-sans font-bold text-sm">{s.title}</div>
                <div className="col-span-7 font-sans text-[13px] text-neutral-dark/60 leading-relaxed">{s.description}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* E-Governance Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <Landmark className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">E-Governance Provisions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {eGovernanceSections.map((s, idx) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white border border-primary-gold/10 p-8 hover:border-primary-gold/30 transition-all group"
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-[11px] text-primary-gold font-bold shrink-0 bg-primary-gold/10 px-3 py-1 rounded-sm">{s.id}</span>
                  <div>
                    <h3 className="font-title text-lg mb-2">{s.title}</h3>
                    <p className="font-sans text-[12px] text-neutral-dark/50 leading-relaxed">{s.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Duties of Subscribers */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-primary-gold/10 rounded-sm flex items-center justify-center border border-primary-gold/20">
              <UserCheck className="text-primary-gold" size={20} />
            </div>
            <h2 className="font-title text-3xl">Controller & Duties of Subscribers</h2>
          </div>

          <div className="border border-primary-gold/10 bg-white overflow-hidden">
            <div className="grid grid-cols-12 gap-0 bg-primary-gold/5 border-b border-primary-gold/10 px-6 py-4">
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Section</div>
              <div className="col-span-3 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Title</div>
              <div className="col-span-7 font-mono text-[10px] uppercase tracking-widest text-primary-gold font-bold">Obligation</div>
            </div>
            {subscriberDuties.map((s) => (
              <div key={s.id} className="grid grid-cols-12 gap-0 px-6 py-5 border-b border-primary-gold/5 hover:bg-primary-gold/[0.02] transition-colors">
                <div className="col-span-2 font-mono text-[12px] text-primary-gold font-bold">{s.id}</div>
                <div className="col-span-3 font-sans font-bold text-sm">{s.title}</div>
                <div className="col-span-7 font-sans text-[13px] text-neutral-dark/60 leading-relaxed">{s.description}</div>
              </div>
            ))}
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}

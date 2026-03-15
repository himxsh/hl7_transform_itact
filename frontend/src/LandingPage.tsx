import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShieldCheck } from 'lucide-react';
import Header from './Header';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="bg-[#f7f7f6] text-[#1c1a16] font-sans selection:bg-gold/30">
      <Header />

      <main className="pt-24">
        {/* Hero Section */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-12 py-20 lg:py-32 grid lg:grid-cols-12 gap-12 border-b border-gold/10">
          <div className="lg:col-span-8 flex flex-col justify-center">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-mono text-[12px] uppercase tracking-[0.3em] text-gold mb-6 block"
            >
              IT Act & Data Protection
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-title text-6xl lg:text-8xl font-light leading-[0.9] tracking-tighter mb-8"
            >
              Clinical Data, <br />
              <span className="italic font-title">Orchestrated</span> with Precision
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="font-sans text-lg lg:text-xl max-w-xl text-slate-600 mb-10 leading-relaxed"
            >
              Enterprise-grade HL7 processing with DPDP compliance. Designed for clinical research, built for the highest security standards.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <button
                onClick={() => navigate('/selection')}
                className="bg-gold text-charcoal px-10 py-4 font-mono text-xs uppercase tracking-widest hover:bg-gold/90 transition-all border border-gold"
              >
                EXPLORE PIPELINE
              </button>
              <button className="bg-transparent border border-gold/20 px-10 py-4 font-mono text-xs uppercase tracking-widest hover:bg-gold/5 transition-all">
                View Compliance
              </button>
            </motion.div>
          </div>
          <div className="lg:col-span-4 flex items-center justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative w-full aspect-[3/4] overflow-hidden grayscale contrast-125 border border-gold/10"
            >
              <img
                alt="Abstract medical glass architecture"
                className="object-cover w-full h-full opacity-80"
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1000"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gold/10 mix-blend-multiply"></div>
            </motion.div>
          </div>
        </section>

        {/* Compliance Strip */}
        <div className="bg-gold/5 border-b border-gold/10 overflow-hidden">
          <div className="flex whitespace-nowrap py-4 animate-marquee">
            <div className="flex gap-16 items-center px-8 font-mono text-[10px] tracking-[0.4em] uppercase text-slate-500">
              <span>DPDP Act 2023</span>
              <span className="w-1 h-1 bg-gold rounded-full"></span>
              <span>IT Act 2000</span>
              <span className="w-1 h-1 bg-gold rounded-full"></span>
              <span>HIPAA Aligned</span>
              <span className="w-1 h-1 bg-gold rounded-full"></span>
              <span>DPDP Act 2023</span>
              <span className="w-1 h-1 bg-gold rounded-full"></span>
              <span>IT Act 2000</span>
              <span className="w-1 h-1 bg-gold rounded-full"></span>
              <span>GDPR Compliant</span>
            </div>
            {/* Duplicate for seamless loop */}
            <div className="flex gap-16 items-center px-8 font-mono text-[10px] tracking-[0.4em] uppercase text-slate-500">
              <span>DPDP Act 2023</span>
              <span className="w-1 h-1 bg-gold rounded-full"></span>
              <span>IT Act 2000</span>
              <span className="w-1 h-1 bg-gold rounded-full"></span>
              <span>HIPAA Aligned</span>
              <span className="w-1 h-1 bg-gold rounded-full"></span>
              <span>DPDP Act 2023</span>
              <span className="w-1 h-1 bg-gold rounded-full"></span>
              <span>IT Act 2000</span>
              <span className="w-1 h-1 bg-gold rounded-full"></span>
              <span>GDPR Compliant</span>
            </div>
          </div>
        </div>

        {/* Pipeline Grid */}
        <section id="pipeline" className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 border-b border-gold/10">
          <div className="flex flex-col mb-16">
            <h2 className="font-title text-4xl font-light mb-4">The Processing Cycle</h2>
            <div className="w-78 h-px bg-gold"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-0 border border-gold/10">
            <PipelineCard
              phase="01"
              title="Preprocessing"
              desc="Structural validation and noise reduction for raw clinical message streams."
            />
            <PipelineCard
              phase="02"
              title="Anonymizer"
              desc="Dynamic PII detection and masking aligned with international privacy mandates."
            />
            <PipelineCard
              phase="03"
              title="HL7 Engine"
              desc="Multi-version mapping and canonical transformation of medical data assets."
            />
            <PipelineCard
              phase="04"
              title="Sealing"
              desc="Cryptographic validation and immutable audit logging for full data lineage."
              isLast
            />
          </div>
        </section>

        {/* Architecture Section */}
        <section id="architecture" className="bg-charcoal text-slate-100 py-24 border-b border-white/5">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-20">
            <div className="flex flex-col justify-center">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-title text-5xl font-light mb-8 leading-tight"
              >
                Engineered for <br /><span className="italic font-title text-gold">Total Observability</span>
              </motion.h2>
              <p className="font-sans text-slate-400 mb-8 leading-relaxed">
                A modular microservices architecture designed to scale with enterprise HL7 throughput. Every transaction is tracked, hashed, and recorded with millisecond precision.
              </p>
              <ul className="font-mono text-[11px] uppercase tracking-[0.2em] space-y-4">
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-gold"></span> High availability Kafka clusters
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-gold"></span> Stateless processing nodes
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-1 h-1 bg-gold"></span> Distributed sealing protocol
                </li>
              </ul>
            </div>
            <div className="bg-black/40 border border-white/10 p-8 font-mono text-sm leading-relaxed overflow-x-auto">
              <div className="flex gap-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
              </div>
              <pre className="text-slate-300">
                <span className="text-gold">class</span> <span className="text-blue-400">HL7Orchestrator</span>:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-slate-500"># Core Processing Sequence</span><br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gold">async def</span> <span className="text-blue-400">process_stream</span>(self, message):<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;header = await self.parse_msh(message)<br />
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gold">if</span> header.compliance == <span className="text-green-400">'DPDP_2023'</span>:<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;anonymized = self.anonymizer.mask(message)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;sealed_pkg = await self.sealer.seal(anonymized)<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gold">return</span> await self.db.commit(sealed_pkg)<br />
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gold">def</span> <span className="text-blue-400">verify_integrity</span>(self, hash):<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-gold">return</span> self.ledger.validate(hash)
              </pre>
            </div>
          </div>
        </section>

        {/* Database Section */}
        <section id="database" className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24 border-b border-gold/10">
          <h2 className="font-title text-4xl font-light mb-16 text-center">Data Interoperability</h2>
          <div className="grid md:grid-cols-2 gap-px bg-gold/10 border border-gold/10">
            <div className="bg-[#f7f7f6] p-12">
              <span className="font-mono text-[10px] tracking-widest uppercase mb-4 block text-gold">Schema Type A</span>
              <h3 className="font-title text-3xl font-light mb-6">MIMIC-IV Mode</h3>
              <p className="font-sans text-slate-500 mb-8">Native integration for the Medical Information Mart for Intensive Care version IV. Specialized transformations for critical care datasets.</p>
              <div className="h-48 bg-gold/5 flex items-end p-4 border border-dashed border-gold/20">
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] uppercase text-gold/40">Data Visualization Abstract</div>
              </div>
            </div>
            <div className="bg-[#f7f7f6] p-12">
              <span className="font-mono text-[10px] tracking-widest uppercase mb-4 block text-gold">Schema Type B</span>
              <h3 className="font-title text-3xl font-light mb-6">Generic CSV Engine</h3>
              <p className="font-sans text-slate-500 mb-8">Flexible ingestion for legacy tabular systems. Auto-mapping clinical variables to standard HL7 v2 structures.</p>
              <div className="h-48 bg-gold/5 flex items-end p-4 border border-dashed border-gold/20">
                <div className="w-full h-full flex items-center justify-center font-mono text-[10px] uppercase text-gold/40">Data Visualization Abstract</div>
              </div>
            </div>
          </div>
        </section>

        {/* Compliance Detailed */}
        <section id="compliance" className="max-w-[1440px] mx-auto px-6 lg:px-12 py-24">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative">
              <div className="absolute -top-12 -left-12 font-title text-[200px] leading-none text-gold/5 select-none pointer-events-none">§</div>
              <div className="relative z-10 space-y-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h3 className="font-title text-3xl font-light mb-4 tracking-tight">DPDP Act 2023 Compliance</h3>
                  <p className="font-sans text-slate-500 leading-relaxed max-w-md">Strict adherence to Digital Personal Data Protection mandates, featuring automated 'right to erasure' and purpose limitation protocols.</p>
                  <span className="font-mono text-[10px] text-gold/60 mt-4 block">§8: DUTIES OF DATA FIDUCIARY</span>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  <h3 className="font-title text-3xl font-light mb-4 tracking-tight">IT Act 2000 Validation</h3>
                  <p className="font-sans text-slate-500 leading-relaxed max-w-md">Governance framework for electronic records and digital signatures, ensuring legal validity for processed clinical reports.</p>
                  <span className="font-mono text-[10px] text-gold/60 mt-4 block">§43: PENALTY FOR DAMAGE TO COMPUTER SYSTEM</span>
                </motion.div>
              </div>
            </div>
            <div className="bg-charcoal p-1">
              <div className="aspect-square bg-white/5 flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <img
                    alt="Cybersecurity grid"
                    className="w-full h-full object-cover grayscale"
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="relative z-10 text-center">
                  <ShieldCheck size={64} strokeWidth={1} className="text-gold mb-6 mx-auto" />
                  <div className="font-mono text-xs tracking-[0.5em] text-white">SYSTEM_STATE: SECURE</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-charcoal text-white pt-20 pb-12 border-t border-white/5">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-16 mb-20">
            <div className="lg:col-span-5">
              <span className="font-title text-3xl font-light uppercase tracking-tighter mb-6 block">
                HL7 <span className="italic lowercase font-title">Orchestrator</span>
              </span>
              <p className="font-sans text-slate-400 max-w-sm mb-10 leading-relaxed">
                A definitive platform for clinical data processing, bridging the gap between legacy medical infrastructure and modern data privacy standards.
              </p>
            </div>
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
              <FooterColumn title="Modules" items={['Pipeline', 'Anonymizer', 'Engine']} />
              <FooterColumn title="Resources" items={['API Docs', 'Architecture', 'Compliance Guide']} />
              <FooterColumn title="Legal" items={['Privacy Policy', 'Terms of Use', 'Security Audit']} />
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 font-mono text-[10px] uppercase tracking-widest text-slate-600">
            <span>© 2024 HL7 Orchestrator. All rights reserved.</span>
            <span className="mt-4 md:mt-0">Designed for Clinical Excellence</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

const PipelineCard = ({ phase, title, desc, isLast = false }: { phase: string, title: string, desc: string, isLast?: boolean }) => (
  <div className={`relative group p-10 border-neutral-border transition-colors hover:bg-gold/5 ${!isLast ? 'border-r' : ''} border-b lg:border-b-0`}>
    <div className="absolute top-0 left-0 w-full h-0 bg-gold transition-all duration-300 group-hover:h-1"></div>
    <span className="font-mono text-[10px] text-gold block mb-8">PHASE_{phase}</span>
    <h3 className="font-title text-2xl font-light mb-4 tracking-tight uppercase">{title}</h3>
    <p className="font-sans text-sm text-slate-500 leading-relaxed">{desc}</p>
  </div>
);

const FooterColumn = ({ title, items }: { title: string, items: string[] }) => (
  <div className="space-y-4">
    <span className="font-mono text-[10px] uppercase tracking-widest text-gold">{title}</span>
    <nav className="flex flex-col gap-2 font-sans text-sm text-slate-400">
      {items.map(item => (
        <a key={item} className="hover:text-white transition-colors" href="#">{item}</a>
      ))}
    </nav>
  </div>
);

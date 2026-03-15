import { useState } from 'react';
import { 
  UploadCloud, 
  Plus, 
  Minus, 
  ArrowRight,
  ShieldCheck,
  FileCode
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

export default function DatabaseSelection() {
  const navigate = useNavigate();
  const [selectedDataset, setSelectedDataset] = useState('MIMIC-IV v3.1');
  const [sampleSize, setSampleSize] = useState(50);

  const datasets = [
    {
      id: 'MIMIC-IV v3.1',
      title: 'MIMIC-IV v3.1',
      source: 'PHYSIONET',
      recommended: true,
      tags: ['DPDP', 'IT ACT'],
      description: 'De-identified electronic health records from ICU patients. The pipeline performs a multi-stage LEFT JOIN across labevents, d_labitems, and patients to produce the denormalized view required for HL7 segment generation.',
      stats: [
        { label: 'SOURCE FILES', value: 'patients.csv.gz · labevents.csv.gz · d_labitems.csv.gz' },
        { label: 'LAB EVENTS', value: '~158M rows (chunked stream)' },
        { label: 'PRIVACY MODE', value: 'birth_year derived' },
        { label: 'PSEUDONYMISER', value: 'Faker(en_IN)' },
      ]
    },
    {
      id: 'ILPD',
      title: 'Indian Liver Patient Dataset',
      source: 'UCI Machine Learning Repository',
      recommended: false,
      tags: [],
      description: 'Flat CSV of liver function test values ingested via the generic CSV mode. A declarative JSON mapping registry translates column headers into internal clinical attributes such as Bilirubin and BUN.',
      stats: [
        { label: 'FORMAT', value: 'Flat CSV' },
        { label: 'RECORDS', value: '583 Clinical Rows' },
        { label: 'MAPPED ATTRIBUTES', value: 'Bilirubin · BUN · ALT · AST · Albumin' },
        { label: 'JOIN STRATEGY', value: 'Single Table' },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center">
        <Header activeTab="database" />

        {/* Main Content */}
        <main className="w-full max-w-[860px] px-6 py-20 flex flex-col items-center">
          <span className="font-mono text-[10px] text-primary-gold/80 mb-6 uppercase tracking-[0.1em]">Step 1 of 2</span>
          <h1 className="font-title text-5xl md:text-[52px] text-neutral-dark text-center leading-tight mb-4 mt-12">Select a Data Source</h1>
          <p className="font-sans text-sm text-neutral-dark/60 text-center max-w-lg mb-8 leading-relaxed">
            The pipeline supports two clinical datasets natively, optimized for multi-modal health record synchronization and high-fidelity pseudonymization.
          </p>
          
          {/* Gold Divider */}
          <div className="w-[48px] h-[1px] bg-primary-gold mb-16"></div>

          {/* Card Stack */}
          <div className="w-full flex flex-col gap-6">
            {datasets.map((dataset) => (
              <motion.div 
                key={dataset.id}
                onClick={() => setSelectedDataset(dataset.id)}
                whileHover={{ y: -4 }}
                className={`group relative bg-white border p-8 rounded-sm transition-all cursor-pointer ${
                  selectedDataset === dataset.id 
                    ? 'border-primary-gold shadow-[0_10px_40px_-15px_rgba(193,175,134,0.2)]' 
                    : 'border-primary-gold/20 hover:shadow-[0_10px_40px_-15px_rgba(193,175,134,0.15)]'
                }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    {dataset.recommended && (
                      <span className="font-mono text-[9px] bg-primary-gold/10 text-primary-gold px-2 py-1 mb-3 inline-block tracking-[0.1em]">RECOMMENDED</span>
                    )}
                    {!dataset.recommended && (
                      <span className="font-mono text-[9px] bg-neutral-dark/5 text-neutral-dark/60 px-2 py-1 mb-3 inline-block uppercase tracking-[0.1em]">Dataset Neutral Mode</span>
                    )}
                    <h3 className={`font-title text-3xl text-neutral-dark transition-all ${selectedDataset === dataset.id ? 'italic' : 'group-hover:italic'}`}>
                      {dataset.title}
                    </h3>
                    <p className="font-sans text-[11px] uppercase tracking-widest text-neutral-dark/40 mt-1">{dataset.source}</p>
                  </div>
                  <div className="flex gap-2">
                    {dataset.tags.map(tag => (
                      <span key={tag} className="font-mono text-[9px] border border-primary-gold/20 px-2 py-1 text-neutral-dark/60 tracking-[0.1em]">{tag}</span>
                    ))}
                  </div>
                </div>
                <p className="font-sans text-sm text-neutral-dark/70 mb-8 max-w-2xl leading-relaxed">
                  {dataset.description}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-primary-gold/10 pt-6">
                  {dataset.stats.map(stat => (
                    <div key={stat.label} className="flex flex-col">
                      <span className="font-mono text-[9px] text-primary-gold/60 uppercase tracking-[0.1em]">{stat.label}</span>
                      <span className="font-sans text-[10px] mt-1 line-clamp-2">{stat.value}</span>
                    </div>
                  ))}
                </div>
                
                {/* Selection Indicator */}
                {selectedDataset === dataset.id && (
                  <div className="absolute top-4 right-4 text-primary-gold">
                    <ShieldCheck size={20} />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Card 3: Upload */}
            <motion.div 
              whileHover={{ y: -4 }}
              className="group relative bg-white border border-dashed border-primary-gold/40 p-8 rounded-sm hover:bg-primary-gold/5 transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center text-center">
                <span className="font-mono text-[9px] text-primary-gold/60 px-2 py-1 mb-4 border border-primary-gold/20 inline-block uppercase tracking-widest">Bring Your Own</span>
                <h3 className="font-title text-3xl text-neutral-dark italic mb-2">Upload a CSV</h3>
                <p className="font-sans text-[11px] uppercase tracking-widest text-neutral-dark/40 mb-6">Custom local dataset integration</p>
                <div className="w-full py-12 border border-dashed border-primary-gold/20 flex flex-col items-center justify-center bg-bg-light/50 rounded-sm">
                  <UploadCloud className="text-primary-gold mb-3 font-light" size={32} />
                  <p className="font-sans text-xs text-neutral-dark/60 uppercase tracking-widest">Drag and drop file or <span className="text-primary-gold underline cursor-pointer">browse</span></p>
                </div>
                <p className="font-sans text-[10px] text-neutral-dark/40 mt-6 max-w-sm">Supported formats: .csv files only · max 500MB.</p>
              </div>
            </motion.div>
          </div>

          {/* Controls */}
          <div className="mt-20 flex flex-col items-center gap-10 w-full">
            <div className="flex flex-col items-center gap-4">
              <span className="font-mono text-[10px] text-primary-gold/60 uppercase tracking-[0.1em]">INITIAL SAMPLE SIZE</span>
              <div className="flex items-center gap-8 border-b border-primary-gold/20 pb-2">
                <button 
                  onClick={() => setSampleSize(Math.max(1, sampleSize - 10))}
                  className="text-primary-gold hover:text-neutral-dark transition-colors"
                >
                  <Minus size={16} />
                </button>
                <input 
                  className="bg-transparent border-none text-center font-sans text-xl w-24 focus:ring-0 text-neutral-dark" 
                  type="text" 
                  value={sampleSize}
                  onChange={(e) => setSampleSize(parseInt(e.target.value) || 0)}
                />
                <button 
                  onClick={() => setSampleSize(sampleSize + 10)}
                  className="text-primary-gold hover:text-neutral-dark transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <button 
              onClick={() => navigate('/dashboard', { state: { dataset: selectedDataset, sampleSize: sampleSize } })}
              className="bg-neutral-dark text-white font-sans text-xs tracking-[0.2em] uppercase px-16 py-6 rounded-sm hover:bg-neutral-dark/90 transition-all flex items-center gap-3 group"
            >
              <span>Proceed to Dashboard</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-[860px] px-6 py-12 border-t border-primary-gold/10 flex justify-between items-center text-neutral-dark/40">
          <div className="font-mono text-[9px] uppercase tracking-[0.1em]">© 2024 HL7 Orchestrator Systems</div>
        </footer>
      </div>
    </div>
  );
}

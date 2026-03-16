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
  const [selectedDataset, setSelectedDataset] = useState('mimic');
  const [sampleSize, setSampleSize] = useState(50);

  const datasets = [
    {
      id: 'mimic',
      title: 'Mimic Mode',
      displayTitle: 'MIMIC-IV Relational',
      source: 'PHYSIONET CREDENTIALS REQUIRED',
      recommended: true,
      description: 'Specialized pipeline for complex clinical relational schemas. Performs automated relational synchronization across patients, labevents, and item dictionaries.',
      stats: [
        { label: 'SOURCE', value: 'Relational CSV.GZ' },
        { label: 'JOIN STRATEGY', value: 'Multi-file Left Join' },
        { label: 'PRIVACY', value: 'Deterministic Shift' },
        { label: 'COMPLIANCE', value: 'IT Act Secured' },
      ]
    },
    {
      id: 'generalized',
      title: 'Generalized Mode',
      displayTitle: 'CSV / Universal Ingestion',
      source: 'GENERIC DATASET SUPPORT',
      recommended: false,
      description: 'Universal pipeline for any health data (including Indian Liver Patient Dataset). Map your own headers to clinical segments using our declarative schema mapper.',
      stats: [
        { label: 'FORMAT', value: 'Flat CSV / Excel' },
        { label: 'MAPPING', value: 'Declarative JSON' },
        { label: 'SUPPORT', value: 'ILPD + Custom Files' },
        { label: 'ENGINE', value: 'Header Translation' },
      ],
      isGeneralized: true
    }
  ];

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center">
        <Header activeTab="pipeline" />

        {/* Main Content */}
        <main className="w-full max-w-[1000px] px-6 py-20 flex flex-col items-center">
          <h1 className="font-title text-5xl md:text-[52px] text-neutral-dark text-center leading-tight mb-4 mt-12">Select Processing Mode</h1>
          <p className="font-sans text-sm text-neutral-dark/60 text-center max-w-lg mb-8 leading-relaxed">
            Choose between specialized relational synchronization for MIMIC-IV or our generalized ingestion for external CSV datasets.
          </p>

          {/* Gold Divider */}
          <div className="w-[48px] h-[1px] bg-primary-gold mb-16"></div>

          {/* Card Stack - Side by Side (Lateral) */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {datasets.map((dataset) => (
              <motion.div
                key={dataset.id}
                onClick={() => setSelectedDataset(dataset.id)}
                whileHover={{ y: -4 }}
                className={`group relative bg-white border p-8 rounded-sm transition-all cursor-pointer flex flex-col ${selectedDataset === dataset.id
                  ? 'border-primary-gold shadow-[0_10px_40px_-15px_rgba(193,175,134,0.2)]'
                  : 'border-primary-gold/20 hover:shadow-[0_10px_40px_-15px_rgba(193,175,134,0.15)]'
                  }`}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1">
                    {dataset.recommended && (
                      <span className="font-mono text-[9px] bg-primary-gold/10 text-primary-gold px-2 py-1 mb-3 inline-block tracking-[0.1em]">SPECIALIZED</span>
                    )}
                    {!dataset.recommended && (
                      <span className="font-mono text-[9px] bg-neutral-dark/5 text-neutral-dark/60 px-2 py-1 mb-3 inline-block uppercase tracking-[0.1em]">Versatile Ingestion</span>
                    )}
                    <h3 className={`font-title text-3xl text-neutral-dark transition-all ${selectedDataset === dataset.id ? 'italic' : 'group-hover:italic'}`}>
                      {dataset.title}
                    </h3>
                    <p className="font-sans text-[11px] uppercase tracking-widest text-neutral-dark/40 mt-1">{dataset.displayTitle}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[120px]">
                  </div>
                </div>

                <div className="flex-grow">
                  <p className="font-sans text-sm text-neutral-dark/70 mb-8 leading-relaxed">
                    {dataset.description}
                  </p>
                </div>

                <div className="border-t border-primary-gold/10 pt-6 mt-auto">
                  {dataset.isGeneralized && selectedDataset === 'generalized' ? (
                    <div className="p-4 bg-bg-light/50 border border-dashed border-primary-gold/20 rounded-sm flex flex-col items-center justify-center text-center">
                      <UploadCloud className="text-primary-gold/60 mb-2" size={20} />
                      <p className="font-mono text-[8px] uppercase tracking-widest text-neutral-dark/40">
                        Upload Custom CSV or <br />
                        <span className="text-primary-gold underline cursor-pointer">Select ILPD Registry</span>
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      {dataset.stats.map(stat => (
                        <div key={stat.label} className="flex flex-col">
                          <span className="font-mono text-[8px] text-primary-gold/60 uppercase tracking-[0.1em] truncate">{stat.label}</span>
                          <span className="font-sans text-[10px] mt-1 line-clamp-1">{stat.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selection Indicator */}
                {selectedDataset === dataset.id && (
                  <div className="absolute top-4 right-4 text-primary-gold">
                    <ShieldCheck size={18} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Controls */}
          <div className="mt-20 flex flex-col items-center gap-10 w-full">
            <div className="flex flex-col items-center gap-4">
              <span className="font-mono text-[10px] text-primary-gold/60 uppercase tracking-[0.1em]">SAMPLE SIZE</span>
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
              onClick={() => navigate('/dashboard', { state: { dataset: selectedDataset === 'mimic' ? 'MIMIC-IV v3.2' : 'ILPD', sampleSize: sampleSize } })}
              className="bg-neutral-dark text-white font-sans text-xs tracking-[0.2em] uppercase px-16 py-6 rounded-sm hover:bg-neutral-dark/90 transition-all flex items-center gap-3 group"
            >
              <span>Proceed to Dashboard</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </main>

        {/* Footer */}

      </div>
    </div>
  );
}

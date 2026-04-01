/**
 * DatabaseSelection.tsx — Pipeline Mode Selection Gateway
 *
 * Two equal cards linking to separate pages:
 * - Batch Mode (/batch)
 * - Single Patient Mode (/single-patient)
 */

import React from 'react';
import {
  ArrowRight,
  ShieldCheck,
  User,
  FileStack,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function DatabaseSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-bg-light text-neutral-dark font-sans selection:bg-primary-gold/30">
      <div className="max-w-[1440px] mx-auto flex flex-col items-center">
        <Header activeTab="pipeline" />

        <main className="w-full max-w-[1100px] px-6 py-20 flex flex-col items-center">
          <h1 className="font-title text-5xl md:text-[52px] text-neutral-dark text-center leading-tight mb-4 mt-12">
            Select Processing Mode
          </h1>
          <p className="font-sans text-sm text-neutral-dark/60 text-center max-w-lg mb-4 leading-relaxed">
            Process patient data through the compliance-secured HL7 pipeline.
            Your data is processed in-memory and deleted immediately after download.
          </p>

          {/* Stateless disclaimer */}
          <div className="flex items-center gap-2 mb-8 px-4 py-2 bg-primary-gold/5 border border-primary-gold/20 rounded-sm">
            <ShieldCheck size={14} className="text-primary-gold shrink-0" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-primary-gold/80">
              Stateless Processing — Zero data persistence
            </span>
          </div>

          <div className="w-[48px] h-[1px] bg-primary-gold mb-16"></div>

          {/* Two equal cards */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* ---- Batch Mode Card ---- */}
            <motion.div
              onClick={() => navigate('/batch')}
              whileHover={{ y: -4 }}
              className="bg-white border border-primary-gold/20 rounded-sm p-10 cursor-pointer hover:shadow-[0_10px_40px_-15px_rgba(193,175,134,0.2)] transition-all group flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <FileStack size={22} className="text-primary-gold" />
                <h2 className="font-title text-4xl text-neutral-dark group-hover:italic transition-all">
                  Batch Mode
                </h2>
              </div>
              <p className="text-sm text-neutral-dark/60 mb-8 leading-relaxed flex-1">
                Upload CSV files to process multiple patient records through the pipeline.
                Supports MIMIC-IV (3-file upload) and generic CSV datasets.
                All files must be under 5MB.
              </p>

              <div className="border-t border-primary-gold/10 pt-6 space-y-3 mb-8">
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-dark/40">
                  <div className="w-1 h-1 rounded-full bg-primary-gold/50"></div>
                  MIMIC-IV (patients, labevents, d_labitems)
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-dark/40">
                  <div className="w-1 h-1 rounded-full bg-primary-gold/50"></div>
                  Generic CSV (any flat dataset)
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-dark/40">
                  <div className="w-1 h-1 rounded-full bg-primary-gold/50"></div>
                  SSE streaming with real-time progress
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-dark/40">
                  <div className="w-1 h-1 rounded-full bg-primary-gold/50"></div>
                  ZIP download of all generated .hl7 files
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-primary-gold text-[10px] font-mono uppercase tracking-wider">
                Upload Files
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>

            {/* ---- Single Patient Card ---- */}
            <motion.div
              onClick={() => navigate('/single-patient')}
              whileHover={{ y: -4 }}
              className="bg-white border border-primary-gold/20 rounded-sm p-10 cursor-pointer hover:shadow-[0_10px_40px_-15px_rgba(193,175,134,0.2)] transition-all group flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <User size={22} className="text-primary-gold" />
                <h2 className="font-title text-4xl text-neutral-dark group-hover:italic transition-all">
                  Single Patient
                </h2>
              </div>
              <p className="text-sm text-neutral-dark/60 mb-8 leading-relaxed flex-1">
                Manually enter one patient's data field-by-field. Build and download
                a single signed HL7 message with live preview and random value generation.
              </p>

              <div className="border-t border-primary-gold/10 pt-6 space-y-3 mb-8">
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-dark/40">
                  <div className="w-1 h-1 rounded-full bg-primary-gold/50"></div>
                  Dynamic header/value form
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-dark/40">
                  <div className="w-1 h-1 rounded-full bg-primary-gold/50"></div>
                  Random value generation
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-dark/40">
                  <div className="w-1 h-1 rounded-full bg-primary-gold/50"></div>
                  Live HL7 preview
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-dark/40">
                  <div className="w-1 h-1 rounded-full bg-primary-gold/50"></div>
                  SHA-256 integrity seal
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-primary-gold text-[10px] font-mono uppercase tracking-wider">
                Enter Data
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

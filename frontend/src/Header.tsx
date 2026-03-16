/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

type TabId = 'home' | 'pipeline' | 'architecture' | 'compliance' | 'legal-framework' | 'digital-signatures' | 'gdpr' | 'healthcare' | 'case-studies' | 'data-lifecycle' | 'data-classification' | 'penalties' | 'consent' | 'encryption' | 'audit-log' | 'breach-detection' | 'compliance-score' | 'data-lineage' | 'risk-assessment' | 'access-control';

interface HeaderProps {
  activeTab?: TabId;
}

export default function Header({ activeTab }: HeaderProps) {
  const [legalOpen, setLegalOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const legalRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (legalRef.current && !legalRef.current.contains(e.target as Node)) {
        setLegalOpen(false);
      }
      if (securityRef.current && !securityRef.current.contains(e.target as Node)) {
        setSecurityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const primaryNav = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'pipeline', label: 'Pipeline', path: '/selection' },
    { id: 'architecture', label: 'Architecture', path: '/architecture' },
    { id: 'compliance', label: 'Compliance', path: '/compliance' },
  ];

  const legalPages = [
    { id: 'legal-framework', label: 'Legal Framework', path: '/legal-framework' },
    { id: 'digital-signatures', label: 'Digital Signatures', path: '/digital-signatures' },
    { id: 'gdpr', label: 'GDPR', path: '/gdpr' },
    { id: 'healthcare', label: 'Healthcare Protection', path: '/healthcare' },
    { id: 'case-studies', label: 'Case Studies', path: '/case-studies' },
    { id: 'data-lifecycle', label: 'Data Lifecycle', path: '/data-lifecycle' },
    { id: 'data-classification', label: 'Data Classification', path: '/data-classification' },
    { id: 'penalties', label: 'Penalties & Offences', path: '/penalties' },
    { id: 'consent', label: 'Consent Management', path: '/consent' },
  ];

  const securityPages = [
    { id: 'encryption', label: 'Encryption Comparison', path: '/encryption' },
    { id: 'audit-log', label: 'Audit Log', path: '/audit-log' },
    { id: 'breach-detection', label: 'Breach Detection', path: '/breach-detection' },
    { id: 'compliance-score', label: 'Compliance Score', path: '/compliance-score' },
    { id: 'data-lineage', label: 'Data Lineage', path: '/data-lineage' },
    { id: 'risk-assessment', label: 'Risk Assessment', path: '/risk-assessment' },
    { id: 'access-control', label: 'Access Control', path: '/access-control' },
  ];

  const isLegalActive = legalPages.some(p => p.id === activeTab);
  const isSecurityActive = securityPages.some(p => p.id === activeTab);

  return (
    <header className="fixed top-0 w-full z-50 bg-[#f7f7f6]/80 backdrop-blur-md border-b border-gold/10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="font-title text-2xl tracking-tight font-light uppercase text-[#1c1a16]">
            HL7 <span className="italic lowercase font-title">Orchestrator</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-10 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
          {primaryNav.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`relative py-1 transition-colors hover:text-gold ${
                activeTab === item.id ? 'text-gold' : ''
              }`}
            >
              {item.label}
              {activeTab === item.id && (
                <motion.div
                  layoutId="header-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-gold"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}

          {/* Legal Dropdown */}
          <div className="relative" ref={legalRef}>
            <button
              onClick={() => { setLegalOpen(!legalOpen); setSecurityOpen(false); }}
              className={`relative py-1 transition-colors hover:text-gold flex items-center gap-1 ${
                isLegalActive ? 'text-gold' : ''
              }`}
            >
              Legal
              <ChevronDown size={12} className={`transition-transform ${legalOpen ? 'rotate-180' : ''}`} />
              {isLegalActive && (
                <motion.div
                  layoutId="header-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-gold"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            <AnimatePresence>
              {legalOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-3 w-56 bg-white border border-gold/20 shadow-xl shadow-black/5 py-2 z-50"
                >
                  {legalPages.map((page) => (
                    <Link
                      key={page.id}
                      to={page.path}
                      onClick={() => setLegalOpen(false)}
                      className={`block px-5 py-2.5 text-[10px] uppercase tracking-[0.15em] transition-all hover:bg-gold/5 hover:text-gold ${
                        activeTab === page.id ? 'text-gold bg-gold/5' : 'text-slate-600'
                      }`}
                    >
                      {page.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Security Dropdown */}
          <div className="relative" ref={securityRef}>
            <button
              onClick={() => { setSecurityOpen(!securityOpen); setLegalOpen(false); }}
              className={`relative py-1 transition-colors hover:text-gold flex items-center gap-1 ${
                isSecurityActive ? 'text-gold' : ''
              }`}
            >
              Security
              <ChevronDown size={12} className={`transition-transform ${securityOpen ? 'rotate-180' : ''}`} />
              {isSecurityActive && (
                <motion.div
                  layoutId="header-underline"
                  className="absolute bottom-0 left-0 right-0 h-px bg-gold"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            <AnimatePresence>
              {securityOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-3 w-56 bg-white border border-gold/20 shadow-xl shadow-black/5 py-2 z-50"
                >
                  {securityPages.map((page) => (
                    <Link
                      key={page.id}
                      to={page.path}
                      onClick={() => setSecurityOpen(false)}
                      className={`block px-5 py-2.5 text-[10px] uppercase tracking-[0.15em] transition-all hover:bg-gold/5 hover:text-gold ${
                        activeTab === page.id ? 'text-gold bg-gold/5' : 'text-slate-600'
                      }`}
                    >
                      {page.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] px-3 py-1 border border-gold text-gold tracking-tighter uppercase">v0.0.1</span>
        </div>
      </div>
    </header>
  );
}

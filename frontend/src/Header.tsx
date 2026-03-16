/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface HeaderProps {
  activeTab?: 'home' | 'pipeline' | 'compliance' | 'architecture';
}

export default function Header({ activeTab }: HeaderProps) {
  const navItems = [
    { id: 'home', label: 'Home', path: '/' },
    { id: 'pipeline', label: 'Pipeline', path: '/selection' },
    { id: 'architecture', label: 'Architecture', path: '/architecture' },
    { id: 'compliance', label: 'Compliance', path: '/compliance' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-[#f7f7f6]/80 backdrop-blur-md border-b border-gold/10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="font-title text-2xl tracking-tight font-light uppercase text-[#1c1a16]">
            HL7 <span className="italic lowercase font-title">Orchestrator</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-12 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
          {navItems.map((item) => (
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
        </nav>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] px-3 py-1 border border-gold text-gold tracking-tighter uppercase">v0.0.1</span>
        </div>
      </div>
    </header>
  );
}

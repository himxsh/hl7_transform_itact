/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  activeTab?: 'pipeline' | 'architecture' | 'database' | 'compliance';
}

export default function Header({ activeTab }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 bg-[#f7f7f6]/80 backdrop-blur-md border-b border-gold/10">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <span className="font-title text-2xl tracking-tight font-light uppercase text-[#1c1a16]">
            HL7 <span className="italic lowercase font-title">Orchestrator</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-12 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
          <Link
            className={`hover:text-gold transition-colors ${activeTab === 'pipeline' ? 'text-gold border-b border-gold pb-1' : ''}`}
            to="/"
          >
            Pipeline
          </Link>
          <a
            className={`hover:text-gold transition-colors ${activeTab === 'architecture' ? 'text-gold border-b border-gold pb-1' : ''}`}
            href="#architecture"
          >
            Architecture
          </a>
          <Link
            className={`hover:text-gold transition-colors ${activeTab === 'database' ? 'text-gold border-b border-gold pb-1' : ''}`}
            to="/selection"
          >
            Database
          </Link>
          <a
            className={`hover:text-gold transition-colors ${activeTab === 'compliance' ? 'text-gold border-b border-gold pb-1' : ''}`}
            href="#compliance"
          >
            Compliance
          </a>
        </nav>
        <div className="flex items-center gap-6">
          <span className="font-mono text-[10px] px-3 py-1 border border-gold text-gold tracking-tighter uppercase">v2.5.1</span>

        </div>
      </div>
    </header>
  );
}

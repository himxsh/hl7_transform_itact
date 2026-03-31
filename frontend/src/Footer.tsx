import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white pt-15 pb-15 border-t border-white/5 mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <span className="font-title text-3xl font-light uppercase tracking-tighter mb-6 block">
              HL7 <span className="italic lowercase font-title">Orchestrator</span>
            </span>
            <p className="font-sans text-slate-400 max-w-sm mb-10 leading-relaxed">
              This project was developed as an exhibition for the IT Act and Data Protection for the ITADP course under the guidance of Dr. Abhishek Sharma (LNMIIT). This project is not intended for commercial purposes.
            </p>
          </div>
          <div className="lg:col-span-7 flex justify-end">
            <div className="grid grid-cols-2 gap-12 lg:gap-24">
              <FooterColumn 
                title="Original Repo" 
                items={[
                  { label: 'HL7_transform', href: 'https://github.com/pdyban/hl7_transform' }
                ]} 
              />
              <FooterColumn 
                title="Contact" 
                items={[
                  { label: 'Email', href: 'mailto:23uec549@lnmiit.ac.in' },
                  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/himesh-jain-04134a2b8/' },
                  { label: 'GitHub', href: 'https://github.com/himxsh' }
                ]} 
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const FooterColumn = ({ title, items }: { title: string, items: { label: string, href: string }[] }) => (
  <div className="space-y-4">
    <span className="font-mono text-[10px] uppercase tracking-widest text-gold">{title}</span>
    <nav className="flex flex-col gap-2 font-sans text-sm text-slate-400">
      {items.map(item => (
        <a 
          key={item.label} 
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          {item.label}
        </a>
      ))}
    </nav>
  </div>
);

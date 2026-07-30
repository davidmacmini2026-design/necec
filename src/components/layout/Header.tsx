"use client"

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang, Lang } from '@/i18n';
import { ui } from '@/i18n/ui';

const navigation = [
  { label: ui.home, href: "/" },
  { label: ui.about, href: "/about" },
  { label: ui.services, href: "/services" },
  { label: ui.partners, href: "/partners" },
  { label: ui.programs, href: "/programs" },
  { label: ui.activities, href: "/activities" },
  { label: ui.contact, href: "/contact" },
];

const langOptions: { value: Lang; label: string }[] = [
  { value: 'zh', label: '🇨🇳 中文' },
  { value: 'fi', label: '🇫🇮 Suomi' },
  { value: 'en', label: '🇬🇧 English' },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { lang, setLang, t } = useLang();

  return (
    <header className="fixed top-0 w-full z-50 bg-[#000a1a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-wider text-white group z-50">
          <div className="relative w-8 h-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] group-hover:scale-105 transition-transform flex-shrink-0">
            <Image 
              src="/brand/logo.png" 
              alt="NECEC Logo" 
              fill
              className="object-contain" 
            />
          </div>
          <span className={lang === 'zh' ? 'text-base sm:text-lg md:text-xl tracking-normal' : ''}>
            {lang === 'zh' ? '北欧经济文化交流中心' : 'NECEC'} <span className="text-[#00c3ff]">.</span>
          </span>
        </Link>

        <nav className="hidden lg:flex gap-8">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium hover:text-[#00c3ff] transition-colors">
              {t(item.label)}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {/* Lang Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-full text-sm text-gray-400 hover:text-white transition-colors"
            >
              <Globe size={16} />
              <span className="text-xs hidden xl:inline">{lang === 'zh' ? '🇨🇳 中文' : lang === 'fi' ? '🇫🇮 Suomi' : '🇬🇧 EN'}</span>
            </button>
            {langOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setLangOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-36 bg-[#001233] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                  {langOptions.map(o => (
                    <button
                      key={o.value}
                      onClick={() => { setLang(o.value); setLangOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors ${lang === o.value ? 'text-[#00c3ff] font-bold' : 'text-gray-300'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Link href="/contact" className="px-5 py-2.5 bg-[#004A99] hover:bg-[#00c3ff] hover:text-[#001233] text-white text-sm font-semibold rounded-full transition-colors shadow-[0_0_15px_rgba(0,195,255,0.3)]">
            {t(ui.contactBtn)}
          </Link>
        </div>

        <button 
          className="lg:hidden relative z-50 p-2 text-white hover:text-[#00c3ff] transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 top-20 bg-[#000a1a]/95 backdrop-blur-xl z-40 lg:hidden flex flex-col pt-8 border-t border-white/5 h-[calc(100vh-80px)] overflow-y-auto"
          >
            <nav className="flex flex-col gap-6 px-6">
              {navigation.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-white hover:text-[#00c3ff] transition-colors border-b border-white/5 pb-4"
                >
                  {t(item.label)}
                </Link>
              ))}
              {/* Mobile lang switcher */}
              <div className="py-2 border-b border-white/5">
                <p className="text-sm text-gray-500 mb-3">{t(ui.langLabel)}</p>
                <div className="flex gap-2">
                  {langOptions.map(o => (
                    <button
                      key={o.value}
                      onClick={() => setLang(o.value)}
                      className={`px-3 py-1.5 rounded-full text-sm ${lang === o.value ? 'bg-[#00c3ff] text-black font-bold' : 'bg-white/10 text-gray-300'}`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-4 pb-12">
                <Link 
                  href="/contact" 
                  onClick={() => setIsOpen(false)}
                  className="inline-block w-full text-center px-5 py-4 bg-[#004A99] text-white text-lg font-semibold rounded-xl"
                >
                  {t(ui.contactBtn)}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

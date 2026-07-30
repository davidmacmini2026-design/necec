"use client"

import { motion } from "framer-motion";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useLang } from '@/i18n';
import { ui } from '@/i18n/ui';

interface Program {
  slug: string;
  title: string;
  titleFi: string | null;
  titleEn: string | null;
  description: string;
  descriptionFi: string | null;
  descriptionEn: string | null;
  image: string | null;
  featured: boolean;
}

interface Props {
  programs: Program[];
}

function pick(lang: string, zh: string, fi?: string | null, en?: string | null): string {
  if (lang === 'fi' && fi) return fi;
  if (lang === 'en' && en) return en;
  return zh;
}

export default function ProgramsClient({ programs }: Props) {
  const { lang, t } = useLang();

  return (
    <div className="pt-32 pb-24 min-h-screen max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
        <h1 className="text-5xl font-black text-white mb-6">{t(ui.programsPageTitle)}</h1>
        <p className="text-xl text-gray-400 max-w-2xl">{t(ui.programsPageDesc)}</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {programs.map((program, idx) => (
          <motion.div 
            key={program.slug}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="group flex flex-col bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-[#00c3ff]/40 transition-all"
          >
            <div className="h-64 bg-[#001233] relative flex items-center justify-center overflow-hidden">
              {program.image ? (
                 <Image src={program.image} alt={program.title} fill className="object-cover opacity-100 group-hover:scale-105 transition-transform duration-700" />
              ) : (
                 <span className="text-white/20 font-bold tracking-widest">[ {program.slug.toUpperCase()} IMAGE ]</span>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent/0 pointer-events-none" />
            </div>
            <div className="p-8 flex flex-col flex-grow relative z-20">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-white group-hover:text-[#00c3ff] transition-colors">
                  {pick(lang, program.title, program.titleFi, program.titleEn)}
                </h2>
                {program.featured && <span className="px-3 py-1 bg-[#D9A05B]/20 text-[#D9A05B] text-xs font-bold rounded-full border border-[#D9A05B]/30">{t(ui.featured)}</span>}
              </div>
              <p className="text-gray-400 leading-relaxed mb-8 flex-grow">
                {pick(lang, program.description, program.descriptionFi, program.descriptionEn)}
              </p>
              <Link href={`/programs/${program.slug}`} className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-[#00c3ff] hover:text-black text-white font-medium rounded-full transition-all w-fit">
                {t(ui.viewProgram)} <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

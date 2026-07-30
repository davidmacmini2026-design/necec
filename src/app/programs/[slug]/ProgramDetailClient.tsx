"use client"

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLang } from '@/i18n';
import { ui } from '@/i18n/ui';

interface Program {
  title: string;
  titleFi: string | null;
  titleEn: string | null;
  description: string;
  descriptionFi: string | null;
  descriptionEn: string | null;
  content: string;
  contentFi: string | null;
  contentEn: string | null;
  image: string | null;
  video: string | null;
  logo: string | null;
}

interface Props {
  program: Program | null;
  slug: string;
}

function pick(lang: string, zh: string, fi?: string | null, en?: string | null): string {
  if (lang === 'fi' && fi) return fi;
  if (lang === 'en' && en) return en;
  return zh;
}

export default function ProgramDetailClient({ program, slug }: Props) {
  const { lang, t } = useLang();

  if (!program) {
    return (
      <div className="pt-48 text-center min-h-screen">
        <h1 className="text-3xl text-white mb-4">{t(ui.programNotFound)}</h1>
        <Link href="/programs" className="text-[#00c3ff]">{t(ui.backToList)}</Link>
      </div>
    );
  }

  const title = pick(lang, program.title, program.titleFi, program.titleEn);
  const description = pick(lang, program.description, program.descriptionFi, program.descriptionEn);
  const content = pick(lang, program.content, program.contentFi, program.contentEn);

  return (
    <div className="pt-32 pb-24 min-h-screen max-w-4xl mx-auto px-6">
      <Link href="/programs" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-12">
        <ArrowLeft size={18} /> {t(ui.backToList)}
      </Link>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="w-full h-[400px] md:h-[500px] bg-[#001233] rounded-3xl mb-12 flex items-center justify-center border border-white/10 overflow-hidden relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          {program.video ? (
            <video 
              src={program.video} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover opacity-80"
            />
          ) : program.image ? (
            <Image src={program.image} alt={title} fill className="object-cover opacity-100" />
          ) : (
            <span className="text-white/20 font-bold tracking-widest text-xl">[ DETAIL HERO IMAGE ]</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#000a1a] via-[#000a1a]/20 to-transparent/0 opacity-90 pointer-events-none" />
        </div>

        <div className="flex items-center gap-5 mb-6">
          {program.logo && (
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-white/95 flex items-center justify-center p-3 shadow-2xl flex-shrink-0">
              <Image src={program.logo} alt={title} width={80} height={80} className="object-contain" />
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-black text-white">{title}</h1>
        </div>
        <p className="text-2xl text-[#00c3ff] mb-10 leading-relaxed">{description}</p>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-lg text-gray-300 leading-loose whitespace-pre-wrap">
            {content}
          </p>
          <div className="mt-12 p-8 bg-white/5 border border-white/10 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4">{t(ui.interestedTitle)}</h3>
            <p className="text-gray-400 mb-6">{t(ui.interestedDesc)}</p>
            <Link href="/contact" className="inline-block px-8 py-4 bg-[#004A99] hover:bg-[#00c3ff] hover:text-black text-white font-bold rounded-full transition-all">
              {t(ui.contactNow)}
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

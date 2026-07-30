"use client"

import { motion } from "framer-motion";
import { Briefcase, GraduationCap, Building2, Rocket, ArrowRight } from 'lucide-react';
import Link from "next/link";
import { useLang } from '@/i18n';
import { ui } from '@/i18n/ui';

const iconMap: Record<string, any> = {
  Briefcase, GraduationCap, Building2, Rocket
};

interface Service {
  id: string;
  icon: string;
  title: string;
  titleFi: string | null;
  titleEn: string | null;
  desc: string;
  descFi: string | null;
  descEn: string | null;
}

interface Props {
  services: Service[];
}

function pick(lang: string, zh: string, fi?: string | null, en?: string | null): string {
  if (lang === 'fi' && fi) return fi;
  if (lang === 'en' && en) return en;
  return zh;
}

export default function ServicesClient({ services }: Props) {
  const { lang, t } = useLang();

  return (
    <div className="pt-32 pb-24 min-h-screen max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20">
        <h1 className="text-5xl font-black text-white mb-6">{t(ui.services)}</h1>
        <p className="text-xl text-gray-400 max-w-2xl">
          {t({ zh: '作为连接两端的官方枢纽，NECEC 提供四大核心维度的双边赋能服务，确保跨国合作的精准对接与高效落地。', fi: 'Virallisena keskuksena NECEC tarjoaa neljä ydinpalvelua kahdenvälisen yhteistyön edistämiseksi.', en: 'As the official hub connecting both sides, NECEC provides four core dimensions of bilateral enabling services to ensure precise matching and efficient implementation of cross-border cooperation.' })}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {services.map((svc, idx) => {
          const Icon = iconMap[svc.icon] || Briefcase;
          return (
            <motion.div 
              key={svc.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex flex-col h-full"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00c3ff]/20 to-[#004A99]/20 border border-[#00c3ff]/30 flex items-center justify-center text-[#00c3ff] mb-8">
                <Icon size={32} />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {pick(lang, svc.title, svc.titleFi, svc.titleEn)}
              </h2>
              <p className="text-gray-400 leading-relaxed text-lg mb-8 flex-grow">
                {pick(lang, svc.desc, svc.descFi, svc.descEn)}
              </p>
              
              <Link href="/contact" className="inline-flex items-center gap-2 text-[#00c3ff] font-medium hover:text-white transition-colors mt-auto w-fit">
                {t({ zh: '发起合作咨询', fi: 'Pyydä konsultointia', en: 'Request Consultation' })}
                <ArrowRight size={18} />
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

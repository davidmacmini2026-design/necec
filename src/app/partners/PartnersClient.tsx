"use client"

import { motion } from "framer-motion";
import Link from 'next/link';
import Image from 'next/image';
import { useLang } from '@/i18n';
import { ui } from '@/i18n/ui';

interface PartnerItem {
  id: string;
  slug: string;
  name: string;
  nameFi: string | null;
  nameEn: string | null;
  description: string;
  descriptionFi: string | null;
  descriptionEn: string | null;
  logo: string | null;
  featured: boolean;
}

interface PartnerCategory {
  id: string;
  title: string;
  titleFi: string | null;
  titleEn: string | null;
  items: PartnerItem[];
}

interface Props {
  partners: PartnerCategory[];
}

function pick(lang: string, zh: string, fi?: string | null, en?: string | null): string {
  if (lang === 'fi' && fi) return fi;
  if (lang === 'en' && en) return en;
  return zh;
}

export default function PartnersClient({ partners }: Props) {
  const { lang, t } = useLang();

  return (
    <div className="pt-32 pb-24 min-h-screen max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20 text-center">
        <h1 className="text-5xl font-black text-white mb-6">{t(ui.partnersPageTitle)}</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">{t(ui.partnersPageDesc)}</p>
      </motion.div>

      <div className="space-y-24">
        {partners.map((category) => (
          <div key={category.id}>
            <h2 className="text-2xl font-bold text-[#00c3ff] mb-8 border-b border-white/10 pb-4 inline-block pr-12">
              {pick(lang, category.title, category.titleFi, category.titleEn)}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {category.items.map((partner) => (
                <Link key={partner.id} href={`/partners/${partner.slug}`} className="block group">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-[#00c3ff]/50 transition-all cursor-pointer h-full flex flex-col items-center text-center gap-4"
                  >
                    {partner.logo ? (
                      <div className="w-20 h-20 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/5">
                        <Image src={partner.logo} alt={partner.name} width={64} height={64} className="object-contain" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-[#004A99]/20 flex items-center justify-center text-[#00c3ff] text-2xl font-bold">
                        {pick(lang, partner.name, partner.nameFi, partner.nameEn).charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-[#00c3ff] transition-colors mb-2">
                        {pick(lang, partner.name, partner.nameFi, partner.nameEn)}
                      </h3>
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {pick(lang, partner.description, partner.descriptionFi, partner.descriptionEn)}
                      </p>
                    </div>
                    {partner.featured && (
                      <span className="px-2 py-0.5 bg-[#D9A05B]/20 text-[#D9A05B] text-xs rounded">精选</span>
                    )}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

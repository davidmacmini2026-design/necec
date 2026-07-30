"use client"

import { motion, Variants } from "framer-motion";
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Globe, Users, Target, Building2, GraduationCap, Handshake, MapPin } from 'lucide-react';
import { useLang } from '@/i18n';
import { ui } from '@/i18n/ui';

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

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

interface PartnerItem {
  id: string;
  name: string;
  nameFi: string | null;
  nameEn: string | null;
  logo?: string | null;
}

interface PartnerCategory {
  id: string;
  title: string;
  titleFi: string | null;
  titleEn: string | null;
  items: PartnerItem[];
}

interface Props {
  programs: Program[];
  partners: PartnerCategory[];
  heroVideo: string;
}

function pick(lang: string, zh: string, fi?: string | null, en?: string | null): string {
  if (lang === 'fi' && fi) return fi;
  if (lang === 'en' && en) return en;
  return zh;
}

export default function HomeClient({ programs, partners, heroVideo }: Props) {
  const { lang, t } = useLang();

  const brandItems = [
    { Icon: Globe, title: ui.brand1Title, desc: ui.brand1Desc },
    { Icon: Users, title: ui.brand2Title, desc: ui.brand2Desc },
    { Icon: Target, title: ui.brand3Title, desc: ui.brand3Desc },
  ];

  const totalPartners = partners.reduce((sum, cat) => sum + cat.items.length, 0);
  const allPartners = partners.flatMap(cat => cat.items);

  const stats = [
    { icon: Handshake, value: `${totalPartners}+`, label: { zh: '合作伙伴', fi: 'Kumppania', en: 'Partners' } },
    { icon: GraduationCap, value: '3', label: { zh: '旗舰项目', fi: 'Lippulaivaohjelmaa', en: 'Flagship Programs' } },
    { icon: Building2, value: '4', label: { zh: '核心服务领域', fi: 'Palvelualuetta', en: 'Service Areas' } },
    { icon: MapPin, value: '2', label: { zh: '双边办公室', fi: 'Toimipistettä', en: 'Offices' } },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ========== 1. HERO ========== */}
      <section className="relative flex flex-col md:min-h-[100vh] overflow-hidden">
        {/* 背景视频层 — 提高可见度 */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          {/* 左深右浅渐变 — 保证文字可读 */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#000a1a] via-[#000a1a]/70 to-[#000a1a]/30 z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#000a1a] via-transparent to-[#000a1a]/60 z-10" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full pt-32 pb-16 md:pt-28 md:pb-40 flex-1 flex items-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="max-w-4xl">
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sm font-medium text-[#00c3ff] mb-8">
              <span className="w-2 h-2 rounded-full bg-[#00c3ff] animate-pulse" />
              {t(ui.heroTag)}
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-4xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tight drop-shadow-2xl">
              {t(ui.heroMain)}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c3ff] via-[#4dd2ff] to-[#004A99]">{t(ui.heroSub)}</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg md:text-xl text-gray-300 mb-10 md:mb-12 max-w-2xl leading-relaxed drop-shadow-lg">
              {t(ui.heroDesc)}
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-wrap gap-4">
              <Link href="/services" className="px-8 py-4 bg-[#00c3ff] hover:bg-white text-black font-bold rounded-full transition-all flex items-center gap-2 group shadow-[0_0_30px_rgba(0,195,255,0.5)]">
                {t(ui.learnMore)} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/contact" className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium rounded-full transition-all flex items-center gap-2">
                {t(ui.consult)}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Hero 底部统计数字带 — 移动端随文档流，桌面端绝对定位 */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="relative md:absolute md:bottom-0 md:left-0 md:right-0 z-20"
        >
          <div className="max-w-7xl mx-auto px-6 pb-8 md:pb-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-white/10 rounded-2xl overflow-hidden backdrop-blur-md border border-white/10">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-[#000a1a]/60 px-4 md:px-6 py-5 md:py-6 flex items-center gap-3 md:gap-4">
                  <stat.icon className="text-[#00c3ff] flex-shrink-0" size={24} />
                  <div>
                    <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
                    <div className="text-xs text-gray-400">{pick(lang, stat.label.zh, stat.label.fi, stat.label.en)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ========== 2. 品牌定位 ========== */}
      <section className="py-24 bg-[#00050d] relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {brandItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: idx * 0.15 }}
                className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-[#00c3ff]/40 hover:bg-white/[0.07] transition-all group shadow-lg shadow-black/20"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#004A99] to-[#00c3ff]/30 flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,195,255,0.2)]">
                  <item.Icon size={26} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{t(item.title)}</h3>
                <p className="text-gray-400 leading-relaxed">{t(item.desc)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 3. 核心项目 ========== */}
      <section className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-14">
            <div>
              <div className="w-12 h-1 bg-[#00c3ff] rounded-full mb-6" />
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">{t(ui.programsTitle)}</h2>
              <p className="text-xl text-gray-400">{t(ui.programsDesc)}</p>
            </div>
            <Link href="/programs" className="hidden md:flex text-[#00c3ff] hover:text-white transition-colors items-center gap-2 font-medium">
              {t(ui.viewAll)} <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, idx) => (
              <Link key={program.slug} href={`/programs/${program.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.12 }}
                  className="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 flex flex-col h-[420px] cursor-pointer hover:border-[#00c3ff]/60 hover:shadow-[0_20px_60px_rgba(0,195,255,0.15)] transition-all duration-500"
                >
                  <div className="absolute inset-0 bg-[#001233] z-0">
                    {program.image && (
                      <Image src={program.image} alt={program.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000a1a] via-[#000a1a]/60 to-transparent z-10" />

                  <div className="relative z-20 mt-auto p-8">
                    {program.featured && (
                      <span className="inline-block px-3 py-1 bg-[#D9A05B] text-black text-xs font-bold rounded-full mb-4">{t(ui.featured)}</span>
                    )}
                    <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#00c3ff] transition-colors">
                      {pick(lang, program.title, program.titleFi, program.titleEn)}
                    </h3>
                    <p className="text-gray-300 text-sm line-clamp-2 mb-4">
                      {pick(lang, program.description, program.descriptionFi, program.descriptionEn)}
                    </p>
                    <span className="inline-flex items-center gap-2 text-[#00c3ff] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {t(ui.viewAll)} <ArrowRight size={16} />
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 4. 合作伙伴 Logo 墙 ========== */}
      <section className="py-24 bg-white/[0.03] border-y border-white/10 relative overflow-hidden">
        {/* 背景氛围光 */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#004A99]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#00c3ff]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-14">
            <div className="w-12 h-1 bg-[#00c3ff] rounded-full mb-6 mx-auto" />
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">{t(ui.partnersSection)}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {allPartners.slice(0, 12).map((partner, idx) => (
              <motion.div
                key={partner.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
              >
                <Link href="/partners" className="block group p-5 md:p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl hover:border-[#00c3ff]/50 hover:bg-white/[0.08] hover:shadow-[0_20px_50px_rgba(0,195,255,0.12)] transition-all duration-300">
                  {/* Logo 白瓷贴 */}
                  <div className="w-full h-20 md:h-24 bg-white rounded-2xl flex items-center justify-center p-3 mb-4 group-hover:scale-[1.03] transition-transform duration-300 shadow-inner">
                    {partner.logo ? (
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={120}
                        height={80}
                        className="object-contain max-h-14 md:max-h-16 w-auto"
                      />
                    ) : (
                      <span className="text-lg font-black text-[#001233]">{pick(lang, partner.name, partner.nameFi, partner.nameEn).charAt(0)}</span>
                    )}
                  </div>
                  {/* 单位名称 */}
                  <h3 className="text-sm md:text-base font-bold text-white text-center leading-snug group-hover:text-[#00c3ff] transition-colors line-clamp-2 min-h-[2.5em] flex items-center justify-center">
                    {pick(lang, partner.name, partner.nameFi, partner.nameEn)}
                  </h3>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/partners" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/5 border border-[#00c3ff]/40 text-[#00c3ff] font-bold rounded-full hover:bg-[#00c3ff] hover:text-black transition-all">
              {t(ui.viewAllPartners)} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========== 5. CTA ========== */}
      <section className="py-28 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#004A99]/50 via-[#001233] to-[#000a1a] border border-[#00c3ff]/30 rounded-[3rem] p-12 md:p-20 text-center relative overflow-hidden shadow-[0_0_80px_rgba(0,195,255,0.15)]">
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#00c3ff]/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#D9A05B]/10 rounded-full blur-[100px]" />

          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 relative z-10">{t(ui.ctaTitle)}</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto relative z-10 leading-relaxed">
            {t(ui.ctaDesc)}
          </p>

          <div className="flex justify-center gap-6 relative z-10">
            <Link href="/contact" className="px-10 py-5 bg-white text-black font-bold rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all flex items-center gap-2">
              {t(ui.ctaBtn)} <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

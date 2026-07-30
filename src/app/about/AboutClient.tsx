"use client"

import { motion } from "framer-motion";
import { Target, Compass } from 'lucide-react';
import Image from 'next/image';
import { useLang } from '@/i18n';
import { ui } from '@/i18n/ui';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  roleFi: string | null;
  roleEn: string | null;
  desc: string;
  descFi: string | null;
  descEn: string | null;
  image: string | null;
}

interface Props {
  team: TeamMember[];
}

function pick(lang: string, zh: string, fi?: string | null, en?: string | null): string {
  if (lang === 'fi' && fi) return fi;
  if (lang === 'en' && en) return en;
  return zh;
}

export default function AboutClient({ team }: Props) {
  const { lang, t } = useLang();

  return (
    <div className="pt-32 pb-24 min-h-screen max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20 text-center max-w-3xl mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#00c3ff]/10 rounded-full blur-[80px] -z-10" />
        
        <div className="mb-10 flex justify-center">
          <Image 
            src="/brand/logo.png" 
            alt="NECEC Brand Logo" 
            width={120} 
            height={150} 
            className="object-contain drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            priority
          />
        </div>

        <h1 className="text-5xl font-black text-white mb-6 tracking-tight">{t(ui.aboutTitle)}</h1>
        <p className="text-xl text-[#00c3ff] font-bold tracking-widest mb-8 uppercase drop-shadow-[0_0_5px_rgba(0,195,255,0.8)]">
          {t(ui.aboutSub)}
        </p>
        <p className="text-gray-400 leading-relaxed text-lg">
          {t(ui.aboutMain)}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
        <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-10 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
          <Target className="w-12 h-12 text-[#00c3ff] mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">{t(ui.ourMission)}</h2>
          <p className="text-gray-400 leading-relaxed">{t(ui.missionText)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="p-10 rounded-3xl bg-gradient-to-br from-[#004A99]/20 to-transparent border border-[#00c3ff]/20 backdrop-blur-sm">
          <Compass className="w-12 h-12 text-[#D9A05B] mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">{t(ui.ourVision)}</h2>
          <p className="text-gray-400 leading-relaxed">{t(ui.visionText)}</p>
        </motion.div>
      </div>

      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-16 text-center">{t(ui.teamTitle)}</h2>

        {/* ===== 主席区 ===== */}
        {(() => {
          const chairman = team.filter(m => m.role.includes('主席') && !m.role.includes('副'));
          const viceChairs = team.filter(m => m.role.includes('副主席'));
          const advisors = team.filter(m => !m.role.includes('主席'));

          return (
            <>
              {chairman.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="max-w-3xl mx-auto mb-20 p-10 md:p-12 rounded-3xl bg-gradient-to-br from-[#004A99]/30 to-[#001233] border border-[#00c3ff]/30 text-center relative overflow-hidden shadow-[0_0_60px_rgba(0,195,255,0.1)]"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c3ff]/10 rounded-full blur-[80px] pointer-events-none" />
                  <div className="w-32 h-32 rounded-full bg-[#001233] border-3 border-[#00c3ff] mx-auto mb-6 overflow-hidden relative shadow-[0_0_30px_rgba(0,195,255,0.4)]">
                    {member.image ? (
                      <Image src={member.image} alt={member.name} fill className="object-cover" />
                    ) : (
                      <span className="opacity-50 text-xs">Photo</span>
                    )}
                  </div>
                  <h3 className="text-3xl font-black text-white mb-2">{member.name}</h3>
                  <p className="text-[#D9A05B] text-base font-bold mb-6 tracking-wide">
                    {pick(lang, member.role, member.roleFi, member.roleEn)}
                  </p>
                  <p className="text-gray-300 leading-relaxed max-w-2xl mx-auto">
                    {pick(lang, member.desc, member.descFi, member.descEn)}
                  </p>
                </motion.div>
              ))}

              {/* ===== 副主席区 ===== */}
              {viceChairs.length > 0 && (
                <div className="mb-20">
                  <div className="flex items-center gap-6 mb-10">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#00c3ff]/40" />
                    <h3 className="text-2xl font-bold text-[#00c3ff] tracking-widest">{lang === 'zh' ? '副主席' : lang === 'fi' ? 'Varapuheenjohtajat' : 'Vice Chairs'}</h3>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#00c3ff]/40" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {viceChairs.map((member, idx) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-[#00c3ff]/50 hover:bg-white/[0.08] transition-all group text-center"
                      >
                        <div className="w-24 h-24 rounded-full bg-[#001233] border-2 border-[#004A99] mx-auto mb-5 overflow-hidden relative group-hover:border-[#00c3ff] transition-colors shadow-[0_0_15px_rgba(0,195,255,0.2)]">
                          {member.image ? (
                            <Image src={member.image} alt={member.name} fill className="object-cover" />
                          ) : (
                            <span className="opacity-50 text-xs">Photo</span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-[#00c3ff] transition-colors">{member.name}</h4>
                        <p className="text-[#D9A05B] text-xs font-medium mb-3">
                          {pick(lang, member.role, member.roleFi, member.roleEn)}
                        </p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          {pick(lang, member.desc, member.descFi, member.descEn)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== 顾问区 ===== */}
              {advisors.length > 0 && (
                <div>
                  <div className="flex items-center gap-6 mb-10">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#D9A05B]/40" />
                    <h3 className="text-2xl font-bold text-[#D9A05B] tracking-widest">{lang === 'zh' ? '顾问' : lang === 'fi' ? 'Neuvonantajat' : 'Advisors'}</h3>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#D9A05B]/40" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {advisors.map((member, idx) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-[#D9A05B]/40 hover:bg-white/[0.06] transition-all group text-center"
                      >
                        <div className="w-20 h-20 rounded-full bg-[#001233] border-2 border-[#D9A05B]/40 mx-auto mb-5 overflow-hidden relative group-hover:border-[#D9A05B] transition-colors">
                          {member.image ? (
                            <Image src={member.image} alt={member.name} fill className="object-cover" />
                          ) : (
                            <span className="opacity-50 text-xs">Photo</span>
                          )}
                        </div>
                        <h4 className="text-lg font-bold text-white mb-1 group-hover:text-[#D9A05B] transition-colors">{member.name}</h4>
                        <p className="text-[#D9A05B] text-xs font-medium mb-3">
                          {pick(lang, member.role, member.roleFi, member.roleEn)}
                        </p>
                        <p className="text-gray-400 text-xs leading-relaxed">
                          {pick(lang, member.desc, member.descFi, member.descEn)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}

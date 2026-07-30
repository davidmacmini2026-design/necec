"use client"

import { motion } from "framer-motion";
import Image from "next/image";
import { useLang } from '@/i18n';
import { ui } from '@/i18n/ui';

interface Activity {
  id: string;
  date: string;
  title: string;
  titleFi: string | null;
  titleEn: string | null;
  desc: string;
  descFi: string | null;
  descEn: string | null;
  image: string | null;
  video: string | null;
}

interface Props {
  activities: Activity[];
}

function pick(lang: string, zh: string, fi?: string | null, en?: string | null): string {
  if (lang === 'fi' && fi) return fi;
  if (lang === 'en' && en) return en;
  return zh;
}

export default function ActivitiesClient({ activities }: Props) {
  const { lang, t } = useLang();

  return (
    <div className="pt-32 pb-24 min-h-screen max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20 text-center">
        <h1 className="text-5xl font-black text-white mb-6">{t(ui.activitiesPageTitle)}</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">{t(ui.activitiesPageDesc)}</p>
      </motion.div>

      <div className="relative max-w-4xl mx-auto">
        <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#00c3ff] via-[#004A99] to-transparent -translate-x-1/2" />

        {activities.map((activity, idx) => (
          <motion.div 
            key={activity.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className={`relative flex flex-col md:flex-row items-center mb-16 ${idx % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
          >
            <div className="absolute left-[20px] md:left-1/2 w-4 h-4 bg-[#00c3ff] rounded-full border-4 border-[#000a1a] -translate-x-1/2 z-10 shadow-[0_0_10px_rgba(0,195,255,0.8)]" />

            <div className={`w-full pl-12 md:pl-0 md:w-1/2 ${idx % 2 === 0 ? 'md:pl-12' : 'md:pr-12 text-left md:text-right'}`}>
              <div className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-[#00c3ff]/40 transition-colors group">
                <span className="inline-block px-3 py-1 bg-[#004A99]/30 text-[#00c3ff] text-sm font-bold rounded-full mb-4">
                  {activity.date}
                </span>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#00c3ff] transition-colors">
                  {pick(lang, activity.title, activity.titleFi, activity.titleEn)}
                </h3>
                <div className="w-full h-64 bg-[#001233] border border-white/10 rounded-xl mb-6 flex items-center justify-center overflow-hidden relative shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(0,195,255,0.15)] transition-shadow duration-500">
                  {activity.video ? (
                    <video 
                      src={activity.video} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                    />
                  ) : activity.image ? (
                    <Image 
                      src={activity.image} 
                      alt={pick(lang, activity.title, activity.titleFi, activity.titleEn)} 
                      fill 
                      className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                    />
                  ) : (
                    <span className="text-white/20 font-bold tracking-widest text-sm">[ EVENT IMAGE ]</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#000a1a]/40 to-transparent pointer-events-none" />
                </div>
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  {pick(lang, activity.desc, activity.descFi, activity.descEn)}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

"use client"

import Link from 'next/link';
import { ArrowLeft, Globe, Building2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLang } from '@/i18n';
import { ui } from '@/i18n/ui';

interface PartnerItem {
  slug: string;
  name: string;
  nameFi: string | null;
  nameEn: string | null;
  description: string;
  descriptionFi: string | null;
  descriptionEn: string | null;
  content: string;
  contentFi: string | null;
  contentEn: string | null;
  logo: string | null;
  image: string | null;
  video: string | null;
  website: string | null;
  featured: boolean;
  category: { title: string; titleFi: string | null; titleEn: string | null } | null;
}

interface Props {
  partner: PartnerItem;
}

function pick(lang: string, zh: string, fi?: string | null, en?: string | null): string {
  if (lang === 'fi' && fi) return fi;
  if (lang === 'en' && en) return en;
  return zh;
}

// 智能识别视频类型：YouTube / Bilibili / 本地文件
function getVideoEmbed(url: string): { type: 'youtube' | 'bilibili' | 'file'; embedUrl: string } {
  // YouTube: watch?v=, youtu.be/, embed/
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (ytMatch) {
    return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }
  // Bilibili: BV号
  const biliMatch = url.match(/bilibili\.com\/video\/(BV\w+)/);
  if (biliMatch) {
    return { type: 'bilibili', embedUrl: `https://player.bilibili.com/player.html?bvid=${biliMatch[1]}&autoplay=0` };
  }
  return { type: 'file', embedUrl: url };
}

export default function PartnerDetailClient({ partner }: Props) {
  const { lang, t } = useLang();

  const name = pick(lang, partner.name, partner.nameFi, partner.nameEn);
  const description = pick(lang, partner.description, partner.descriptionFi, partner.descriptionEn);
  const content = pick(lang, partner.content, partner.contentFi, partner.contentEn);
  const categoryTitle = partner.category ? pick(lang, partner.category.title, partner.category.titleFi, partner.category.titleEn) : '';

  const hasHeroMedia = !!(partner.video || partner.image);
  const videoEmbed = partner.video ? getVideoEmbed(partner.video) : null;
  const isFileVideo = videoEmbed?.type === 'file';

  return (
    <div className="min-h-screen">
      {/* ===== HERO 区：沉浸式媒体封面 ===== */}
      <section className={`relative w-full overflow-hidden ${hasHeroMedia ? 'h-[70vh] min-h-[480px]' : 'h-[45vh] min-h-[360px]'}`}>
        {/* 背景媒体层 */}
        {isFileVideo ? (
          <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" src={videoEmbed.embedUrl} />
        ) : partner.image ? (
          <Image src={partner.image} alt={name} fill priority className="object-cover" />
        ) : (
          // 无媒体时的品牌渐变底
          <div className="absolute inset-0 bg-gradient-to-br from-[#001233] via-[#002a5c] to-[#000a1a]">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 30% 40%, rgba(0,195,255,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(217,160,91,0.2) 0%, transparent 50%)' }} />
          </div>
        )}

        {/* 渐变遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#000a1a] via-[#000a1a]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#000a1a]/60 to-transparent" />

        {/* 返回按钮 */}
        <div className="absolute top-28 left-6 md:left-12 z-20">
          <Link href="/partners" className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-gray-200 hover:text-white hover:border-[#00c3ff]/60 transition-all text-sm">
            <ArrowLeft size={16} /> {t(ui.backToList)}
          </Link>
        </div>

        {/* Hero 内容层 */}
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto px-6 md:px-12 pb-16 w-full">
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="flex items-end gap-6">
              {/* Logo 卡片 */}
              {partner.logo && (
                <div className="hidden md:flex w-28 h-28 rounded-2xl bg-white/95 backdrop-blur-sm items-center justify-center p-4 shadow-2xl flex-shrink-0">
                  <Image src={partner.logo} alt={name} width={96} height={96} className="object-contain" />
                </div>
              )}
              <div className="min-w-0">
                {categoryTitle && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00c3ff]/20 backdrop-blur-sm border border-[#00c3ff]/40 text-[#00c3ff] text-sm rounded-full mb-4">
                    <Building2 size={14} /> {categoryTitle}
                  </span>
                )}
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight mb-3 drop-shadow-lg">{name}</h1>
                {partner.featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#D9A05B] text-black text-xs font-bold rounded-full">
                    <Sparkles size={12} /> 精选合作伙伴
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== 主体内容 ===== */}
      <section className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* 左栏：简介 + 正文 */}
          <div className="lg:col-span-2 space-y-12">
            {/* 一句话简介 */}
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-2xl md:text-3xl text-[#00c3ff] font-light leading-relaxed border-l-4 border-[#00c3ff] pl-6">
              {description}
            </motion.p>

            {/* 视频播放器（本地文件带控制条） */}
            {isFileVideo && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
                <video
                  src={videoEmbed.embedUrl}
                  className="absolute inset-0 w-full h-full"
                  controls
                  preload="metadata"
                  title={name}
                />
              </motion.div>
            )}

            {/* YouTube/B站 iframe（旧数据兼容） */}
            {videoEmbed && videoEmbed.type !== 'file' && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                <iframe
                  src={videoEmbed.embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={name}
                />
              </motion.div>
            )}

            {/* 正文内容 */}
            {content && content.length > 5 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="prose prose-invert prose-lg max-w-none">
                <div className="text-gray-300 leading-loose whitespace-pre-wrap text-lg">
                  {content}
                </div>
              </motion.div>
            )}
          </div>

          {/* 右栏：信息卡片 */}
          <div className="space-y-6">
            {/* 官网链接卡片 */}
            {partner.website && (
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#00c3ff]/40 transition-colors">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">官方网站</h3>
                <a href={partner.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[#00c3ff] hover:text-white font-medium transition-colors break-all">
                  <Globe size={18} className="flex-shrink-0" /> {partner.website.replace(/^https?:\/\//, '')}
                </a>
              </motion.div>
            )}

            {/* CTA 卡片 */}
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="p-8 bg-gradient-to-br from-[#004A99]/40 to-[#001233] border border-[#00c3ff]/20 rounded-2xl">
              <h3 className="text-xl font-bold text-white mb-3">{t(ui.interestedTitle)}</h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">{t(ui.interestedDesc)}</p>
              <Link href="/contact" className="block text-center px-6 py-3.5 bg-[#00c3ff] hover:bg-white text-black font-bold rounded-full transition-all shadow-[0_0_20px_rgba(0,195,255,0.3)]">
                {t(ui.contactNow)}
              </Link>
            </motion.div>

            {/* 移动端 Logo 展示 */}
            {partner.logo && (
              <div className="md:hidden p-6 bg-white/5 border border-white/10 rounded-2xl flex justify-center">
                <Image src={partner.logo} alt={name} width={160} height={120} className="object-contain" />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

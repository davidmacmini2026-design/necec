"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, MapPin, MessageSquare, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLang } from '@/i18n';
import { ui } from '@/i18n/ui';

interface SiteData {
  name: string;
  nameEn?: string;
  description: string;
  qrCode?: string;
  contact: {
    email: string;
    wechat: string;
    location: string;
  };
}

export default function ContactPage() {
  const { lang, t } = useLang();
  const [site, setSite] = useState<SiteData | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', organization: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/site')
      .then(r => r.json())
      .then(data => {
        if (data.contact) setSite(data);
      })
      .catch(() => {});
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t(ui.nameRequired);
    if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = t(ui.emailRequired);
    if (!formData.message.trim()) newErrors.message = t(ui.messageRequired);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('submitting');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', organization: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const siteName = lang === 'en' && site?.nameEn ? site.nameEn : site?.name || '北欧经济文化中心';
  const qrCode = site?.qrCode || '';
  const email = site?.contact?.email || 'contact@necec.org';
  const wechat = site?.contact?.wechat || 'NECEC_Official';
  const location = site?.contact?.location || 'Helsinki, Finland & Shanghai, China';

  return (
    <div className="pt-32 pb-24 min-h-screen max-w-7xl mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-20 text-center">
        <h1 className="text-5xl font-black text-white mb-6">{t(ui.contactPageTitle)}</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          {t(ui.contactPageDesc)}
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Contact Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-10">
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
            <h3 className="text-2xl font-bold text-white mb-8">{t(ui.contactInfoTitle)}</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#004A99]/20 flex items-center justify-center text-[#00c3ff] shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t(ui.officialEmail)}</p>
                  <p className="text-lg text-white font-medium">{email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#004A99]/20 flex items-center justify-center text-[#00c3ff] shrink-0">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t(ui.officialWechat)}</p>
                  <p className="text-lg text-white font-medium">{wechat}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#004A99]/20 flex items-center justify-center text-[#00c3ff] shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{t(ui.officeLocation)}</p>
                  <p className="text-lg text-white font-medium">{location}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-8 bg-gradient-to-br from-[#00c3ff]/10 to-transparent border border-[#00c3ff]/20 rounded-3xl flex flex-col items-center justify-center text-center">
             {qrCode ? (
               <div className="w-40 h-40 relative rounded-xl overflow-hidden border border-white/10 bg-white mb-4">
                 <img src={qrCode} alt="WeChat QR Code" className="w-full h-full object-contain p-1" />
               </div>
             ) : (
               <div className="w-32 h-32 bg-white/10 rounded-xl flex items-center justify-center mb-4 border border-white/20">
                 <span className="text-white/40 text-xs">[ QR CODE ]</span>
               </div>
             )}
             <p className="text-gray-300 font-medium">{t(ui.scanWechat)}</p>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <form onSubmit={handleSubmit} className="p-8 md:p-10 bg-white/5 border border-white/10 rounded-3xl flex flex-col gap-6">
            <h3 className="text-2xl font-bold text-white mb-2">{t(ui.onlineMessage)}</h3>
            
            {status === 'success' && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400">
                <CheckCircle2 size={20} /> {t(ui.submitSuccess)}
              </div>
            )}

            {status === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400">
                <AlertCircle size={20} /> {t(ui.submitError)}
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-2">{t(ui.nameLabel)} *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className={`w-full px-4 py-3 rounded-xl bg-[#001233] border ${errors.name ? 'border-red-500' : 'border-white/10 focus:border-[#00c3ff]'} text-white outline-none transition-colors`}
                placeholder={t(ui.namePlaceholder)}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">{t(ui.emailLabel)} *</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className={`w-full px-4 py-3 rounded-xl bg-[#001233] border ${errors.email ? 'border-red-500' : 'border-white/10 focus:border-[#00c3ff]'} text-white outline-none transition-colors`}
                placeholder={t(ui.emailPlaceholder)}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">{t(ui.orgLabel)}</label>
              <input 
                type="text" 
                value={formData.organization}
                onChange={e => setFormData({...formData, organization: e.target.value})}
                className="w-full px-4 py-3 rounded-xl bg-[#001233] border border-white/10 focus:border-[#00c3ff] text-white outline-none transition-colors"
                placeholder={t(ui.orgPlaceholder)}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">{t(ui.messageLabel)} *</label>
              <textarea 
                rows={4}
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                className={`w-full px-4 py-3 rounded-xl bg-[#001233] border ${errors.message ? 'border-red-500' : 'border-white/10 focus:border-[#00c3ff]'} text-white outline-none transition-colors resize-none`}
                placeholder={t(ui.messagePlaceholder)}
              />
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={status === 'submitting'}
              className="mt-4 w-full py-4 bg-[#00c3ff] hover:bg-[#00c3ff]/90 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? (
                <><Loader2 className="animate-spin" size={20} /> {t(ui.submitting)}</>
              ) : t(ui.sendMessage)}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

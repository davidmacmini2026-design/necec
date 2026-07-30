"use client"

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLang } from '@/i18n';
import { ui } from '@/i18n/ui';

export default function Footer() {
  const { t } = useLang();
  const [contact, setContact] = useState({ email: '', wechat: '', location: '' });

  useEffect(() => {
    fetch('/api/site')
      .then(r => r.json())
      .then(data => {
        if (data.contact) setContact(data.contact);
      })
      .catch(() => {});
  }, []);

  const email = contact.email || 'contact@necec.org';
  const wechat = contact.wechat || 'NECEC_Official';
  const location = contact.location || 'Helsinki, Finland & Shanghai, China';

  return (
    <footer className="bg-[#00050d] border-t border-white/5 py-12 mt-20 relative overflow-hidden">
      <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none -mr-20 -mb-20">
        <Image src="/brand/logo.png" alt="" width={400} height={500} className="object-contain grayscale" />
      </div>
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
        <div className="col-span-1 md:col-span-3">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-12 h-[60px] opacity-90 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
              <Image 
                src="/brand/logo.png" 
                alt="NECEC Logo" 
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight">{t(ui.orgName)}</h2>
              <p className="text-xs font-semibold text-[#00c3ff] tracking-wider uppercase">Nordic Economic and Culture Exchange Center</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 max-w-full">
            {t(ui.footerTagline)}
          </p>
        </div>
        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">{t(ui.contactUs)}</h3>
          <p className="text-sm text-gray-400 mb-2">{t(ui.email)}: {email}</p>
          <p className="text-sm text-gray-400 mb-2">{t(ui.wechat)}: {wechat}</p>
          <p className="text-sm text-gray-400">{t(ui.location)}: {location}</p>
        </div>
        <div className="col-span-1">
          <h3 className="text-lg font-semibold text-white mb-4">{t(ui.quickLinks)}</h3>
          <ul className="space-y-2">
            {[
              { label: t(ui.about), href: "/about" },
              { label: t(ui.services), href: "/services" },
              { label: t(ui.partners), href: "/partners" },
              { label: t(ui.programs), href: "/programs" },
            ].map(item => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-gray-400 hover:text-[#00c3ff] transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-sm text-gray-500 relative z-10">
        &copy; {new Date().getFullYear()} NECEC. All rights reserved.
      </div>
    </footer>
  );
}

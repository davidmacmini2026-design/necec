'use client';

import { useEffect, useState } from 'react';
import FileUpload from './FileUpload';
import ImageUpload from './ImageUpload';
import TranslatedFields from './TranslatedFields';

export default function SiteForm() {
  const [form, setForm] = useState({ name: '', nameEn: '', nameFi: '', shortName: '', description: '', descriptionEn: '', descriptionFi: '', contactEmail: '', contactWechat: '', contactLocation: '', heroVideo: '', qrCode: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/site').then(r => r.json()).then(data => {
      if (data) setForm({ ...data, nameFi: data.nameFi || '', descriptionEn: data.descriptionEn || '', descriptionFi: data.descriptionFi || '' });
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body: any = { ...form };
    if (!(body as any).nameFi) body.nameFi = null;
    if (!(body as any).descriptionEn) body.descriptionEn = null;
    if (!(body as any).descriptionFi) body.descriptionFi = null;
    await fetch('/api/site', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-bold text-white mb-4">站点基本设置</h2>
      <div>
        <label className="block text-sm text-gray-400 mb-1">中文名称</label>
        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-[#001233] border border-white/10 text-white outline-none focus:border-[#00c3ff]" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">英文名称</label>
        <input value={form.nameEn} onChange={e => setForm({...form, nameEn: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-[#001233] border border-white/10 text-white outline-none focus:border-[#00c3ff]" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">芬兰语名称</label>
        <input value={form.nameFi || ''} onChange={e => setForm({...form, nameFi: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-[#001233] border border-white/10 text-white outline-none focus:border-[#00c3ff]" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">简称</label>
        <input value={form.shortName} onChange={e => setForm({...form, shortName: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-[#001233] border border-white/10 text-white outline-none focus:border-[#00c3ff]" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">描述 (中文)</label>
        <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-[#001233] border border-white/10 text-white outline-none focus:border-[#00c3ff]" />
      </div>
      <TranslatedFields label="描述翻译" fields={[{ lang: 'fi', label: '芬兰语', suffix: 'Fi' }, { lang: 'en', label: '英语', suffix: 'En' }]}>
        {suffix => (
          <textarea rows={2} value={(form as any)[`description${suffix}`] || ''} onChange={e => setForm({...form, [`description${suffix}`]: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
        )}
      </TranslatedFields>
      <div>
        <label className="block text-sm text-gray-400 mb-1">📧 接收邮箱（Contact 页面表单提交后发往此地址）</label>
        <input value={form.contactEmail} onChange={e => setForm({...form, contactEmail: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-[#001233] border border-white/10 text-white outline-none focus:border-[#00c3ff]" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">微信公众号</label>
        <input value={form.contactWechat} onChange={e => setForm({...form, contactWechat: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-[#001233] border border-white/10 text-white outline-none focus:border-[#00c3ff]" />
      </div>
      <div>
        <label className="block text-sm text-gray-400 mb-1">办公坐标</label>
        <input value={form.contactLocation} onChange={e => setForm({...form, contactLocation: e.target.value})} className="w-full px-4 py-2 rounded-lg bg-[#001233] border border-white/10 text-white outline-none focus:border-[#00c3ff]" />
      </div>
      <ImageUpload
        value={form.qrCode || ''}
        onChange={url => setForm({ ...form, qrCode: url })}
        label="📱 公众号二维码（Contact 页面显示）"
      />
      <FileUpload
        value={form.heroVideo || ''}
        onChange={url => setForm({ ...form, heroVideo: url })}
        label="首页背景视频"
        accept="video/*"
      />
      <button type="submit" className="px-6 py-2 bg-[#00c3ff] text-black font-bold rounded-lg hover:bg-[#00c3ff]/80 transition-colors">
        {saved ? '✅ 已保存' : '保存设置'}
      </button>
    </form>
  );
}

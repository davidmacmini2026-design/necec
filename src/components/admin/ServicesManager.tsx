'use client';

import { useEffect, useState } from 'react';
import TranslatedFields from './TranslatedFields';

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

const iconOptions = ['Briefcase', 'GraduationCap', 'Building2', 'Rocket'];

export default function ServicesManager() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState({ icon: 'Briefcase', title: '', titleFi: '', titleEn: '', desc: '', descFi: '', descEn: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = () => fetch('/api/services').then(r => r.json()).then(setServices);

  const openEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({ icon: s.icon, title: s.title, titleFi: s.titleFi || '', titleEn: s.titleEn || '', desc: s.desc, descFi: s.descFi || '', descEn: s.descEn || '' });
  };

  const save = async () => {
    const method = editingId ? 'PUT' : 'POST';
    const body: any = editingId ? { id: editingId, ...form } : form;
    if (!(body as any).titleFi) body.titleFi = null;
    if (!(body as any).titleEn) body.titleEn = null;
    if (!(body as any).descFi) body.descFi = null;
    if (!(body as any).descEn) body.descEn = null;
    await fetch('/api/services', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    load();
    cancel();
  };

  const cancel = () => { setEditingId(null); setForm({ icon: 'Briefcase', title: '', titleFi: '', titleEn: '', desc: '', descFi: '', descEn: '' }); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">服务管理</h2>
        <button onClick={cancel} className="px-4 py-2 bg-[#00c3ff] text-black font-bold rounded-lg text-sm hover:bg-[#00c3ff]/80">+ 新增服务</button>
      </div>

      <div className="space-y-2 mb-6">
        {services.map(s => (
          <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-white font-medium">{s.title} <span className="text-gray-500 text-sm">({s.icon})</span></span>
            <button onClick={() => openEdit(s)} className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded hover:bg-white/20">编辑</button>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-bold text-white">{editingId ? '编辑服务' : '新增服务'}</h3>
        <div>
          <label className="block text-sm text-gray-400 mb-1">图标</label>
          <select value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]">
            {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">标题 (中文)</label>
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
        </div>
        <TranslatedFields label="标题翻译">
          {suffix => (
            <input value={(form as any)[`title${suffix}`] || ''} onChange={e => setForm({...form, [`title${suffix}`]: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
          )}
        </TranslatedFields>
        <div>
          <label className="block text-sm text-gray-400 mb-1">描述 (中文)</label>
          <textarea rows={3} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
        </div>
        <TranslatedFields label="描述翻译">
          {suffix => (
            <textarea rows={2} value={(form as any)[`desc${suffix}`] || ''} onChange={e => setForm({...form, [`desc${suffix}`]: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
          )}
        </TranslatedFields>
        <div className="flex gap-2 pt-2">
          <button onClick={save} className="px-6 py-2 bg-[#00c3ff] text-black font-bold rounded-lg text-sm hover:bg-[#00c3ff]/80">保存</button>
          <button onClick={cancel} className="px-6 py-2 bg-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/20">取消</button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import ImageUpload from './ImageUpload';
import TranslatedFields from './TranslatedFields';

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

export default function TeamManager() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [form, setForm] = useState({ name: '', role: '', roleFi: '', roleEn: '', desc: '', descFi: '', descEn: '', image: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = () => fetch('/api/team').then(r => r.json()).then(setMembers);

  const openEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setForm({ name: m.name, role: m.role, roleFi: m.roleFi || '', roleEn: m.roleEn || '', desc: m.desc, descFi: m.descFi || '', descEn: m.descEn || '', image: m.image || '' });
  };

  const save = async () => {
    const method = editingId ? 'PUT' : 'POST';
    const body: any = editingId ? { id: editingId, ...form } : form;
    if (!(body as any).roleFi) body.roleFi = null;
    if (!(body as any).roleEn) body.roleEn = null;
    if (!(body as any).descFi) body.descFi = null;
    if (!(body as any).descEn) body.descEn = null;
    await fetch('/api/team', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    load();
    cancel();
  };

  const remove = async (id: string) => {
    if (!confirm('确认删除？')) return;
    await fetch('/api/team', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const cancel = () => { setEditingId(null); setForm({ name: '', role: '', roleFi: '', roleEn: '', desc: '', descFi: '', descEn: '', image: '' }); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">团队成员管理</h2>
        <button onClick={cancel} className="px-4 py-2 bg-[#00c3ff] text-black font-bold rounded-lg text-sm hover:bg-[#00c3ff]/80">+ 新增成员</button>
      </div>

      <div className="space-y-2 mb-6">
        {members.map(m => (
          <div key={m.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
            <span className="text-white font-medium">{m.name} <span className="text-gray-500 text-sm">({m.role})</span></span>
            <div className="flex gap-2">
              <button onClick={() => openEdit(m)} className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded hover:bg-white/20">编辑</button>
              <button onClick={() => remove(m.id)} className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded hover:bg-red-500/20">删除</button>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-bold text-white">{editingId ? '编辑成员' : '新增成员'}</h3>
        <div>
          <label className="block text-sm text-gray-400 mb-1">姓名</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
        </div>
        <div>
          <label className="block text-sm text-gray-400 mb-1">职务 (中文)</label>
          <input value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
        </div>
        <TranslatedFields label="职务翻译">
          {suffix => (
            <input value={(form as any)[`role${suffix}`] || ''} onChange={e => setForm({...form, [`role${suffix}`]: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
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
        <ImageUpload value={form.image} onChange={url => setForm({...form, image: url})} label="头像" />
        <div className="flex gap-2 pt-2">
          <button onClick={save} className="px-6 py-2 bg-[#00c3ff] text-black font-bold rounded-lg text-sm hover:bg-[#00c3ff]/80">保存</button>
          <button onClick={cancel} className="px-6 py-2 bg-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/20">取消</button>
        </div>
      </div>
    </div>
  );
}

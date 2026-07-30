'use client';

import { useEffect, useState } from 'react';
import ImageUpload from './ImageUpload';
import FileUpload from './FileUpload';
import TranslatedFields from './TranslatedFields';

interface Program {
  id: string;
  slug: string;
  title: string;
  titleFi: string | null;
  titleEn: string | null;
  description: string;
  descriptionFi: string | null;
  descriptionEn: string | null;
  content: string;
  contentFi: string | null;
  contentEn: string | null;
  image: string | null;
  video: string | null;
  logo: string | null;
  featured: boolean;
}

export default function ProgramsManager() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [form, setForm] = useState({ slug: '', title: '', titleFi: '', titleEn: '', description: '', descriptionFi: '', descriptionEn: '', content: '', contentFi: '', contentEn: '', image: '', video: '', logo: '', featured: false });
  const [editing, setEditing] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = () => fetch('/api/programs').then(r => r.json()).then(setPrograms);

  const openEdit = (p: Program) => {
    setEditing(p.id);
    setForm({ slug: p.slug, title: p.title, titleFi: p.titleFi || '', titleEn: p.titleEn || '', description: p.description, descriptionFi: p.descriptionFi || '', descriptionEn: p.descriptionEn || '', content: p.content, contentFi: p.contentFi || '', contentEn: p.contentEn || '', image: p.image || '', video: p.video || '', logo: p.logo || '', featured: p.featured });
  };

  const save = async () => {
    const method = editing ? 'PUT' : 'POST';
    const body: any = editing ? { id: editing, ...form } : form;
    // Remove empty string translations
    if (!(body as any).titleFi) body.titleFi = null;
    if (!(body as any).titleEn) body.titleEn = null;
    if (!(body as any).descriptionFi) body.descriptionFi = null;
    if (!(body as any).descriptionEn) body.descriptionEn = null;
    if (!(body as any).contentFi) body.contentFi = null;
    if (!(body as any).contentEn) body.contentEn = null;
    await fetch('/api/programs', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    load();
    cancel();
  };

  const remove = async (id: string) => {
    if (!confirm('确认删除？')) return;
    await fetch('/api/programs', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const cancel = () => { setEditing(null); setForm({ slug: '', title: '', titleFi: '', titleEn: '', description: '', descriptionFi: '', descriptionEn: '', content: '', contentFi: '', contentEn: '', image: '', video: '', logo: '', featured: false }); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">核心项目管理</h2>
        <button onClick={cancel} className="px-4 py-2 bg-[#00c3ff] text-black font-bold rounded-lg text-sm hover:bg-[#00c3ff]/80">+ 新增项目</button>
      </div>

      <div className="space-y-2 mb-6">
        {programs.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
            <div>
              <span className="text-white font-medium">{p.title}</span>
              <span className="text-gray-500 text-sm ml-2">/{p.slug}</span>
              {p.featured && <span className="ml-2 px-2 py-0.5 bg-[#D9A05B]/20 text-[#D9A05B] text-xs rounded">精选</span>}
              <span className="text-gray-600 text-xs ml-2">
                {(p.titleEn || p.titleFi) ? `🌐` : `🇨🇳`}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(p)} className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded hover:bg-white/20">编辑</button>
              <button onClick={() => remove(p.id)} className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded hover:bg-red-500/20">删除</button>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-bold text-white">{editing ? '编辑项目' : '新增项目'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">URL 标识 (slug)</label>
            <input value={form.slug} onChange={e => setForm({...form, slug: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">标题 (中文)</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
          </div>
        </div>
        <TranslatedFields label="标题翻译">
          {suffix => (
            <input value={(form as any)[`title${suffix}`] || ''} onChange={e => setForm({...form, [`title${suffix}`]: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
          )}
        </TranslatedFields>
        <div>
          <label className="block text-sm text-gray-400 mb-1">简介 (中文)</label>
          <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
        </div>
        <TranslatedFields label="简介翻译">
          {suffix => (
            <textarea rows={2} value={(form as any)[`description${suffix}`] || ''} onChange={e => setForm({...form, [`description${suffix}`]: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
          )}
        </TranslatedFields>
        <div>
          <label className="block text-sm text-gray-400 mb-1">详细内容 (中文)</label>
          <textarea rows={5} value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
        </div>
        <TranslatedFields label="内容翻译">
          {suffix => (
            <textarea rows={3} value={(form as any)[`content${suffix}`] || ''} onChange={e => setForm({...form, [`content${suffix}`]: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
          )}
        </TranslatedFields>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ImageUpload value={form.logo} onChange={url => setForm({...form, logo: url})} label="Logo（可选，详情页标题旁显示）" />
          <ImageUpload value={form.image} onChange={url => setForm({...form, image: url})} label="封面图片" />
          <FileUpload value={form.video} onChange={url => setForm({...form, video: url})} label="视频文件" accept="video/*" allowUrl={true} />
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} className="rounded" />
          <span className="text-sm text-gray-400">设为精选</span>
        </label>
        <div className="flex gap-2 pt-2">
          <button onClick={save} className="px-6 py-2 bg-[#00c3ff] text-black font-bold rounded-lg text-sm hover:bg-[#00c3ff]/80">保存</button>
          <button onClick={cancel} className="px-6 py-2 bg-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/20">取消</button>
        </div>
      </div>
    </div>
  );
}

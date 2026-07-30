'use client';

import { useEffect, useState } from 'react';
import ImageUpload from './ImageUpload';
import FileUpload from './FileUpload';
import TranslatedFields from './TranslatedFields';

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

export default function ActivitiesManager() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [form, setForm] = useState({ date: '', title: '', titleFi: '', titleEn: '', desc: '', descFi: '', descEn: '', image: '', video: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = () => fetch('/api/activities').then(r => r.json()).then(setActivities);

  const openEdit = (a: Activity) => {
    setEditingId(a.id);
    setForm({ date: a.date, title: a.title, titleFi: a.titleFi || '', titleEn: a.titleEn || '', desc: a.desc, descFi: a.descFi || '', descEn: a.descEn || '', image: a.image || '', video: a.video || '' });
  };

  const save = async () => {
    const method = editingId ? 'PUT' : 'POST';
    const body: any = editingId ? { id: editingId, ...form } : form;
    if (!(body as any).titleFi) body.titleFi = null;
    if (!(body as any).titleEn) body.titleEn = null;
    if (!(body as any).descFi) body.descFi = null;
    if (!(body as any).descEn) body.descEn = null;
    await fetch('/api/activities', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    load();
    cancel();
  };

  const remove = async (id: string) => {
    if (!confirm('确认删除？')) return;
    await fetch('/api/activities', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const cancel = () => { setEditingId(null); setForm({ date: '', title: '', titleFi: '', titleEn: '', desc: '', descFi: '', descEn: '', image: '', video: '' }); };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">交流活动管理</h2>
        <button onClick={cancel} className="px-4 py-2 bg-[#00c3ff] text-black font-bold rounded-lg text-sm hover:bg-[#00c3ff]/80">+ 新增活动</button>
      </div>

      <div className="space-y-2 mb-6">
        {activities.map(a => (
          <div key={a.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
            <div>
              <span className="text-white font-medium">{a.title}</span>
              <span className="text-gray-500 text-sm ml-2">{a.date}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(a)} className="px-3 py-1 bg-white/10 text-gray-300 text-xs rounded hover:bg-white/20">编辑</button>
              <button onClick={() => remove(a.id)} className="px-3 py-1 bg-red-500/10 text-red-400 text-xs rounded hover:bg-red-500/20">删除</button>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-white/10 rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-bold text-white">{editingId ? '编辑活动' : '新增活动'}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-400 mb-1">日期</label>
            <input value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
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
          <label className="block text-sm text-gray-400 mb-1">描述 (中文)</label>
          <textarea rows={3} value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
        </div>
        <TranslatedFields label="描述翻译">
          {suffix => (
            <textarea rows={2} value={(form as any)[`desc${suffix}`] || ''} onChange={e => setForm({...form, [`desc${suffix}`]: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#001233] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
          )}
        </TranslatedFields>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ImageUpload value={form.image} onChange={url => setForm({...form, image: url})} label="活动图片" />
          <FileUpload value={form.video} onChange={url => setForm({...form, video: url})} label="活动视频" accept="video/*" />
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={save} className="px-6 py-2 bg-[#00c3ff] text-black font-bold rounded-lg text-sm hover:bg-[#00c3ff]/80">保存</button>
          <button onClick={cancel} className="px-6 py-2 bg-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/20">取消</button>
        </div>
      </div>
    </div>
  );
}

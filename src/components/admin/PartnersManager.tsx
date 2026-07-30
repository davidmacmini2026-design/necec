'use client';

import { useEffect, useState } from 'react';
import ImageUpload from './ImageUpload';
import FileUpload from './FileUpload';
import TranslatedFields from './TranslatedFields';

interface PartnerItem {
  id: string;
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
  categoryId: string;
  sortOrder: number;
}

interface PartnerCategory {
  id: string;
  category: string;
  title: string;
  titleFi: string | null;
  titleEn: string | null;
  items: PartnerItem[];
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

const defaultItemForm = {
  name: '', nameFi: '', nameEn: '',
  slug: '', description: '', descriptionFi: '', descriptionEn: '',
  content: '', contentFi: '', contentEn: '',
  logo: '', image: '', video: '', website: '',
  featured: false, categoryId: ''
};

export default function PartnersManager() {
  const [categories, setCategories] = useState<PartnerCategory[]>([]);
  const [catForm, setCatForm] = useState({ category: '', title: '', titleFi: '', titleEn: '' });
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [itemForm, setItemForm] = useState({ ...defaultItemForm });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [showItemForm, setShowItemForm] = useState(false);

  useEffect(() => { load(); }, []);

  const load = () => fetch('/api/partners').then(r => r.json()).then(setCategories);

  const saveCat = async () => {
    const method = editingCatId ? 'PUT' : 'POST';
    const body: any = editingCatId ? { id: editingCatId, ...catForm } : catForm;
    Object.keys(body).forEach(k => { if (!body[k] && k.endsWith('Fi')) body[k] = null; if (!body[k] && k.endsWith('En')) body[k] = null; });
    await fetch('/api/partners', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    load();
    cancelCat();
  };

  const removeCat = async (id: string) => {
    if (!confirm('删除分类会同时删除其中的所有合作伙伴！确认？')) return;
    await fetch('/api/partners', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const cancelCat = () => { setEditingCatId(null); setCatForm({ category: '', title: '', titleFi: '', titleEn: '' }); };

  const openEditCat = (c: PartnerCategory) => {
    setEditingCatId(c.id);
    setCatForm({ category: c.category, title: c.title, titleFi: c.titleFi || '', titleEn: c.titleEn || '' });
  };

  const openNewItem = (categoryId: string) => {
    setEditingItemId(null);
    setItemForm({ ...defaultItemForm, categoryId });
    setShowItemForm(true);
  };

  const openEditItem = (item: PartnerItem) => {
    setEditingItemId(item.id);
    setItemForm({
      name: item.name, nameFi: item.nameFi || '', nameEn: item.nameEn || '',
      slug: item.slug, description: item.description || '', descriptionFi: item.descriptionFi || '', descriptionEn: item.descriptionEn || '',
      content: item.content || '', contentFi: item.contentFi || '', contentEn: item.contentEn || '',
      logo: item.logo || '', image: item.image || '', video: item.video || '', website: item.website || '',
      featured: item.featured, categoryId: item.categoryId
    });
    setShowItemForm(true);
  };

  const saveItem = async () => {
    const method = editingItemId ? 'PUT' : 'POST';
    const body: any = editingItemId ? { id: editingItemId, ...itemForm } : itemForm;
    // Auto-generate slug from name if empty
    if (!body.slug) body.slug = slugify(body.name);
    Object.keys(body).forEach(k => {
      if (!body[k] && (k.endsWith('Fi') || k.endsWith('En'))) body[k] = null;
    });
    await fetch('/api/partners/items', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    load();
    cancelItem();
  };

  const removeItem = async (id: string) => {
    if (!confirm('确认删除？')) return;
    await fetch('/api/partners/items', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    load();
  };

  const cancelItem = () => { setEditingItemId(null); setShowItemForm(false); setItemForm({ ...defaultItemForm }); };

  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-4">合作网络管理</h2>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">分类</h3>
          <button onClick={cancelCat} className="px-3 py-1 bg-[#00c3ff] text-black font-bold rounded text-xs hover:bg-[#00c3ff]/80">+ 新增分类</button>
        </div>

        <div className="space-y-2 mb-4">
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
              <div>
                <span className="text-white font-medium">{c.title}</span>
                <span className="text-gray-500 text-sm ml-2">({c.items?.length || 0} 个伙伴)</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openNewItem(c.id)} className="px-2 py-1 bg-[#00c3ff]/20 text-[#00c3ff] text-xs rounded hover:bg-[#00c3ff]/30">+ 伙伴</button>
                <button onClick={() => openEditCat(c)} className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded hover:bg-white/20">编辑</button>
                <button onClick={() => removeCat(c.id)} className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded hover:bg-red-500/20">删除</button>
              </div>
            </div>
          ))}
        </div>

        {(catForm.category || catForm.title || editingCatId) ? (
          <div className="border border-white/10 rounded-xl p-4 space-y-2 mb-4">
            <h4 className="font-bold text-white text-sm">{editingCatId ? '编辑分类' : '新增分类'}</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">标识 (英文)</label>
                <input value={catForm.category} onChange={e => setCatForm({...catForm, category: e.target.value})} className="w-full px-2 py-1.5 rounded bg-[#001233] border border-white/10 text-white text-xs outline-none focus:border-[#00c3ff]" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">显示标题 (中文)</label>
                <input value={catForm.title} onChange={e => setCatForm({...catForm, title: e.target.value})} className="w-full px-2 py-1.5 rounded bg-[#001233] border border-white/10 text-white text-xs outline-none focus:border-[#00c3ff]" />
              </div>
            </div>
            <TranslatedFields label="标题翻译">
              {suffix => (
                <input value={(catForm as any)[`title${suffix}`] || ''} onChange={e => setCatForm({...catForm, [`title${suffix}`]: e.target.value})} className="w-full px-2 py-1.5 rounded bg-[#001233] border border-white/10 text-white text-xs outline-none focus:border-[#00c3ff]" />
              )}
            </TranslatedFields>
            <div className="flex gap-2">
              <button onClick={saveCat} className="px-4 py-1.5 bg-[#00c3ff] text-black font-bold rounded text-xs hover:bg-[#00c3ff]/80">保存</button>
              <button onClick={cancelCat} className="px-4 py-1.5 bg-white/10 text-gray-300 rounded text-xs hover:bg-white/20">取消</button>
            </div>
          </div>
        ) : null}

        {categories.map(c => (
          <div key={c.id} className="ml-4 mb-4 border-l-2 border-white/10 pl-4">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">{c.title} 的合作伙伴</h4>
            <div className="space-y-1">
              {c.items?.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-white/5 rounded text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-300">{item.name}</span>
                    {item.featured && <span className="px-1.5 py-0.5 bg-[#D9A05B]/20 text-[#D9A05B] text-[10px] rounded">精选</span>}
                    <span className="text-gray-600 text-[10px]">/{item.slug}</span>
                    {item.image && <span className="text-[10px]">🖼️</span>}
                    {item.video && <span className="text-[10px]">🎬</span>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEditItem(item)} className="px-2 py-0.5 bg-white/10 text-gray-400 text-xs rounded hover:bg-white/20">编辑</button>
                    <button onClick={() => removeItem(item.id)} className="px-2 py-0.5 bg-red-500/10 text-red-400 text-xs rounded hover:bg-red-500/20">删除</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showItemForm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-[#001233] border border-white/10 rounded-2xl p-6 w-full max-w-2xl mx-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white">{editingItemId ? '编辑合作伙伴' : '新增合作伙伴'}</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-400 mb-1">名称 (中文) *</label>
                <input value={itemForm.name} onChange={e => setItemForm({...itemForm, name: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#000a1a] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">URL 标识 (slug)</label>
                <input value={itemForm.slug} onChange={e => setItemForm({...itemForm, slug: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#000a1a] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" placeholder="留空自动生成" />
              </div>
            </div>

            <TranslatedFields label="名称翻译">
              {suffix => (
                <input value={(itemForm as any)[`name${suffix}`] || ''} onChange={e => setItemForm({...itemForm, [`name${suffix}`]: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#000a1a] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
              )}
            </TranslatedFields>

            <div>
              <label className="block text-sm text-gray-400 mb-1">简介 (中文)</label>
              <textarea rows={2} value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#000a1a] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
            </div>

            <TranslatedFields label="简介翻译">
              {suffix => (
                <textarea rows={2} value={(itemForm as any)[`description${suffix}`] || ''} onChange={e => setItemForm({...itemForm, [`description${suffix}`]: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#000a1a] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
              )}
            </TranslatedFields>

            <div>
              <label className="block text-sm text-gray-400 mb-1">详细内容 (中文)</label>
              <textarea rows={4} value={itemForm.content} onChange={e => setItemForm({...itemForm, content: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#000a1a] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
            </div>

            <TranslatedFields label="内容翻译">
              {suffix => (
                <textarea rows={2} value={(itemForm as any)[`content${suffix}`] || ''} onChange={e => setItemForm({...itemForm, [`content${suffix}`]: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#000a1a] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" />
              )}
            </TranslatedFields>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ImageUpload value={itemForm.logo} onChange={url => setItemForm({...itemForm, logo: url})} label="Logo 图标" />
              <ImageUpload value={itemForm.image} onChange={url => setItemForm({...itemForm, image: url})} label="封面图片" />
              <FileUpload value={itemForm.video} onChange={url => setItemForm({...itemForm, video: url})} label="视频（支持 YouTube/B站链接或上传）" accept="video/*" allowUrl={true} />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">官网链接</label>
              <input value={itemForm.website} onChange={e => setItemForm({...itemForm, website: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[#000a1a] border border-white/10 text-white text-sm outline-none focus:border-[#00c3ff]" placeholder="https://" />
            </div>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={itemForm.featured} onChange={e => setItemForm({...itemForm, featured: e.target.checked})} className="rounded" />
              <span className="text-sm text-gray-400">设为精选</span>
            </label>

            <div className="flex gap-2 pt-2">
              <button onClick={saveItem} className="px-6 py-2 bg-[#00c3ff] text-black font-bold rounded-lg text-sm hover:bg-[#00c3ff]/80">保存</button>
              <button onClick={cancelItem} className="px-6 py-2 bg-white/10 text-gray-300 rounded-lg text-sm hover:bg-white/20">取消</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

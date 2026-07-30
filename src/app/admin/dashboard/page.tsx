'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import SiteForm from '@/components/admin/SiteForm';
import ProgramsManager from '@/components/admin/ProgramsManager';
import TeamManager from '@/components/admin/TeamManager';
import ActivitiesManager from '@/components/admin/ActivitiesManager';
import ServicesManager from '@/components/admin/ServicesManager';
import PartnersManager from '@/components/admin/PartnersManager';

type Tab = 'site' | 'programs' | 'team' | 'activities' | 'services' | 'partners';

const tabs: { key: Tab; label: string }[] = [
  { key: 'site', label: '站点设置' },
  { key: 'programs', label: '核心项目' },
  { key: 'team', label: '团队成员' },
  { key: 'activities', label: '交流活动' },
  { key: 'services', label: '服务使命' },
  { key: 'partners', label: '合作网络' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('site');
  const [loading, setLoading] = useState(true);
  const [translating, setTranslating] = useState(false);
  const [translateResult, setTranslateResult] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/check')
      .then(r => { if (!r.ok) router.push('/admin/login'); })
      .finally(() => setLoading(false));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleAutoTranslate = async () => {
    if (!confirm('将为所有现有内容自动翻译成芬兰语和英语。\n\n⚠ 仅填补空白字段（已有翻译不会被覆盖）。\n\n继续？')) return;
    setTranslating(true);
    setTranslateResult(null);
    try {
      const res = await fetch('/api/admin/translate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setTranslateResult(`✅ ${data.message}`);
      } else {
        setTranslateResult(`❌ ${data.error}`);
      }
    } catch (e: any) {
      setTranslateResult(`❌ 请求失败: ${e.message}`);
    } finally {
      setTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000a1a] flex items-center justify-center text-gray-400">
        加载中...
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">管理后台</h1>
          <p className="text-gray-400 mt-1">NECEC 北欧经济文化中心</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-white/10 hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded-lg transition-colors text-sm"
        >
          退出登录
        </button>
      </div>

      {/* Auto Translate Banner */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-[#004A99]/20 to-[#00c3ff]/10 border border-[#00c3ff]/20 rounded-xl">
        <div>
          <span className="text-white font-medium">🌐 自动翻译</span>
          <span className="text-gray-400 text-sm ml-2">一键将全部内容翻译为芬兰语（Suomi）和英语（English），仅填补空白字段</span>
        </div>
        <button
          onClick={handleAutoTranslate}
          disabled={translating}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
            translating
              ? 'bg-white/10 text-gray-500 cursor-wait'
              : 'bg-[#00c3ff] text-black hover:bg-white hover:text-black'
          }`}
        >
          {translating ? '⏳ 翻译中...' : '🚀 一键翻译全部内容'}
        </button>
      </div>
      {translateResult && (
        <div className={`mb-6 p-3 rounded-lg text-sm ${translateResult.startsWith('✅') ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {translateResult}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key
                ? 'bg-[#00c3ff] text-black'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        {tab === 'site' && <SiteForm />}
        {tab === 'programs' && <ProgramsManager />}
        {tab === 'team' && <TeamManager />}
        {tab === 'activities' && <ActivitiesManager />}
        {tab === 'services' && <ServicesManager />}
        {tab === 'partners' && <PartnersManager />}
      </div>
    </AdminLayout>
  );
}

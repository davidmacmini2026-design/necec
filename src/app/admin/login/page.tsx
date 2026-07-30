'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push('/admin/dashboard');
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000a1a]">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8 bg-white/5 border border-white/10 rounded-2xl">
        <h1 className="text-2xl font-bold text-white text-center mb-8">NECEC 管理后台</h1>
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mb-4">
            {error}
          </div>
        )}
        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-2">用户名</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#001233] border border-white/10 text-white outline-none focus:border-[#00c3ff]"
            placeholder="admin"
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">密码</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#001233] border border-white/10 text-white outline-none focus:border-[#00c3ff]"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-[#00c3ff] hover:bg-[#00c3ff]/80 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
}

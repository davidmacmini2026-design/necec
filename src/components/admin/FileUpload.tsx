'use client';

import { useState, useRef } from 'react';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  allowUrl?: boolean; // 是否允许直接粘贴 URL（如 YouTube/B站链接）
}

export default function FileUpload({ value, onChange, label = '文件', accept = '*/*', allowUrl = false }: Props) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      onChange(data.url);
    } catch (err) {
      alert('上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-[#00c3ff]/20 text-[#00c3ff] rounded-lg text-sm hover:bg-[#00c3ff]/30 transition-colors disabled:opacity-50"
        >
          {uploading ? '上传中...' : value ? '更换文件' : '选择文件'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleUpload}
          className="hidden"
        />
        {value && (
          <span className="text-xs text-gray-500 truncate max-w-[180px]">{value}</span>
        )}
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-xs text-red-400 hover:text-red-300">清除</button>
        )}
      </div>
      {allowUrl && (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="或粘贴 YouTube / B站视频链接"
          className="mt-2 w-full px-3 py-2 rounded-lg bg-[#000a1a] border border-white/10 text-white text-xs outline-none focus:border-[#00c3ff]"
        />
      )}
    </div>
  );
}

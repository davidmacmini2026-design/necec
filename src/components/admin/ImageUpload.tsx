'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = '图片' }: Props) {
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
      <div className="flex items-center gap-3">
        {value ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10 bg-[#001233] shrink-0">
            <Image src={value} alt="Preview" fill className="object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg border border-dashed border-white/20 bg-[#001233] flex items-center justify-center text-gray-600 text-xs shrink-0">
            无图片
          </div>
        )}
        <div className="flex-1 space-y-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-[#00c3ff]/20 text-[#00c3ff] rounded-lg text-sm hover:bg-[#00c3ff]/30 transition-colors disabled:opacity-50"
          >
            {uploading ? '上传中...' : '选择图片'}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="ml-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-colors"
            >
              清除
            </button>
          )}
          {value && (
            <div className="text-xs text-gray-500 truncate max-w-[200px]" title={value}>
              {value}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

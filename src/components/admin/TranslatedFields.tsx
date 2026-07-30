'use client';

import { useState } from 'react';

interface Props {
  label: string;
  children: (suffix: string) => React.ReactNode;
  fields?: Array<{ lang: string; label: string; suffix: string }>;
}

const defaultFields = [
  { lang: 'fi', label: '芬兰语', suffix: 'Fi' },
  { lang: 'en', label: '英语', suffix: 'En' },
];

export default function TranslatedFields({ label, children, fields = defaultFields }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <span>{open ? '▼' : '▶'} {label}</span>
          <span className="text-xs text-gray-600">{fields.map(f => f.label).join(' / ')}</span>
        </button>
        {open && (
          <div className="px-3 pb-3 space-y-2 border-t border-white/5 pt-3">
            {fields.map(f => (
              <div key={f.suffix}>
                <label className="block text-xs text-gray-500 mb-1">{f.label} ({f.lang})</label>
                {children(f.suffix)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import { LangProvider } from '@/i18n';
import type { Lang } from '@/i18n';

export function LangProviderWrapper({ children, initialLang }: { children: React.ReactNode; initialLang?: Lang }) {
  return <LangProvider initialLang={initialLang}>{children}</LangProvider>;
}

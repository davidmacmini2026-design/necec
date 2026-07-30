import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Contact | NECEC',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}

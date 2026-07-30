import { prisma } from '@/lib/db';
import PartnerDetailClient from './PartnerDetailClient';
import { notFound } from 'next/navigation';

export default async function PartnerDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const partner = await prisma.partnerItem.findUnique({ where: { slug }, include: { category: true } });
  if (!partner) notFound();
  return <PartnerDetailClient partner={JSON.parse(JSON.stringify(partner))} />;
}

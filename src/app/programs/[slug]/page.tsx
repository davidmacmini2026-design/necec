import { getProgramBySlug, getPrograms } from '@/lib/data';
import ProgramDetailClient from './ProgramDetailClient';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((p) => ({ slug: p.slug }));
}

export default async function ProgramDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);
  return <ProgramDetailClient program={program} slug={slug} />;
}

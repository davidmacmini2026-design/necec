import { getPrograms, getPartners } from '@/lib/data';
import HomeClient from './HomeClient';
import { getSiteConfig } from '@/lib/data';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const programs = await getPrograms();
  const partners = await getPartners();
  const site = await getSiteConfig();
  return <HomeClient programs={programs} partners={partners} heroVideo={site?.heroVideo || '/videos/hero-bg.mp4'} />;
}

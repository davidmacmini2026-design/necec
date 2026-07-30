import { getTeamMembers } from '@/lib/data';
import AboutClient from './AboutClient';

export const dynamic = 'force-dynamic';

export default async function AboutPage() {
  const team = await getTeamMembers();
  return <AboutClient team={team} />;
}

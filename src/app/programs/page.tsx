import { getPrograms } from '@/lib/data';
import ProgramsClient from './ProgramsClient';

export const dynamic = 'force-dynamic';

export default async function ProgramsPage() {
  const programs = await getPrograms();
  return <ProgramsClient programs={programs} />;
}

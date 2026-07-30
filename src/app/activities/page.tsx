import { getActivities } from '@/lib/data';
import ActivitiesClient from './ActivitiesClient';

export const dynamic = 'force-dynamic';

export default async function ActivitiesPage() {
  const activities = await getActivities();
  return <ActivitiesClient activities={activities} />;
}

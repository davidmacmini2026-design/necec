import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, apiSuccess, apiError } from '@/lib/api-utils';

export async function GET() {
  const activities = await prisma.activity.findMany({ orderBy: { sortOrder: 'asc' } });
  return apiSuccess(activities);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const body = await req.json();
  const activity = await prisma.activity.create({ data: body });
  return apiSuccess(activity);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const { id, ...data } = await req.json();
  if (!id) return apiError('ID required');
  const activity = await prisma.activity.update({ where: { id }, data });
  return apiSuccess(activity);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const { id } = await req.json();
  if (!id) return apiError('ID required');
  await prisma.activity.delete({ where: { id } });
  return apiSuccess({ success: true });
}

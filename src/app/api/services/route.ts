import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, apiSuccess, apiError } from '@/lib/api-utils';

export async function GET() {
  const services = await prisma.service.findMany({ orderBy: { sortOrder: 'asc' } });
  return apiSuccess(services);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const { id, ...data } = await req.json();
  if (!id) return apiError('ID required');
  const service = await prisma.service.update({ where: { id }, data });
  return apiSuccess(service);
}

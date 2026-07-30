import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, apiSuccess, apiError } from '@/lib/api-utils';

export async function GET() {
  const categories = await prisma.partnerCategory.findMany({
    include: { items: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  });
  return apiSuccess(categories);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const body = await req.json();
  const category = await prisma.partnerCategory.create({
    data: { category: body.category, title: body.title },
  });
  return apiSuccess(category);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const { id, ...data } = await req.json();
  if (!id) return apiError('ID required');
  const category = await prisma.partnerCategory.update({ where: { id }, data });
  return apiSuccess(category);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const { id } = await req.json();
  if (!id) return apiError('ID required');
  await prisma.partnerCategory.delete({ where: { id } });
  return apiSuccess({ success: true });
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, apiSuccess, apiError } from '@/lib/api-utils';

// GET single partner item by slug
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  if (slug) {
    const item = await prisma.partnerItem.findUnique({ where: { slug }, include: { category: true } });
    if (!item) return apiError('Not found', 404);
    return apiSuccess(item);
  }
  return apiError('slug required', 400);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const body = await req.json();
  const item = await prisma.partnerItem.create({ data: body });
  return apiSuccess(item);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const { id, ...data } = await req.json();
  if (!id) return apiError('ID required');
  const item = await prisma.partnerItem.update({ where: { id }, data });
  return apiSuccess(item);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const { id } = await req.json();
  if (!id) return apiError('ID required');
  await prisma.partnerItem.delete({ where: { id } });
  return apiSuccess({ success: true });
}

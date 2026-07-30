import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, apiSuccess, apiError } from '@/lib/api-utils';

export async function GET() {
  const members = await prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } });
  return apiSuccess(members);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const body = await req.json();
  const member = await prisma.teamMember.create({ data: body });
  return apiSuccess(member);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const { id, ...data } = await req.json();
  if (!id) return apiError('ID required');
  const member = await prisma.teamMember.update({ where: { id }, data });
  return apiSuccess(member);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const { id } = await req.json();
  if (!id) return apiError('ID required');
  await prisma.teamMember.delete({ where: { id } });
  return apiSuccess({ success: true });
}

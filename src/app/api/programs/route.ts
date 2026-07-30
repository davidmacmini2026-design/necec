import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, apiSuccess, apiError } from '@/lib/api-utils';

export async function GET() {
  const programs = await prisma.program.findMany({ orderBy: { sortOrder: 'asc' } });
  return apiSuccess(programs);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const body = await req.json();
  const program = await prisma.program.create({ data: body });
  return apiSuccess(program);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const { id, ...data } = await req.json();
  if (!id) return apiError('ID required');
  const program = await prisma.program.update({ where: { id }, data });
  return apiSuccess(program);
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;
  const { id } = await req.json();
  if (!id) return apiError('ID required');
  await prisma.program.delete({ where: { id } });
  return apiSuccess({ success: true });
}

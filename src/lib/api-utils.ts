import { NextResponse } from 'next/server';
import { getSession } from './auth';

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return session;
}

export function apiSuccess(data: any) {
  return NextResponse.json(data);
}

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

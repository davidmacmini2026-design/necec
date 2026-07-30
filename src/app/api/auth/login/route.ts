import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { createToken, setSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: '请输入用户名和密码' }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { username } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: '用户名或密码错误' }, { status: 401 });
  }

  const token = await createToken(username);
  await setSession(token);

  return NextResponse.json({ success: true });
}

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireAuth, apiSuccess, apiError } from '@/lib/api-utils';

export async function GET() {
  const site = await prisma.siteConfig.findFirst({ where: { id: 'main' } });
  if (!site) return apiError('Site config not found', 404);

  // Return full flat fields (for admin form) + nested contact (for frontend)
  const response = {
    ...site,
    contact: {
      email: site.contactEmail,
      wechat: site.contactWechat,
      location: site.contactLocation,
      phone: site.contactPhone || '',
    },
  };
  return apiSuccess(response);
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (!('username' in auth)) return auth;

  const body = await req.json();
  const site = await prisma.siteConfig.update({
    where: { id: 'main' },
    data: body,
  });
  return apiSuccess(site);
}

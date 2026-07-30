import { prisma } from '@/lib/db';

export async function getSiteConfig() {
  return prisma.siteConfig.findFirst({ where: { id: 'main' } });
}

export async function getPrograms() {
  return prisma.program.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function getPartners() {
  return prisma.partnerCategory.findMany({
    include: { items: { orderBy: { sortOrder: 'asc' } } },
    orderBy: { sortOrder: 'asc' },
  });
}

export async function getServices() {
  return prisma.service.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function getTeamMembers() {
  return prisma.teamMember.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function getActivities() {
  return prisma.activity.findMany({ orderBy: { sortOrder: 'asc' } });
}

export async function getProgramBySlug(slug: string) {
  return prisma.program.findUnique({ where: { slug } });
}

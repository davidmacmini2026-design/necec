import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import siteData from '../src/data/site.json';
import programsData from '../src/data/programs.json';
import partnersData from '../src/data/partners.json';
import servicesData from '../src/data/services.json';
import teamData from '../src/data/team.json';
import activitiesData from '../src/data/activities.json';

const prisma = new PrismaClient();

async function main() {
  // Admin
  const passwordHash = await bcrypt.hash('necec2026', 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: { password: passwordHash },
    create: { username: 'admin', password: passwordHash },
  });
  console.log('✅ Admin user created');

  // Site Config
  await prisma.siteConfig.upsert({
    where: { id: 'main' },
    update: {
      name: siteData.name,
      nameEn: siteData.name_en,
      nameFi: 'Nordic Economic and Culture Exchange Center',
      shortName: siteData.short_name,
      description: siteData.description,
      descriptionEn: 'Connecting China and the Nordic region in economy, culture, education, technology, and urban cooperation.',
      descriptionFi: 'Yhdistämme Kiinan ja Pohjoismaat talouden, kulttuurin, koulutuksen, teknologian ja kaupunkikehityksen aloilla.',
      contactEmail: siteData.contact.email,
      contactWechat: siteData.contact.wechat,
      contactLocation: siteData.contact.location,
      heroVideo: '/videos/hero-bg.mp4',
    },
    create: {
      id: 'main',
      name: siteData.name,
      nameEn: siteData.name_en,
      nameFi: 'Nordic Economic and Culture Exchange Center',
      shortName: siteData.short_name,
      description: siteData.description,
      descriptionEn: 'Connecting China and the Nordic region in economy, culture, education, technology, and urban cooperation.',
      descriptionFi: 'Yhdistämme Kiinan ja Pohjoismaat talouden, kulttuurin, koulutuksen, teknologian ja kaupunkikehityksen aloilla.',
      contactEmail: siteData.contact.email,
      contactWechat: siteData.contact.wechat,
      contactLocation: siteData.contact.location,
      heroVideo: '/videos/hero-bg.mp4',
    },
  });
  console.log('✅ Site config seeded');

  // Programs (with placeholder translations)
  for (const [idx, p] of (programsData as any[]).entries()) {
    await prisma.program.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        titleEn: null,
        titleFi: null,
        description: p.description,
        descriptionEn: null,
        descriptionFi: null,
        content: p.content,
        contentEn: null,
        contentFi: null,
        image: p.image || null,
        video: p.video || null,
        featured: p.featured || false,
        sortOrder: idx,
      },
      create: {
        slug: p.slug,
        title: p.title,
        titleEn: null,
        titleFi: null,
        description: p.description,
        descriptionEn: null,
        descriptionFi: null,
        content: p.content,
        contentEn: null,
        contentFi: null,
        image: p.image || null,
        video: p.video || null,
        featured: p.featured || false,
        sortOrder: idx,
      },
    });
  }
  console.log('✅ Programs seeded');

  // Partners
  for (const [catIdx, cat] of (partnersData as any[]).entries()) {
    const category = await prisma.partnerCategory.upsert({
      where: { id: `cat-${catIdx}` },
      update: {
        category: cat.category,
        title: cat.title,
        titleEn: null,
        titleFi: null,
        sortOrder: catIdx,
      },
      create: {
        id: `cat-${catIdx}`,
        category: cat.category,
        title: cat.title,
        titleEn: null,
        titleFi: null,
        sortOrder: catIdx,
      },
    });

    for (const [itemIdx, item] of (cat.items || []).entries()) {
      const itemSlug = item.slug || item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      await prisma.partnerItem.upsert({
        where: { id: `item-${catIdx}-${itemIdx}` },
        update: {
          name: item.name,
          nameEn: null,
          nameFi: null,
          slug: itemSlug,
          description: '',
          content: '',
          logo: item.logo || null,
          categoryId: category.id,
          sortOrder: itemIdx,
        },
        create: {
          id: `item-${catIdx}-${itemIdx}`,
          name: item.name,
          nameEn: null,
          nameFi: null,
          slug: itemSlug,
          description: '',
          content: '',
          logo: item.logo || null,
          categoryId: category.id,
          sortOrder: itemIdx,
        },
      });
    }
  }
  console.log('✅ Partners seeded');

  // Services
  for (const [idx, s] of servicesData.entries()) {
    await prisma.service.upsert({
      where: { id: `svc-${idx}` },
      update: {
        icon: s.icon,
        title: s.title,
        titleEn: null,
        titleFi: null,
        desc: s.desc,
        descEn: null,
        descFi: null,
        sortOrder: idx,
      },
      create: {
        id: `svc-${idx}`,
        icon: s.icon,
        title: s.title,
        titleEn: null,
        titleFi: null,
        desc: s.desc,
        descEn: null,
        descFi: null,
        sortOrder: idx,
      },
    });
  }
  console.log('✅ Services seeded');

  // Team
  for (const [idx, m] of teamData.entries()) {
    await prisma.teamMember.upsert({
      where: { id: `team-${idx}` },
      update: {
        name: m.name,
        role: m.role,
        roleEn: null,
        roleFi: null,
        desc: m.desc,
        descEn: null,
        descFi: null,
        image: m.image || null,
        sortOrder: idx,
      },
      create: {
        id: `team-${idx}`,
        name: m.name,
        role: m.role,
        roleEn: null,
        roleFi: null,
        desc: m.desc,
        descEn: null,
        descFi: null,
        image: m.image || null,
        sortOrder: idx,
      },
    });
  }
  console.log('✅ Team seeded');

  // Activities
  for (const [idx, a] of activitiesData.entries()) {
    await prisma.activity.upsert({
      where: { id: `act-${idx}` },
      update: {
        date: a.date,
        title: a.title,
        titleEn: null,
        titleFi: null,
        desc: a.desc,
        descEn: null,
        descFi: null,
        image: a.image || null,
        video: a.video || null,
        sortOrder: idx,
      },
      create: {
        id: `act-${idx}`,
        date: a.date,
        title: a.title,
        titleEn: null,
        titleFi: null,
        desc: a.desc,
        descEn: null,
        descFi: null,
        image: a.image || null,
        video: a.video || null,
        sortOrder: idx,
      },
    });
  }
  console.log('✅ Activities seeded');

  console.log('\n🎉 Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

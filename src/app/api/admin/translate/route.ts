import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Simple translation function using MyMemory (free, no API key needed)
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return '';
  
  try {
    const params = new URLSearchParams({
      q: text,
      langpair: `zh|${targetLang}`,
    });
    
    const res = await fetch(`https://api.mymemory.translated.net/get?${params}`, {
      signal: AbortSignal.timeout(10000),
    });
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    if (data.responseStatus === 200 || data.responseStatus === 403) {
      return data.responseData?.translatedText || text;
    }
    throw new Error(data.responseStatus);
  } catch (err) {
    console.error(`Translate error (zh→${targetLang}):`, err);
    return text; // fallback to original
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: string[] = [];
  let totalTranslated = 0;

  try {
    // 1. Translate Programs
    const programs = await prisma.program.findMany();
    for (const p of programs) {
      const updates: any = {};

      if (p.title && !p.titleFi) {
        updates.titleFi = await translateText(p.title, 'fi');
        totalTranslated++;
      }
      if (p.title && !p.titleEn) {
        updates.titleEn = await translateText(p.title, 'en');
        totalTranslated++;
      }
      if (p.description && !p.descriptionFi) {
        updates.descriptionFi = await translateText(p.description, 'fi');
        totalTranslated++;
      }
      if (p.description && !p.descriptionEn) {
        updates.descriptionEn = await translateText(p.description, 'en');
        totalTranslated++;
      }
      if (p.content && !p.contentFi) {
        updates.contentFi = await translateText(p.content, 'fi');
        totalTranslated++;
      }
      if (p.content && !p.contentEn) {
        updates.contentEn = await translateText(p.content, 'en');
        totalTranslated++;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.program.update({ where: { id: p.id }, data: updates });
        results.push(`✅ Program: ${p.title} → fi/en`);
      }
    }

    // 2. Translate Services
    const services = await prisma.service.findMany();
    for (const s of services) {
      const updates: any = {};

      if (s.title && !s.titleFi) {
        updates.titleFi = await translateText(s.title, 'fi');
        totalTranslated++;
      }
      if (s.title && !s.titleEn) {
        updates.titleEn = await translateText(s.title, 'en');
        totalTranslated++;
      }
      if (s.desc && !s.descFi) {
        updates.descFi = await translateText(s.desc, 'fi');
        totalTranslated++;
      }
      if (s.desc && !s.descEn) {
        updates.descEn = await translateText(s.desc, 'en');
        totalTranslated++;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.service.update({ where: { id: s.id }, data: updates });
        results.push(`✅ Service: ${s.title} → fi/en`);
      }
    }

    // 3. Translate Activities
    const activities = await prisma.activity.findMany();
    for (const a of activities) {
      const updates: any = {};

      if (a.title && !a.titleFi) {
        updates.titleFi = await translateText(a.title, 'fi');
        totalTranslated++;
      }
      if (a.title && !a.titleEn) {
        updates.titleEn = await translateText(a.title, 'en');
        totalTranslated++;
      }
      if (a.desc && !a.descFi) {
        updates.descFi = await translateText(a.desc, 'fi');
        totalTranslated++;
      }
      if (a.desc && !a.descEn) {
        updates.descEn = await translateText(a.desc, 'en');
        totalTranslated++;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.activity.update({ where: { id: a.id }, data: updates });
        results.push(`✅ Activity: ${a.title} → fi/en`);
      }
    }

    // 4. Translate Team Members
    const team = await prisma.teamMember.findMany();
    for (const m of team) {
      const updates: any = {};

      if (m.role && !m.roleFi) {
        updates.roleFi = await translateText(m.role, 'fi');
        totalTranslated++;
      }
      if (m.role && !m.roleEn) {
        updates.roleEn = await translateText(m.role, 'en');
        totalTranslated++;
      }
      if (m.desc && !m.descFi) {
        updates.descFi = await translateText(m.desc, 'fi');
        totalTranslated++;
      }
      if (m.desc && !m.descEn) {
        updates.descEn = await translateText(m.desc, 'en');
        totalTranslated++;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.teamMember.update({ where: { id: m.id }, data: updates });
        results.push(`✅ Team: ${m.name} → fi/en`);
      }
    }

    // 5. Translate Partner Categories
    const categories = await prisma.partnerCategory.findMany();
    for (const c of categories) {
      const updates: any = {};
      if (c.title && !c.titleFi) {
        updates.titleFi = await translateText(c.title, 'fi');
        totalTranslated++;
      }
      if (c.title && !c.titleEn) {
        updates.titleEn = await translateText(c.title, 'en');
        totalTranslated++;
      }
      if (Object.keys(updates).length > 0) {
        await prisma.partnerCategory.update({ where: { id: c.id }, data: updates });
        results.push(`✅ Partner Category: ${c.title} → fi/en`);
      }
    }

    // 6. Translate Partner Items
    const items = await prisma.partnerItem.findMany();
    for (const i of items) {
      const updates: any = {};
      if (i.name && !i.nameFi) {
        updates.nameFi = await translateText(i.name, 'fi');
        totalTranslated++;
      }
      if (i.name && !i.nameEn) {
        updates.nameEn = await translateText(i.name, 'en');
        totalTranslated++;
      }
      if (Object.keys(updates).length > 0) {
        await prisma.partnerItem.update({ where: { id: i.id }, data: updates });
        results.push(`✅ Partner: ${i.name} → fi/en`);
      }
    }

    // 7. Translate Site Config
    const site = await prisma.siteConfig.findFirst();
    if (site) {
      const updates: any = {};
      if (site.description && !site.descriptionFi) {
        updates.descriptionFi = await translateText(site.description, 'fi');
        totalTranslated++;
      }
      if (site.description && !site.descriptionEn) {
        updates.descriptionEn = await translateText(site.description, 'en');
        totalTranslated++;
      }
      if (Object.keys(updates).length > 0) {
        await prisma.siteConfig.update({ where: { id: site.id }, data: updates });
        results.push(`✅ Site description → fi/en`);
      }
    }

    return NextResponse.json({
      success: true,
      totalTranslated,
      message: `翻译完成！共翻译 ${totalTranslated} 个字段。`,
      details: results,
    });
  } catch (err: any) {
    console.error('Translation error:', err);
    return NextResponse.json(
      { error: '翻译失败', details: err.message },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_BASE = 'https://api.deepseek.com/v1';

// 检测文本是否包含中文
function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

// DeepSeek 翻译
async function translateWithDeepSeek(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return '';
  if (!containsChinese(text.trim())) return text;
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY not configured');

  const langNames: Record<string, string> = { fi: 'Finnish', en: 'English' };
  const langName = langNames[targetLang] || targetLang;

  const res = await fetch(`${DEEPSEEK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following Chinese text into ${langName}. 
Rules:
- Preserve all formatting, line breaks, and special characters like 【】· → 
- Do NOT add any explanations, notes, or markdown wrappers
- Output ONLY the translated text, nothing else
- Keep proper nouns (names, brands, places) in their original form or use appropriate transliteration
- If the input contains markdown or HTML, preserve the structure
- Never leave Chinese characters in the output`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(60000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const translated = data.choices?.[0]?.message?.content?.trim();

  if (!translated) throw new Error('Empty translation response');
  if (containsChinese(translated) && containsChinese(text)) {
    throw new Error('Translation still contains Chinese characters');
  }

  return translated;
}

// 翻译文本（带重试）
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return '';
  if (!containsChinese(text.trim())) return text;

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await translateWithDeepSeek(text, targetLang);
    } catch (err: any) {
      lastErr = err;
      if (attempt < 2) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1))); // 退避重试
      }
    }
  }
  throw lastErr || new Error('Translation failed after 3 attempts');
}

// 检查翻译是否有效（不是中文）
function isValidTranslation(original: string, translated: string): boolean {
  if (!translated || !translated.trim()) return false;
  if (containsChinese(original) && containsChinese(translated)) {
    const chineseChars = translated.match(/[\u4e00-\u9fff]/g)?.length || 0;
    const totalChars = translated.replace(/\s/g, '').length || 1;
    if (chineseChars / totalChars > 0.3) return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: '翻译功能未配置', details: '请在服务器环境变量中设置 DEEPSEEK_API_KEY' },
      { status: 500 }
    );
  }

  const results: string[] = [];
  let totalTranslated = 0;
  let skipped = 0;

  try {
    // 辅助函数：翻译单个字段
    const translateField = async (
      original: string,
      currentTranslated: string | null,
      lang: string
    ): Promise<{ translated: string | null; count: number; skip: number }> => {
      if (!original || !containsChinese(original)) return { translated: currentTranslated, count: 0, skip: 0 };
      if (currentTranslated && !containsChinese(currentTranslated)) return { translated: currentTranslated, count: 0, skip: 1 };
      
      try {
        const t = await translateText(original, lang);
        if (isValidTranslation(original, t)) {
          return { translated: t, count: 1, skip: 0 };
        }
        return { translated: currentTranslated, count: 0, skip: 1 };
      } catch (err: any) {
        results.push(`⚠️ ${lang}: ${err.message}`);
        return { translated: currentTranslated, count: 0, skip: 1 };
      }
    };

    // 1. Translate Programs
    const programs = await prisma.program.findMany();
    for (const p of programs) {
      const updates: any = {};
      
      const fi = await translateField(p.title, p.titleFi, 'fi');
      const en = await translateField(p.title, p.titleEn, 'en');
      if (fi.translated !== p.titleFi) updates.titleFi = fi.translated;
      if (en.translated !== p.titleEn) updates.titleEn = en.translated;
      totalTranslated += fi.count + en.count; skipped += fi.skip + en.skip;

      const dfi = await translateField(p.description, p.descriptionFi, 'fi');
      const den = await translateField(p.description, p.descriptionEn, 'en');
      if (dfi.translated !== p.descriptionFi) updates.descriptionFi = dfi.translated;
      if (den.translated !== p.descriptionEn) updates.descriptionEn = den.translated;
      totalTranslated += dfi.count + den.count; skipped += dfi.skip + den.skip;

      const cfi = await translateField(p.content, p.contentFi, 'fi');
      const cen = await translateField(p.content, p.contentEn, 'en');
      if (cfi.translated !== p.contentFi) updates.contentFi = cfi.translated;
      if (cen.translated !== p.contentEn) updates.contentEn = cen.translated;
      totalTranslated += cfi.count + cen.count; skipped += cfi.skip + cen.skip;

      if (Object.keys(updates).length > 0) {
        await prisma.program.update({ where: { id: p.id }, data: updates });
        results.push(`✅ Program: ${p.title} (${Object.keys(updates).length} fields)`);
      }
    }

    // 2. Translate Services
    const services = await prisma.service.findMany();
    for (const s of services) {
      const updates: any = {};
      
      const fi = await translateField(s.title, s.titleFi, 'fi');
      const en = await translateField(s.title, s.titleEn, 'en');
      if (fi.translated !== s.titleFi) updates.titleFi = fi.translated;
      if (en.translated !== s.titleEn) updates.titleEn = en.translated;
      totalTranslated += fi.count + en.count; skipped += fi.skip + en.skip;

      const dfi = await translateField(s.desc, s.descFi, 'fi');
      const den = await translateField(s.desc, s.descEn, 'en');
      if (dfi.translated !== s.descFi) updates.descFi = dfi.translated;
      if (den.translated !== s.descEn) updates.descEn = den.translated;
      totalTranslated += dfi.count + den.count; skipped += dfi.skip + den.skip;

      if (Object.keys(updates).length > 0) {
        await prisma.service.update({ where: { id: s.id }, data: updates });
        results.push(`✅ Service: ${s.title} (${Object.keys(updates).length} fields)`);
      }
    }

    // 3. Translate Activities
    const activities = await prisma.activity.findMany();
    for (const a of activities) {
      const updates: any = {};
      
      const fi = await translateField(a.title, a.titleFi, 'fi');
      const en = await translateField(a.title, a.titleEn, 'en');
      if (fi.translated !== a.titleFi) updates.titleFi = fi.translated;
      if (en.translated !== a.titleEn) updates.titleEn = en.translated;
      totalTranslated += fi.count + en.count; skipped += fi.skip + en.skip;

      const dfi = await translateField(a.desc, a.descFi, 'fi');
      const den = await translateField(a.desc, a.descEn, 'en');
      if (dfi.translated !== a.descFi) updates.descFi = dfi.translated;
      if (den.translated !== a.descEn) updates.descEn = den.translated;
      totalTranslated += dfi.count + den.count; skipped += dfi.skip + den.skip;

      if (Object.keys(updates).length > 0) {
        await prisma.activity.update({ where: { id: a.id }, data: updates });
        results.push(`✅ Activity: ${a.title} (${Object.keys(updates).length} fields)`);
      }
    }

    // 4. Translate Team Members
    const team = await prisma.teamMember.findMany();
    for (const m of team) {
      const updates: any = {};
      
      const fi = await translateField(m.role, m.roleFi, 'fi');
      const en = await translateField(m.role, m.roleEn, 'en');
      if (fi.translated !== m.roleFi) updates.roleFi = fi.translated;
      if (en.translated !== m.roleEn) updates.roleEn = en.translated;
      totalTranslated += fi.count + en.count; skipped += fi.skip + en.skip;

      const dfi = await translateField(m.desc, m.descFi, 'fi');
      const den = await translateField(m.desc, m.descEn, 'en');
      if (dfi.translated !== m.descFi) updates.descFi = dfi.translated;
      if (den.translated !== m.descEn) updates.descEn = den.translated;
      totalTranslated += dfi.count + den.count; skipped += dfi.skip + den.skip;

      if (Object.keys(updates).length > 0) {
        await prisma.teamMember.update({ where: { id: m.id }, data: updates });
        results.push(`✅ Team: ${m.name} (${Object.keys(updates).length} fields)`);
      }
    }

    // 5. Translate Partner Categories
    const categories = await prisma.partnerCategory.findMany();
    for (const c of categories) {
      const updates: any = {};
      
      const fi = await translateField(c.title, c.titleFi, 'fi');
      const en = await translateField(c.title, c.titleEn, 'en');
      if (fi.translated !== c.titleFi) updates.titleFi = fi.translated;
      if (en.translated !== c.titleEn) updates.titleEn = en.translated;
      totalTranslated += fi.count + en.count; skipped += fi.skip + en.skip;

      if (Object.keys(updates).length > 0) {
        await prisma.partnerCategory.update({ where: { id: c.id }, data: updates });
        results.push(`✅ Partner Category: ${c.title} (${Object.keys(updates).length} fields)`);
      }
    }

    // 6. Translate Partner Items
    const items = await prisma.partnerItem.findMany();
    for (const i of items) {
      const updates: any = {};
      
      const nfi = await translateField(i.name, i.nameFi, 'fi');
      const nen = await translateField(i.name, i.nameEn, 'en');
      if (nfi.translated !== i.nameFi) updates.nameFi = nfi.translated;
      if (nen.translated !== i.nameEn) updates.nameEn = nen.translated;
      totalTranslated += nfi.count + nen.count; skipped += nfi.skip + nen.skip;

      const dfi = await translateField(i.description, i.descriptionFi, 'fi');
      const den = await translateField(i.description, i.descriptionEn, 'en');
      if (dfi.translated !== i.descriptionFi) updates.descriptionFi = dfi.translated;
      if (den.translated !== i.descriptionEn) updates.descriptionEn = den.translated;
      totalTranslated += dfi.count + den.count; skipped += dfi.skip + den.skip;

      const cfi = await translateField(i.content, i.contentFi, 'fi');
      const cen = await translateField(i.content, i.contentEn, 'en');
      if (cfi.translated !== i.contentFi) updates.contentFi = cfi.translated;
      if (cen.translated !== i.contentEn) updates.contentEn = cen.translated;
      totalTranslated += cfi.count + cen.count; skipped += cfi.skip + cen.skip;

      if (Object.keys(updates).length > 0) {
        await prisma.partnerItem.update({ where: { id: i.id }, data: updates });
        results.push(`✅ Partner: ${i.name} (${Object.keys(updates).length} fields)`);
      }
    }

    // 7. Translate Site Config
    const site = await prisma.siteConfig.findFirst();
    if (site) {
      const updates: any = {};
      
      const dfi = await translateField(site.description, site.descriptionFi, 'fi');
      const den = await translateField(site.description, site.descriptionEn, 'en');
      if (dfi.translated !== site.descriptionFi) updates.descriptionFi = dfi.translated;
      if (den.translated !== site.descriptionEn) updates.descriptionEn = den.translated;
      totalTranslated += dfi.count + den.count; skipped += dfi.skip + den.skip;

      if (Object.keys(updates).length > 0) {
        await prisma.siteConfig.update({ where: { id: site.id }, data: updates });
        results.push('✅ Site description → fi/en');
      }
    }

    const msg = totalTranslated > 0
      ? `翻译完成！共翻译 ${totalTranslated} 个字段。`
      : `⚠️ 所有字段已有有效翻译，无需重复翻译。`;
    
    const note = skipped > 0 ? ` (${skipped} 个字段已有翻译跳过)` : '';

    return NextResponse.json({
      success: true,
      totalTranslated,
      skipped,
      message: msg + note,
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

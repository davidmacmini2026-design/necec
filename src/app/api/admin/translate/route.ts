import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

// 检测文本是否包含中文
function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fff]/.test(text);
}

// 按自然段落分割长文本（句号、换行处），每段最多500字符
function splitText(text: string): string[] {
  if (text.length <= 500) return [text];
  
  const segments: string[] = [];
  // 先按换行分割
  const lines = text.split('\n');
  let current = '';
  
  for (const line of lines) {
    if ((current + line).length > 500 && current.length > 0) {
      segments.push(current.trim());
      current = line;
    } else {
      current += (current ? '\n' : '') + line;
    }
  }
  if (current.trim()) segments.push(current.trim());
  
  // 对仍然太长的段落，按句号分割
  const finalSegments: string[] = [];
  for (const seg of segments) {
    if (seg.length <= 500) {
      finalSegments.push(seg);
    } else {
      const sentences = seg.split(/(?<=[。，！？；\n])/);
      let chunk = '';
      for (const s of sentences) {
        if (chunk.length + s.length > 500 && chunk.length > 0) {
          finalSegments.push(chunk.trim());
          chunk = s;
        } else {
          chunk += s;
        }
      }
      if (chunk.trim()) finalSegments.push(chunk.trim());
    }
  }
  
  return finalSegments.length > 0 ? finalSegments : [text];
}

// 使用 MyMemory 翻译单段文本，带重试和多个fallback
async function translateChunk(text: string, targetLang: string): Promise<string> {
  const params = new URLSearchParams({
    q: text,
    langpair: `zh|${targetLang}`,
  });
  
  const res = await fetch(`https://api.mymemory.translated.net/get?${params}`, {
    signal: AbortSignal.timeout(15000),
  });
  
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  
  const data = await res.json();
  const translated = data.responseData?.translatedText;
  
  // 检查翻译结果是否包含中文（说明翻译失败）
  if (translated && containsChinese(translated) && containsChinese(text)) {
    // 如果翻译结果还是中文，可能API不支持该语言对
    throw new Error('Translation returned Chinese text - API may not support this language pair');
  }
  
  return translated || text;
}

// 翻译文本：短文本直接翻，长文本分段翻
async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return '';
  if (!containsChinese(text.trim())) return text; // 没有中文就不用翻
  
  // 短文本直接翻译
  if (text.length <= 500) {
    try {
      return await translateChunk(text, targetLang);
    } catch (err) {
      console.error(`Translate error (zh→${targetLang}, short):`, err);
      return text;
    }
  }
  
  // 长文本分段翻译
  const segments = splitText(text);
  const results: string[] = [];
  
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    if (!seg.trim()) {
      results.push('');
      continue;
    }
    
    try {
      const translated = await translateChunk(seg, targetLang);
      results.push(translated);
      // 批次间稍作延迟避免限流
      if (i < segments.length - 1) {
        await new Promise(r => setTimeout(r, 200));
      }
    } catch (err) {
      console.error(`Translate error segment ${i} (zh→${targetLang}):`, err);
      results.push(seg); // fallback
    }
  }
  
  return results.join('\n');
}

// 验证翻译质量：结果不应是纯中文（除非原文也没有中文）
function isValidTranslation(original: string, translated: string): boolean {
  if (!translated || !translated.trim()) return false;
  // 如果原文包含中文，翻译结果不应该还包含大量中文
  if (containsChinese(original) && containsChinese(translated)) {
    // 允许少量中文（如专有名词），但如果翻译结果50%以上是中文则认为失败
    const chineseChars = translated.match(/[\u4e00-\u9fff]/g)?.length || 0;
    const totalChars = translated.replace(/\s/g, '').length || 1;
    if (chineseChars / totalChars > 0.5) return false;
  }
  return true;
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: string[] = [];
  let totalTranslated = 0;
  let skipped = 0;

  try {
    // 1. Translate Programs
    const programs = await prisma.program.findMany();
    for (const p of programs) {
      const updates: any = {};

      if (p.title && containsChinese(p.title)) {
        if (!p.titleFi || containsChinese(p.titleFi)) {
          const t = await translateText(p.title, 'fi');
          if (isValidTranslation(p.title, t)) { updates.titleFi = t; totalTranslated++; } else skipped++;
        }
        if (!p.titleEn || containsChinese(p.titleEn)) {
          const t = await translateText(p.title, 'en');
          if (isValidTranslation(p.title, t)) { updates.titleEn = t; totalTranslated++; } else skipped++;
        }
      }
      if (p.description && containsChinese(p.description)) {
        if (!p.descriptionFi || containsChinese(p.descriptionFi)) {
          const t = await translateText(p.description, 'fi');
          if (isValidTranslation(p.description, t)) { updates.descriptionFi = t; totalTranslated++; } else skipped++;
        }
        if (!p.descriptionEn || containsChinese(p.descriptionEn)) {
          const t = await translateText(p.description, 'en');
          if (isValidTranslation(p.description, t)) { updates.descriptionEn = t; totalTranslated++; } else skipped++;
        }
      }
      if (p.content && containsChinese(p.content)) {
        if (!p.contentFi || containsChinese(p.contentFi)) {
          const t = await translateText(p.content, 'fi');
          if (isValidTranslation(p.content, t)) { updates.contentFi = t; totalTranslated++; } else skipped++;
        }
        if (!p.contentEn || containsChinese(p.contentEn)) {
          const t = await translateText(p.content, 'en');
          if (isValidTranslation(p.content, t)) { updates.contentEn = t; totalTranslated++; } else skipped++;
        }
      }

      if (Object.keys(updates).length > 0) {
        await prisma.program.update({ where: { id: p.id }, data: updates });
        results.push(`✅ Program: ${p.title} → fi/en (${Object.keys(updates).length} fields)`);
      }
    }

    // 2. Translate Services
    const services = await prisma.service.findMany();
    for (const s of services) {
      const updates: any = {};

      if (s.title && containsChinese(s.title)) {
        if (!s.titleFi || containsChinese(s.titleFi)) {
          const t = await translateText(s.title, 'fi');
          if (isValidTranslation(s.title, t)) { updates.titleFi = t; totalTranslated++; } else skipped++;
        }
        if (!s.titleEn || containsChinese(s.titleEn)) {
          const t = await translateText(s.title, 'en');
          if (isValidTranslation(s.title, t)) { updates.titleEn = t; totalTranslated++; } else skipped++;
        }
      }
      if (s.desc && containsChinese(s.desc)) {
        if (!s.descFi || containsChinese(s.descFi)) {
          const t = await translateText(s.desc, 'fi');
          if (isValidTranslation(s.desc, t)) { updates.descFi = t; totalTranslated++; } else skipped++;
        }
        if (!s.descEn || containsChinese(s.descEn)) {
          const t = await translateText(s.desc, 'en');
          if (isValidTranslation(s.desc, t)) { updates.descEn = t; totalTranslated++; } else skipped++;
        }
      }

      if (Object.keys(updates).length > 0) {
        await prisma.service.update({ where: { id: s.id }, data: updates });
        results.push(`✅ Service: ${s.title} → fi/en (${Object.keys(updates).length} fields)`);
      }
    }

    // 3. Translate Activities
    const activities = await prisma.activity.findMany();
    for (const a of activities) {
      const updates: any = {};

      if (a.title && containsChinese(a.title)) {
        if (!a.titleFi || containsChinese(a.titleFi)) {
          const t = await translateText(a.title, 'fi');
          if (isValidTranslation(a.title, t)) { updates.titleFi = t; totalTranslated++; } else skipped++;
        }
        if (!a.titleEn || containsChinese(a.titleEn)) {
          const t = await translateText(a.title, 'en');
          if (isValidTranslation(a.title, t)) { updates.titleEn = t; totalTranslated++; } else skipped++;
        }
      }
      if (a.desc && containsChinese(a.desc)) {
        if (!a.descFi || containsChinese(a.descFi)) {
          const t = await translateText(a.desc, 'fi');
          if (isValidTranslation(a.desc, t)) { updates.descFi = t; totalTranslated++; } else skipped++;
        }
        if (!a.descEn || containsChinese(a.descEn)) {
          const t = await translateText(a.desc, 'en');
          if (isValidTranslation(a.desc, t)) { updates.descEn = t; totalTranslated++; } else skipped++;
        }
      }

      if (Object.keys(updates).length > 0) {
        await prisma.activity.update({ where: { id: a.id }, data: updates });
        results.push(`✅ Activity: ${a.title} → fi/en (${Object.keys(updates).length} fields)`);
      }
    }

    // 4. Translate Team Members
    const team = await prisma.teamMember.findMany();
    for (const m of team) {
      const updates: any = {};

      if (m.role && containsChinese(m.role)) {
        if (!m.roleFi || containsChinese(m.roleFi)) {
          const t = await translateText(m.role, 'fi');
          if (isValidTranslation(m.role, t)) { updates.roleFi = t; totalTranslated++; } else skipped++;
        }
        if (!m.roleEn || containsChinese(m.roleEn)) {
          const t = await translateText(m.role, 'en');
          if (isValidTranslation(m.role, t)) { updates.roleEn = t; totalTranslated++; } else skipped++;
        }
      }
      if (m.desc && containsChinese(m.desc)) {
        if (!m.descFi || containsChinese(m.descFi)) {
          const t = await translateText(m.desc, 'fi');
          if (isValidTranslation(m.desc, t)) { updates.descFi = t; totalTranslated++; } else skipped++;
        }
        if (!m.descEn || containsChinese(m.descEn)) {
          const t = await translateText(m.desc, 'en');
          if (isValidTranslation(m.desc, t)) { updates.descEn = t; totalTranslated++; } else skipped++;
        }
      }

      if (Object.keys(updates).length > 0) {
        await prisma.teamMember.update({ where: { id: m.id }, data: updates });
        results.push(`✅ Team: ${m.name} → fi/en (${Object.keys(updates).length} fields)`);
      }
    }

    // 5. Translate Partner Categories
    const categories = await prisma.partnerCategory.findMany();
    for (const c of categories) {
      const updates: any = {};
      if (c.title && containsChinese(c.title)) {
        if (!c.titleFi || containsChinese(c.titleFi)) {
          const t = await translateText(c.title, 'fi');
          if (isValidTranslation(c.title, t)) { updates.titleFi = t; totalTranslated++; } else skipped++;
        }
        if (!c.titleEn || containsChinese(c.titleEn)) {
          const t = await translateText(c.title, 'en');
          if (isValidTranslation(c.title, t)) { updates.titleEn = t; totalTranslated++; } else skipped++;
        }
      }
      if (Object.keys(updates).length > 0) {
        await prisma.partnerCategory.update({ where: { id: c.id }, data: updates });
        results.push(`✅ Partner Category: ${c.title} → fi/en`);
      }
    }

    // 6. Translate Partner Items (name, description, content)
    const items = await prisma.partnerItem.findMany();
    for (const i of items) {
      const updates: any = {};

      if (i.name && containsChinese(i.name)) {
        if (!i.nameFi || containsChinese(i.nameFi)) {
          const t = await translateText(i.name, 'fi');
          if (isValidTranslation(i.name, t)) { updates.nameFi = t; totalTranslated++; } else skipped++;
        }
        if (!i.nameEn || containsChinese(i.nameEn)) {
          const t = await translateText(i.name, 'en');
          if (isValidTranslation(i.name, t)) { updates.nameEn = t; totalTranslated++; } else skipped++;
        }
      }
      if (i.description && containsChinese(i.description)) {
        if (!i.descriptionFi || containsChinese(i.descriptionFi)) {
          const t = await translateText(i.description, 'fi');
          if (isValidTranslation(i.description, t)) { updates.descriptionFi = t; totalTranslated++; } else skipped++;
        }
        if (!i.descriptionEn || containsChinese(i.descriptionEn)) {
          const t = await translateText(i.description, 'en');
          if (isValidTranslation(i.description, t)) { updates.descriptionEn = t; totalTranslated++; } else skipped++;
        }
      }
      if (i.content && containsChinese(i.content)) {
        if (!i.contentFi || containsChinese(i.contentFi)) {
          const t = await translateText(i.content, 'fi');
          if (isValidTranslation(i.content, t)) { updates.contentFi = t; totalTranslated++; } else skipped++;
        }
        if (!i.contentEn || containsChinese(i.contentEn)) {
          const t = await translateText(i.content, 'en');
          if (isValidTranslation(i.content, t)) { updates.contentEn = t; totalTranslated++; } else skipped++;
        }
      }

      if (Object.keys(updates).length > 0) {
        await prisma.partnerItem.update({ where: { id: i.id }, data: updates });
        results.push(`✅ Partner: ${i.name} → fi/en (${Object.keys(updates).length} fields)`);
      }
    }

    // 7. Translate Site Config
    const site = await prisma.siteConfig.findFirst();
    if (site) {
      const updates: any = {};
      if (site.description && containsChinese(site.description)) {
        if (!site.descriptionFi || containsChinese(site.descriptionFi)) {
          const t = await translateText(site.description, 'fi');
          if (isValidTranslation(site.description, t)) { updates.descriptionFi = t; totalTranslated++; } else skipped++;
        }
        if (!site.descriptionEn || containsChinese(site.descriptionEn)) {
          const t = await translateText(site.description, 'en');
          if (isValidTranslation(site.description, t)) { updates.descriptionEn = t; totalTranslated++; } else skipped++;
        }
      }
      if (Object.keys(updates).length > 0) {
        await prisma.siteConfig.update({ where: { id: site.id }, data: updates });
        results.push(`✅ Site description → fi/en`);
      }
    }

    const msg = totalTranslated > 0
      ? `翻译完成！共翻译 ${totalTranslated} 个字段。`
      : `⚠️ 所有字段已有有效翻译，无需重复翻译。`;
    
    const note = skipped > 0 ? ` (${skipped} 个字段翻译失败跳过)` : '';

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

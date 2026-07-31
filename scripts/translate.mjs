#!/usr/bin/env node
/**
 * 独立翻译脚本 — DeepSeek API 翻译数据库内容
 * 通过 sqlite3 CLI 操作数据库，纯 Node.js 调用 DeepSeek API
 * 用法: DEEPSEEK_API_KEY=sk-xxx node scripts/translate.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'prisma', 'dev.db');

const API_KEY = process.env.DEEPSEEK_API_KEY;
if (!API_KEY) {
  console.error('❌ DEEPSEEK_API_KEY not set');
  process.exit(1);
}

const API_BASE = 'https://api.deepseek.com/v1';

function sql(query) {
  return execSync(`sqlite3 -json "${DB_PATH}" "${query.replace(/"/g, '\\"')}"`, { 
    encoding: 'utf-8', 
    maxBuffer: 50 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'ignore']
  }).trim();
}

function sqlRun(query) {
  execSync(`sqlite3 "${DB_PATH}" "${query.replace(/"/g, '\\"')}"`, { stdio: 'ignore' });
}

function parseRows(json) {
  if (!json) return [];
  try {
    const data = JSON.parse(json);
    return Array.isArray(data) ? data : [data];
  } catch {
    return [];
  }
}

function hasChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}

async function translate(text, targetLang) {
  const langNames = { fi: 'Finnish', en: 'English' };
  const langName = langNames[targetLang];

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following Chinese text into ${langName}. Preserve all formatting, line breaks, and special characters like 【】· →. Output ONLY the translated text. Keep proper nouns (names, brands, places) in original form. Never include Chinese characters in output unless they are proper nouns.`,
        },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: 4096,
    }),
    signal: AbortSignal.timeout(90000),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || '';
}

async function translateSafe(text, targetLang) {
  if (!text || !text.trim() || !hasChinese(text)) return null;

  for (let i = 0; i < 3; i++) {
    try {
      const result = await translate(text, targetLang);
      if (!result) throw new Error('Empty result');
      
      // 验证质量
      const chineseChars = (result.match(/[\u4e00-\u9fff]/g) || []).length;
      const totalChars = result.replace(/\s/g, '').length || 1;
      if (chineseChars / totalChars > 0.3) {
        throw new Error(`Too much Chinese (${Math.round(chineseChars/totalChars*100)}%)`);
      }
      return result;
    } catch (err) {
      console.error(`  ⚠️  Retry ${i + 1}/3: ${err.message}`);
      if (i < 2) await new Promise(r => setTimeout(r, 2000 * (i + 1)));
    }
  }
  return null;
}

function escapeSql(str) {
  return str.replace(/'/g, "''");
}

async function translateFields(table, idField, fields) {
  const rows = parseRows(sql(`SELECT * FROM ${table}`));
  
  for (const row of rows) {
    const sets = [];
    
    for (const [zhField, fiField, enField] of fields) {
      const zhText = row[zhField];
      if (!zhText || !hasChinese(zhText)) continue;

      // 芬兰语
      if (!row[fiField] || hasChinese(row[fiField])) {
        console.log(`  🔄 ${table} #${row[idField]} ${zhField} → fi (${zhText.length} chars)...`);
        const t = await translateSafe(zhText, 'fi');
        if (t) {
          sets.push(`${fiField} = '${escapeSql(t)}'`);
          console.log(`  ✅ ${table} #${row[idField]} ${zhField} → fi done`);
        } else {
          console.log(`  ❌ ${table} #${row[idField]} ${zhField} → fi failed`);
        }
      }

      // 英语
      if (!row[enField] || hasChinese(row[enField])) {
        console.log(`  🔄 ${table} #${row[idField]} ${zhField} → en (${zhText.length} chars)...`);
        const t = await translateSafe(zhText, 'en');
        if (t) {
          sets.push(`${enField} = '${escapeSql(t)}'`);
          console.log(`  ✅ ${table} #${row[idField]} ${zhField} → en done`);
        } else {
          console.log(`  ❌ ${table} #${row[idField]} ${zhField} → en failed`);
        }
      }
    }

    if (sets.length) {
      const updateSql = `UPDATE ${table} SET ${sets.join(', ')} WHERE ${idField} = '${escapeSql(row[idField])}'`;
      sqlRun(updateSql);
    }
  }
}

async function main() {
  console.log('🦞 DeepSeek Translation Engine\n');
  
  // Partner Items
  console.log('📋 PartnerItem (合作网络)...');
  await translateFields('PartnerItem', 'id', [
    ['name', 'nameFi', 'nameEn'],
    ['description', 'descriptionFi', 'descriptionEn'],
    ['content', 'contentFi', 'contentEn'],
  ]);

  // Programs
  console.log('\n📋 Program (核心项目)...');
  await translateFields('Program', 'id', [
    ['title', 'titleFi', 'titleEn'],
    ['description', 'descriptionFi', 'descriptionEn'],
    ['content', 'contentFi', 'contentEn'],
  ]);

  // Services
  console.log('\n📋 Service (服务)...');
  await translateFields('Service', 'id', [
    ['title', 'titleFi', 'titleEn'],
    ['desc', 'descFi', 'descEn'],
  ]);

  // Activities
  console.log('\n📋 Activity (交流活动)...');
  await translateFields('Activity', 'id', [
    ['title', 'titleFi', 'titleEn'],
    ['desc', 'descFi', 'descEn'],
  ]);

  // Team Members
  console.log('\n📋 TeamMember (团队成员)...');
  await translateFields('TeamMember', 'id', [
    ['role', 'roleFi', 'roleEn'],
    ['desc', 'descFi', 'descEn'],
  ]);

  // Partner Categories
  console.log('\n📋 PartnerCategory (合作分类)...');
  await translateFields('PartnerCategory', 'id', [
    ['title', 'titleFi', 'titleEn'],
  ]);

  // Site Config
  console.log('\n📋 SiteConfig (站点设置)...');
  await translateFields('SiteConfig', 'id', [
    ['description', 'descriptionFi', 'descriptionEn'],
  ]);

  console.log('\n🎉 全部翻译完成！');
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});

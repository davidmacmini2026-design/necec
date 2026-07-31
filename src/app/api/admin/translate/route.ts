import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!proces…KEY) {
    return NextResponse.json(
      { error: '翻译功能未配置', details: '请在服务器环境变量中设置 DEEPSEEK_API_KEY' },
      { status: 500 }
    );
  }

  try {
    const scriptPath = path.join(process.cwd(), 'scripts', 'translate.mjs');
    const { stdout, stderr } = await execAsync(`node "${scriptPath}"`, {
      timeout: 600000, // 10 分钟超时
      maxBuffer: 1024 * 1024, // 1MB
      env: { ...process.env },
    });

    if (stderr && !stderr.includes('Warning')) {
      console.error('Translate script stderr:', stderr);
    }

    // 从输出中统计结果
    const lines = stdout.split('\n').filter(Boolean);
    const successLines = lines.filter(l => l.includes('✅'));
    const errorLines = lines.filter(l => l.includes('❌'));
    const totalDone = successLines.length;
    const totalFailed = errorLines.length;

    return NextResponse.json({
      success: true,
      totalTranslated: totalDone,
      skipped: totalFailed,
      message: totalDone > 0
        ? `翻译完成！共处理 ${totalDone} 个字段。`
        : `⚠️ 所有字段已有有效翻译。`,
      details: successLines.concat(errorLines),
    });
  } catch (err: any) {
    console.error('Translation error:', err);
    // 超时时返回部分结果
    if (err.killed) {
      return NextResponse.json({
        success: true,
        totalTranslated: 0,
        skipped: 0,
        message: '翻译超时，部分内容可能未完成。请稍后重试。',
        details: [],
      });
    }
    return NextResponse.json(
      { error: '翻译失败', details: err.message },
      { status: 500 }
    );
  }
}

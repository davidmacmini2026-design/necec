import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { spawn } = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const nodePath = require('path');

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: '翻译功能未配置', details: '请在服务器环境变量中设置 DEEPSEEK_API_KEY' },
      { status: 500 }
    );
  }

  try {
    const scriptPath = nodePath.join(process.cwd(), 'scripts', 'translate.mjs');
    
    return new Promise<NextResponse>((resolve) => {
      const child = spawn('node', [scriptPath], {
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 600000,
      });

      let stdout = '';

      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      child.on('close', (code: number) => {
        const lines = stdout.split('\n').filter(Boolean);
        const successLines = lines.filter(l => l.includes('✅'));

        resolve(NextResponse.json({
          success: code === 0,
          totalTranslated: successLines.length,
          skipped: 0,
          message: successLines.length > 0
            ? `翻译完成！共处理 ${successLines.length} 个字段。`
            : `翻译完成。`,
          details: successLines,
        }));
      });

      child.on('error', (err: Error) => {
        resolve(NextResponse.json(
          { error: '翻译脚本启动失败', details: err.message },
          { status: 500 }
        ));
      });
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: '翻译失败', details: err.message },
      { status: 500 }
    );
  }
}

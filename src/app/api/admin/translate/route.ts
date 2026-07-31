import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

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
    // 启动翻译脚本（后台运行），不等待结果，避免超时
    const { spawn } = await import('child_process');
    const path = await import('path');
    
    const scriptPath = path.default.join(process.cwd(), 'scripts', 'translate.mjs');
    
    return new Promise((resolve) => {
      const child = spawn('node', [scriptPath], {
        env: process.env,
        stdio: ['ignore', 'pipe', 'pipe'],
        timeout: 600000,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code: number) => {
        const lines = stdout.split('\n').filter(Boolean);
        const successLines = lines.filter(l => l.includes('✅'));
        const errorLines = lines.filter(l => l.includes('❌'));

        resolve(NextResponse.json({
          success: code === 0,
          totalTranslated: successLines.length,
          skipped: errorLines.length,
          message: successLines.length > 0
            ? `翻译完成！共处理 ${successLines.length} 个字段。`
            : `翻译完成。`,
          details: successLines.concat(errorLines),
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

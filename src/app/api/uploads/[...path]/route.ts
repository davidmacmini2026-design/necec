import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const filename = path.join('/').replace(/\.\./g, ''); // basic security
  const filePath = join(process.cwd(), 'storage', 'uploads', filename);

  if (!existsSync(filePath)) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const buffer = await readFile(filePath);
  const ext = filename.split('.').pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
  };

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': mimeTypes[ext || ''] || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}

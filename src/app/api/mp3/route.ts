import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { downloadMP3 } from '../../../../tools/mp3/downloader';

export async function POST(request: Request) {
  const { url } = await request.json();
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }
  try {
    const output: string = await downloadMP3(url);
    const filename = path.basename(output);
    return NextResponse.json({ success: true, filename });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Download failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 });
  }
  try {
    const output: string = await downloadMP3(url);
    const filename = path.basename(output);
    const file = fs.readFileSync(output);
    return new NextResponse(file, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Download failed' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import path from 'path';
const { downloadMP3 } = require(path.join(process.cwd(), 'tools/mp3/downloader'));

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

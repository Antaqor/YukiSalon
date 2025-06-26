import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import fs from 'fs/promises';

ffmpeg.setFfmpegPath(ffmpegPath);   // one-time global

export async function downloadMP3 (url: string): Promise<string> {
  if (!ytdl.validateURL(url)) throw new Error('Invalid YouTube URL');

  const info   = await ytdl.getInfo(url);
  const title  = info.videoDetails.title
                   .replace(/[\\/:*?"<>|]/g, '')
                   .replace(/\s+/g, '_');
  const dir    = path.join(process.cwd(), 'public', 'mp3');
  await fs.mkdir(dir, { recursive: true });

  const out = path.join(dir, `${title}.mp3`);

  await new Promise<void>((res, rej) => {
    ffmpeg(ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }))
      .audioBitrate(128)
      .format('mp3')
      .on('error', rej)
      .on('end',  res)
      .save(out);
  });

  return out;
}

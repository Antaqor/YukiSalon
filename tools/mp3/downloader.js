const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');
const fs = require('fs');

async function downloadMP3(url) {
  const info = await ytdl.getInfo(url);
  const title = info.videoDetails.title
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, '_');
  const outputDir = path.join(process.cwd(), 'public', 'mp3');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const output = path.join(outputDir, `${title}.mp3`);

  await new Promise((resolve, reject) => {
    ffmpeg(ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }))
      .setFfmpegPath(ffmpegPath)
      .format('mp3')
      .audioBitrate(128)
      .on('error', reject)
      .on('end', resolve)
      .save(output);
  });

  return output;
}

module.exports = { downloadMP3 };

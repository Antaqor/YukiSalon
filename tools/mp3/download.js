const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('ffmpeg-static');
const path = require('path');

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node download.js <youtube-url>');
    process.exit(1);
  }

  try {
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, '_');
    const output = path.join(__dirname, `${title}.mp3`);

    await new Promise((resolve, reject) => {
      ffmpeg(ytdl(url, { filter: 'audioonly', quality: 'highestaudio' }))
        .setFfmpegPath(ffmpegPath)
        .format('mp3')
        .audioBitrate(128)
        .on('error', reject)
        .on('end', resolve)
        .save(output);
    });

    console.log('Saved:', output);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();

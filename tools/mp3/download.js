// download.js
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
    // Get video info for a safe filename
    const info = await ytdl.getInfo(url);
    const title = info.videoDetails.title
      .replace(/[\\/:*?"<>|]/g, '')  // scrub illegal chars
      .replace(/\s+/g, '_')          // spaces → underscores
      .substring(0, 100);            // keep filename sane

    const output = path.join(__dirname, `${title}.mp3`);

    // Download + transcode in one pass
    await new Promise((resolve, reject) => {
      ffmpeg(
        ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
      )
        .setFfmpegPath(ffmpegPath)
        .audioBitrate(128)
        .format('mp3')
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

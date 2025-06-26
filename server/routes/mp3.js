const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('ffmpeg-static');

const router = express.Router();

// Folder to store downloaded MP3 files
const mp3Dir = path.join(__dirname, '../uploads/mp3');
if (!fs.existsSync(mp3Dir)) {
  fs.mkdirSync(mp3Dir, { recursive: true });
}

function sanitize(name) {
  return name.replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, '_');
}

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      if (stderr) console.warn(stderr);
      resolve(stdout.trim());
    });
  });
}

async function downloadMP3(url) {
  // Get the video title first to create a clean filename
  const rawTitle = await run(`yt-dlp --get-title "${url}"`);
  const title = sanitize(rawTitle);
  const output = path.join(mp3Dir, `${title}.mp3`);
  const cmd = `yt-dlp -x --audio-format mp3 --ffmpeg-location "${ffmpegPath}" -o "${output}" "${url}"`;
  await run(cmd);
  return output;
}

router.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const out = await downloadMP3(url);
    const filename = path.basename(out);
    res.json({ success: true, filename });
  } catch (err) {
    console.error('MP3 download error:', err);
    res.status(500).json({ error: err.message || 'Download failed' });
  }
});

router.get('/', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const out = await downloadMP3(url);
    res.download(out, path.basename(out));
  } catch (err) {
    console.error('MP3 download error:', err);
    res.status(500).json({ error: err.message || 'Download failed' });
  }
});

module.exports = router;

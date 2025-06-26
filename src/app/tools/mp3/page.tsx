const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const rateLimit = require('express-rate-limit');

const execPromise = util.promisify(exec);
const UPLOADS_DIR = path.join(__dirname, '../uploads/mp3');
const YT_DLP_PATH = '/usr/local/bin/yt-dlp';

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.chmodSync(UPLOADS_DIR, 0o777);
}

// Rate limiting (5 requests per 15 minutes)
const convertLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Хэт олон хүсэлт. Түр хүлээнэ үү' }
});

router.post('/convert', convertLimiter, async (req, res) => {
  try {
    let { videoUrl } = req.body;

    // Decode URL if encoded by frontend
    try {
      videoUrl = decodeURIComponent(videoUrl);
    } catch (e) {
      console.log('URL was not encoded, using as-is');
    }

    // Validate ALL YouTube URL formats
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)$/;
    if (!videoUrl || !youtubeRegex.test(videoUrl)) {
      return res.status(400).json({ 
        success: false,
        error: 'Зөв YouTube линк оруулна уу'
      });
    }

    // Extract video ID
    const videoId = videoUrl.match(youtubeRegex)[5];
    const filename = `conversion_${Date.now()}_${videoId}.mp3`;
    const outputFile = path.join(UPLOADS_DIR, filename);

    console.log(`Processing: ${videoUrl}`);

    // Execute yt-dlp (handles timestamps automatically)
    const command = `${YT_DLP_PATH} --no-warnings -x --audio-format mp3 --audio-quality 2 -o "${outputFile}" "${videoUrl}"`;
    const { stderr } = await execPromise(command);

    // Verify output
    if (!fs.existsSync(outputFile)) {
      console.error('Conversion failed. yt-dlp output:', stderr);
      return res.status(500).json({
        success: false,
        error: 'Аудио хувиргах боломжгүй (YouTube хязгаарлалт эсвэл алдаа)'
      });
    }

    // Set file permissions
    fs.chmodSync(outputFile, 0o644);

    res.json({
      success: true,
      filePath: `/uploads/mp3/${filename}`,
      filename: filename
    });

  } catch (error) {
    console.error('SERVER ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Серверийн алдаа'
    });
  }
});

// File download endpoint
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename.endsWith('.mp3')) {
      return res.status(400).json({ error: 'Буруй файлын төрөл' });
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл олдсонгүй' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Татахад алдаа гарлаа' });
  }
});

// Cleanup old files (runs every 6 hours)
const cleanupOldFiles = () => {
  const now = Date.now();
  const maxAgeMs = 24 * 60 * 60 * 1000; // 24 hours

  fs.readdirSync(UPLOADS_DIR).forEach(file => {
    const filePath = path.join(UPLOADS_DIR, file);
    const stats = fs.statSync(filePath);
    if (now - stats.birthtimeMs > maxAgeMs) {
      fs.unlinkSync(filePath);
      console.log(`Deleted old file: ${file}`);
    }
  });
};

setInterval(cleanupOldFiles, 6 * 60 * 60 * 1000);
cleanupOldFiles(); // Run on startup

module.exports = router;

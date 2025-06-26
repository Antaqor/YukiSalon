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
  fs.chmodSync(UPLOADS_DIR, 0o755); // Changed to 755
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

    // Decode URL
    try {
      videoUrl = decodeURIComponent(videoUrl);
    } catch (e) {
      console.log('URL decode error, using as-is');
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)$/;
    if (!videoUrl || !youtubeRegex.test(videoUrl)) {
      return res.status(400).json({ 
        success: false,
        error: 'Зөв YouTube линк оруулна уу'
      });
    }

    const videoId = videoUrl.match(youtubeRegex)[5];
    const filename = `conversion_${Date.now()}_${videoId}.mp3`;
    const outputFile = path.join(UPLOADS_DIR, filename);

    console.log(`Processing: ${videoUrl}`);

    // 1. Added --no-check-certificate flag
    // 2. Removed quotes around output file path
    // 3. Added error handling for execPromise
    const command = `${YT_DLP_PATH} --no-check-certificate --no-warnings -x --audio-format mp3 --audio-quality 2 -o ${outputFile} "${videoUrl}"`;
    
    try {
      const { stdout, stderr } = await execPromise(command);
      console.log('Conversion stdout:', stdout);
      console.log('Conversion stderr:', stderr);
    } catch (execError) {
      console.error('Execution error:', execError);
      return res.status(500).json({
        success: false,
        error: 'Аудио хувиргах үед алдаа гарлаа'
      });
    }

    if (!fs.existsSync(outputFile)) {
      return res.status(500).json({
        success: false,
        error: 'Аудио файл үүсгэхэд алдаа гарлаа'
      });
    }

    // Set file permissions
    fs.chmodSync(outputFile, 0o755);

    res.json({
      success: true,
      filePath: `/api/mp3/download/${filename}`, // Corrected path
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

// File download endpoint (unchanged)
router.get('/download/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл олдсонгүй' });
    }

    res.download(filePath, filename, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ error: 'Татахад алдаа гарлаа' });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Татахад алдаа гарлаа' });
  }
});

// Cleanup code remains same

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
  fs.chmodSync(UPLOADS_DIR, 0o755);
}

// Rate limiting
const convertLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Хэт олон хүсэлт. Түр хүлээнэ үү' }
});

router.post('/convert', convertLimiter, async (req, res) => {
  try {
    let { videoUrl } = req.body;
    console.log('Conversion request for:', videoUrl);

    // Decode URL
    try {
      videoUrl = decodeURIComponent(videoUrl);
    } catch (e) {
      console.log('URL decode error, using as-is');
    }

    // Enhanced YouTube URL regex
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(\S*)$/;
    
    if (!videoUrl || !youtubeRegex.test(videoUrl)) {
      return res.status(400).json({ 
        success: false,
        error: 'Зөв YouTube линк оруулна уу'
      });
    }

    const videoId = videoUrl.match(youtubeRegex)[5];
    const filename = `conversion_${Date.now()}_${videoId}.mp3`;
    const outputFile = path.join(UPLOADS_DIR, filename);

    console.log(`Starting conversion: ${videoUrl}`);
    
    // NEW: Use cookies and user-agent to avoid restrictions
    const command = `${YT_DLP_PATH} --no-warnings \
      --cookies-from-browser firefox \
      --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36" \
      -x --audio-format mp3 --audio-quality 2 \
      -o "${outputFile}" "${videoUrl}"`;

    try {
      const { stdout, stderr } = await execPromise(command);
      console.log('Conversion stdout:', stdout);
      if (stderr) console.warn('Conversion stderr:', stderr);
    } catch (execError) {
      console.error('FULL EXEC ERROR:', execError);
      
      // NEW: Handle specific YouTube errors
      let errorMessage = 'Аудио хувиргах боломжгүй (YouTube хязгаарлалт эсвэл алдаа)';
      
      if (execError.stderr.includes('age restricted')) {
        errorMessage = 'Энэ видео насны хязгаарлалттай байна';
      } else if (execError.stderr.includes('copyright')) {
        errorMessage = 'Энэ видео хуулахыг хориглосон';
      } else if (execError.stderr.includes('unavailable')) {
        errorMessage = 'Энэ видео одоогоор боломжгүй байна';
      }
      
      // Clean up failed files
      if (fs.existsSync(outputFile)) {
        fs.unlinkSync(outputFile);
      }
      
      return res.status(500).json({
        success: false,
        error: errorMessage
      });
    }

    if (!fs.existsSync(outputFile)) {
      return res.status(500).json({
        success: false,
        error: 'Аудио файл үүсгэхэд алдаа гарлаа'
      });
    }

    // Set file permissions
    fs.chmodSync(outputFile, 0o644);

    console.log(`Conversion successful: ${outputFile}`);
    res.json({
      success: true,
      filePath: `/api/mp3/download/${filename}`,
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

// Rest of the code remains same...

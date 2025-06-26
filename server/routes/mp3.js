// routes/mp3.js
const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');

const execPromise = util.promisify(exec);
const UPLOADS_DIR = path.join(__dirname, '../uploads/mp3');
const YT_DLP_PATH = '/usr/local/bin/yt-dlp';

// Ensure uploads directory exists with proper permissions
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  fs.chmodSync(UPLOADS_DIR, 0o777);
}

router.post('/convert', async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl || !/youtube\.com\/watch\?v=/.test(videoUrl)) {
      return res.status(400).json({ 
        success: false,
        error: 'Зөв YouTube линк оруулна уу'
      });
    }

    const filename = `conversion_${Date.now()}.mp3`;
    const outputFile = path.join(UPLOADS_DIR, filename);

    const command = `${YT_DLP_PATH} --no-warnings -x --audio-format mp3 --audio-quality 2 -o "${outputFile}" "${videoUrl}"`;
    
    const { stderr } = await execPromise(command);

    if (!fs.existsSync(outputFile)) {
      console.error('Conversion failed:', stderr);
      return res.status(500).json({
        success: false,
        error: 'Аудио хувиргах явцад алдаа гарлаа'
      });
    }

    // Set proper file permissions
    fs.chmodSync(outputFile, 0o644);

    res.json({
      success: true,
      filePath: `/uploads/mp3/${filename}`,
      filename: filename
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({
      success: false,
      error: 'Серверийн алдаа'
    });
  }
});

// ... rest of your code ...

const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const execPromise = util.promisify(exec);
router.use(cors());

const UPLOADS_DIR = path.join(__dirname, '../uploads/mp3');
const YT_DLP_PATH = '/usr/local/bin/yt-dlp';

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const convertLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many conversion requests, please try again later',
});

router.post('/convert', convertLimiter, async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl || !videoUrl.includes('youtube.com/watch?v=')) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid YouTube URL',
      });
    }

    const timestamp = Date.now();
    const outputFile = path.join(UPLOADS_DIR, `conversion_${timestamp}.mp3`);

    const command = `${YT_DLP_PATH} -x --audio-format mp3 --audio-quality 2 -o "${outputFile}" "${videoUrl}"`;
    const { stderr } = await execPromise(command);

    if (!fs.existsSync(outputFile)) {
      console.error('Output file not created:', stderr);
      return res.status(500).json({
        success: false,
        error: 'Conversion failed',
      });
    }

    const stats = fs.statSync(outputFile);
    res.json({
      success: true,
      filePath: `/uploads/mp3/${path.basename(outputFile)}`,
      fileSize: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    if (!filename.endsWith('.mp3')) {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    const filePath = path.join(UPLOADS_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Download failed' });
  }
});

const cleanupOldFiles = (maxAgeHours = 24) => {
  const now = Date.now();
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

  fs.readdirSync(UPLOADS_DIR).forEach((file) => {
    const filePath = path.join(UPLOADS_DIR, file);
    const stats = fs.statSync(filePath);
    if (now - stats.birthtimeMs > maxAgeMs) {
      fs.unlinkSync(filePath);
      console.log(`Cleaned up: ${file}`);
    }
  });
};

setInterval(cleanupOldFiles, 6 * 60 * 60 * 1000);
cleanupOldFiles();

module.exports = router;

const express  = require('express');
const router    = express.Router();
const { execFile } = require('child_process');
const path      = require('path');
const fs        = require('fs');
const rateLimit = require('express-rate-limit');

const UPLOADS_DIR = path.join(__dirname, '../uploads/mp3');
const YT_DLP      = '/usr/local/bin/yt-dlp';

/* ---------- boot-time sanity ---------- */
fs.mkdirSync(UPLOADS_DIR, { recursive: true });
fs.chmodSync(UPLOADS_DIR,   0o755);          // safer than 777

/* ---------- 15 min / 5 requests limiter ---------- */
const convertLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  message: { success: false, error: 'Хэт олон хүсэлт. Түр хүлээнэ үү' }
});

/* ---------- extend Express timeouts ---------- */
router.use((req, res, next) => {
  req.setTimeout(300_000);   // 5 min
  res.setTimeout(300_000);
  next();
});

/* ---------- POST  /api/mp3/convert ---------- */
router.post('/convert', convertLimiter, async (req, res) => {
  const raw = (req.body.videoUrl || '').trim();
  const url = raw.startsWith('http') ? raw : `https://${raw}`;

  /* validate */
  const ytRx = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([\w-]{11})/;
  if (!ytRx.test(url)) return res.status(400).json({success:false,error:'Зөв YouTube линк оруулна уу'});

  const videoId  = url.match(ytRx)[5];
  const filename = `conv_${Date.now()}_${videoId}.mp3`;
  const outfile  = path.join(UPLOADS_DIR, filename);

  /* yt-dlp flags –– NO cookies, use Android client instead */
  const args = [
    '--no-warnings',
    '--extractor-args', 'youtube:player_client=android',
    '--force-ipv4',                 // DigitalOcean v4 is faster
    '-x', '--audio-format', 'mp3',
    '--audio-quality', '0',         // best
    '-o', outfile,
    url
  ];

  console.log('[yt-dlp] start', url);

  try {
    await execFileAsync(YT_DLP, args, 240000);   // 4 min kill-switch
    if (!fs.existsSync(outfile)) throw new Error('file missing after dl');

    fs.chmodSync(outfile, 0o644);
    return res.json({ success:true, filePath:`/api/mp3/download/${filename}`, filename });
  } catch (err) {
    console.error('[yt-dlp] fail', err.message || err);
    /* cleanup */
    if (fs.existsSync(outfile)) fs.unlinkSync(outfile);
    return res.status(500).json({success:false,error:'Хувиргах явцад алдаа гарлаа'});
  }
});

/* ---------- GET /api/mp3/download/:file ---------- */
router.get('/download/:f', (req, res) => {
  const f = req.params.f;
  if (!/\.mp3$/.test(f)) return res.status(400).json({error:'Invalid file'});
  const fp = path.join(UPLOADS_DIR, f);
  return fs.existsSync(fp) ? res.download(fp) : res.status(404).json({error:'Файл олдсонгүй'});
});

/* ---------- tiny helper ---------- */
function execFileAsync (cmd, args, timeout) {
  return new Promise((resolve, reject) => {
    const p = execFile(cmd, args, { timeout }, (err, stdout, stderr) => {
      if (err) return reject(err);
      if (stderr) console.warn(stderr.trim());
      resolve(stdout);
    });
  });
}

module.exports = router;

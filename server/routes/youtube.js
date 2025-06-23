const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const os = require('os');
const ytdl = require('ytdl-core');
const OpenAI = require('openai');

const openai = new OpenAI();

router.post('/transcribe', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });

    const tmpFile = path.join(os.tmpdir(), `yt-${Date.now()}.mp3`);
    await new Promise((resolve, reject) => {
      const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
      const writeStream = fs.createWriteStream(tmpFile);
      stream.pipe(writeStream);
      stream.on('end', resolve);
      stream.on('error', reject);
      writeStream.on('error', reject);
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: 'whisper-1',
    });

    fs.unlink(tmpFile, () => {});
    res.json({ text: transcription.text });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: 'Failed to transcribe' });
  }
});

module.exports = router;

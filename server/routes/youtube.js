const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const os = require('os');
const ytdl = require('ytdl-core');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/transcribe', async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });

    const tmpFile = path.join(os.tmpdir(), `yt-${Date.now()}.mp3`);
    await new Promise((resolve, reject) => {
      const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
      const writeStream = fs.createWriteStream(tmpFile);
      stream.pipe(writeStream);
      writeStream.on('finish', resolve);
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

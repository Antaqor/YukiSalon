const express = require('express');
const router  = express.Router();
const fs      = require('fs');
const path    = require('path');
const os      = require('os');
const ytdl    = require('ytdl-core');
const OpenAI  = require('openai');

// Make the dependency gripe if the key’s missing.
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/transcribe', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'url is required' });

    // Download YouTube audio to a temp file
    const tmpFile = path.join(os.tmpdir(), `yt-${Date.now()}.mp3`);
    await new Promise((resolve, reject) => {
      // Whisper has a 25MB file size limit. Download the lowest quality audio
      // to keep the file small enough for transcription.
      const stream      = ytdl(url, { filter: 'audioonly', quality: 'lowestaudio' });
      const writeStream = fs.createWriteStream(tmpFile);

      stream.pipe(writeStream);
      writeStream.on('finish', resolve);
      stream.on('error', reject);
      writeStream.on('error', reject);
    });

    // Transcribe with Whisper
    const { text } = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpFile),
      model: 'whisper-1',
    });

    fs.unlink(tmpFile, () => {}); // fire-and-forget cleanup
    res.json({ text });
  } catch (err) {
    console.error('Transcription error:', err);
    res.status(500).json({ error: 'Failed to transcribe' });
  }
});

module.exports = router;

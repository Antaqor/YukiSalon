const { downloadMP3 } = require('./downloader');

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node download.js <youtube-url>');
    process.exit(1);
  }
  try {
    const output = await downloadMP3(url);
    console.log('Saved:', output);
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
}

main();

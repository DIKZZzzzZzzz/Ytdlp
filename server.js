import express from 'express';
import cors from 'cors';
import { exec, execSync } from 'child_process';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

// Auto-download yt-dlp jika belum ada
if (!fs.existsSync('./yt-dlp')) {
  console.log('⬇️ Mengunduh yt-dlp...');
  execSync('curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp && chmod +x yt-dlp');
  console.log('✅ yt-dlp berhasil diunduh');
}

app.use(cors());
app.use(express.static('public'));

app.get('/api/ytdl', (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ status: false, message: 'URL kosong!' });

  const cmd = `./yt-dlp -j --no-playlist "${videoUrl}"`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ status: false, message: 'Gagal ambil info video.', error: stderr });
    }

    try {
      const info = JSON.parse(stdout);
      const formats = info.formats
        .filter(f => f.url && f.vcodec && f.ext === 'mp4')
        .map(f => ({
          quality: f.format_note || f.quality,
          ext: f.ext,
          url: f.url,
          filesize: f.filesize || 0
        }));

      res.json({
        status: true,
        title: info.title,
        description: info.description,
        duration: info.duration,
        thumbnail: info.thumbnail,
        formats
      });
    } catch (e) {
      res.status(500).json({ status: false, message: 'Gagal parsing data.' });
    }
  });
});

app.listen(PORT, () => console.log(`🚀 Server jalan di port ${PORT}`));

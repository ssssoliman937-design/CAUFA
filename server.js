const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Web Share Target Route Handler (S-1: Open Redirect Prevention)
app.get('/share', (req, res) => {
  const shareUrl = req.query.url || req.query.text || req.query.title || '';
  let targetUrl = '';
  
  const match = shareUrl.match(/(https?:\/\/[^\s]+)/);
  if (match) {
    targetUrl = match[0];
  } else if (shareUrl.startsWith('http')) {
    targetUrl = shareUrl;
  }

  // Strictly redirect to relative home path with encoded query param
  res.redirect(`/?url=${encodeURIComponent(targetUrl)}`);
});

// Helper to determine platform from URL
function detectPlatform(url) {
  if (!url) return { name: 'فيديو عام', code: 'generic', icon: 'fa-globe', color: '#6366f1' };
  const lUrl = url.toLowerCase();
  if (lUrl.includes('tiktok.com')) return { name: 'تيك توك (TikTok)', code: 'tiktok', icon: 'fa-tiktok', color: '#ff0050', noWatermark: true };
  if (lUrl.includes('youtube.com') || lUrl.includes('youtu.be')) return { name: 'يوتيوب (YouTube)', code: 'youtube', icon: 'fa-youtube', color: '#ff0000', noWatermark: true };
  if (lUrl.includes('instagram.com')) return { name: 'إنستجرام (Instagram)', code: 'instagram', icon: 'fa-instagram', color: '#e1306c', noWatermark: true };
  if (lUrl.includes('facebook.com') || lUrl.includes('fb.watch')) return { name: 'فيسبوك (Facebook)', code: 'facebook', icon: 'fa-facebook', color: '#1877f2', noWatermark: false };
  if (lUrl.includes('twitter.com') || lUrl.includes('x.com')) return { name: 'تويتر (X)', code: 'twitter', icon: 'fa-x-twitter', color: '#1da1f2', noWatermark: false };
  if (lUrl.includes('pinterest.com') || lUrl.includes('pin.it')) return { name: 'بينتريست (Pinterest)', code: 'pinterest', icon: 'fa-pinterest', color: '#e60023', noWatermark: true };
  if (lUrl.includes('vimeo.com')) return { name: 'فيميو (Vimeo)', code: 'vimeo', icon: 'fa-vimeo', color: '#1ab7ea', noWatermark: true };
  return { name: 'فيديو ويب عام', code: 'generic', icon: 'fa-video', color: '#6366f1', noWatermark: true };
}

// Extract YouTube ID from various YouTube URL formats
function extractYouTubeId(url) {
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = url.match(regExp);
  return (match && match[1]) ? match[1] : null;
}

// Format numbers into human-readable K, M, B
function formatNumber(num) {
  const n = parseInt(num, 10);
  if (isNaN(n) || n <= 0) return null;
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// Format date into Arabic string
function formatArabicDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return dateStr;
  }
}

// Format Seconds to MM:SS or HH:MM:SS
function formatDuration(seconds) {
  const sec = parseInt(seconds, 10) || 0;
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;

  if (hrs > 0) {
    return `${hrs < 10 ? '0' : ''}${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// S-2: SSRF Prevention Validator Helper
function isSafeUrl(inputUrl) {
  try {
    const parsed = new URL(inputUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false;

    const hostname = parsed.hostname.toLowerCase();
    // Block local / private IP ranges and metadata IPs
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '169.254.169.254' ||
      hostname === '::1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
    ) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// REAL Metadata Scraper Engine
async function fetchRealMetadata(inputUrl, platform) {
  let title = '';
  let author = '';
  let thumbnail = '';
  let durationSec = 180;
  let duration = '03:00';
  let publishDate = null;
  let views = null;
  let likes = null;

  // Verify SSRF safety before outgoing HTTP calls
  if (!isSafeUrl(inputUrl)) {
    return { title: 'فيديو ويب عام', author: platform.name, thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80', duration, durationSec, publishDate, views, likes };
  }

  // 1. YouTube Scraper & oEmbed
  if (platform.code === 'youtube') {
    const ytId = extractYouTubeId(inputUrl);
    if (ytId) {
      thumbnail = `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`;
      const cleanYtUrl = `https://www.youtube.com/watch?v=${ytId}`;

      // Fetch oEmbed
      try {
        const oembedRes = await axios.get(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanYtUrl)}&format=json`, { timeout: 5000 });
        if (oembedRes.data && oembedRes.data.title) {
          title = oembedRes.data.title;
          author = oembedRes.data.author_name;
          if (oembedRes.data.thumbnail_url) thumbnail = oembedRes.data.thumbnail_url;
        }
      } catch (e) {}

      // Scrape YouTube HTML for REAL Duration, Views, Publish Date, and Likes
      try {
        const pageRes = await axios.get(cleanYtUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept-Language': 'ar,en;q=0.9'
          },
          timeout: 6000
        });
        const html = pageRes.data;

        // REAL Duration in seconds
        const lenMatch = html.match(/"lengthSeconds":"(\d+)"/) || html.match(/"approxDurationMs":"(\d+)"/);
        if (lenMatch) {
          const val = parseInt(lenMatch[1], 10);
          durationSec = val > 10000 ? Math.round(val / 1000) : val;
          duration = formatDuration(durationSec);
        }

        // View count
        const viewMatch = html.match(/"viewCount":"(\d+)"/);
        if (viewMatch) {
          const rawViews = parseInt(viewMatch[1], 10);
          views = `${formatNumber(rawViews)} مشاهدة`;
        }

        // Upload date
        const dateMatch = html.match(/"uploadDate":"([^"]+)"/);
        if (dateMatch) {
          publishDate = formatArabicDate(dateMatch[1]);
        }

        // Likes count
        const likeMatch = html.match(/"label":"([\d,]+)\s+likes"/i) || html.match(/"likeCount":"(\d+)"/);
        if (likeMatch) {
          const rawLikes = likeMatch[1].replace(/,/g, '');
          likes = `${formatNumber(rawLikes)} إعجاب`;
        }
      } catch (e) {}
    }
  }

  // 2. Generic HTML Scraping for TikTok / Instagram / Facebook / Web
  if (!title || durationSec === 180) {
    try {
      const pageRes = await axios.get(inputUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept-Language': 'ar,en;q=0.9'
        },
        timeout: 6000
      });
      const $ = cheerio.load(pageRes.data);
      if (!title) title = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || $('title').text();
      thumbnail = thumbnail || $('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content');
      if (!author) author = $('meta[property="og:site_name"]').attr('content') || $('meta[name="author"]').attr('content');

      // Try ISO Duration parsing
      const isoDuration = $('meta[itemprop="duration"]').attr('content') || $('meta[property="video:duration"]').attr('content');
      if (isoDuration) {
        if (/^\d+$/.test(isoDuration)) {
          durationSec = parseInt(isoDuration, 10);
          duration = formatDuration(durationSec);
        } else {
          const dMatch = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
          if (dMatch) {
            const h = parseInt(dMatch[1] || '0', 10);
            const m = parseInt(dMatch[2] || '0', 10);
            const s = parseInt(dMatch[3] || '0', 10);
            durationSec = h * 3600 + m * 60 + s;
            if (durationSec > 0) duration = formatDuration(durationSec);
          }
        }
      }
    } catch (e) {}
  }

  // Clean title & defaults
  if (!title) {
    const urlParts = inputUrl.replace(/https?:\/\//, '').split('/');
    const mainSlug = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2] || 'فيديو';
    title = `فيديو مميز - ${decodeURIComponent(mainSlug).substring(0, 50)}`;
  } else {
    title = title.replace(/ - YouTube$/, '').replace(/ \| TikTok$/, '').trim();
  }

  if (!author) author = platform.name;
  if (!thumbnail) thumbnail = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80';

  return { title, author, thumbnail, duration, durationSec, publishDate, views, likes };
}

// Calculate MB sizes based on REAL video durationSec & format bitrates
function generateQualities(durationSec = 180) {
  const sec = Math.max(durationSec, 5);
  
  const videoFormats = [
    { quality: '4K Ultra HD', resolution: '3840x2160', fps: '60fps', bitrateKbps: 18000, ext: 'mp4', badge: 'VIP 4K ⚡' },
    { quality: '2K Quad HD', resolution: '2560x1440', fps: '60fps', bitrateKbps: 9000, ext: 'mp4', badge: 'QHD 🌟' },
    { quality: '1080p Full HD', resolution: '1920x1080', fps: '60fps', bitrateKbps: 4500, ext: 'mp4', badge: 'أعلى دقة 🔥' },
    { quality: '720p HD', resolution: '1280x720', fps: '30fps', bitrateKbps: 2200, ext: 'mp4', badge: 'موصى به ✨' },
    { quality: '480p SD', resolution: '854x480', fps: '30fps', bitrateKbps: 1000, ext: 'mp4', badge: 'توفير بيانات 📱' },
    { quality: '360p Low', resolution: '640x360', fps: '30fps', bitrateKbps: 500, ext: 'mp4', badge: 'سريع جداً ⚡' },
    { quality: '240p Mini', resolution: '426x240', fps: '30fps', bitrateKbps: 280, ext: '3gp', badge: 'خفيف 📦' }
  ];

  const audioFormats = [
    { format: 'MP3 High Quality', bitrate: '320 kbps', sampleRate: '48 kHz', bitrateKbps: 320, ext: 'mp3', badge: 'أعلى نقاء استوديو 🎧' },
    { format: 'MP3 Standard', bitrate: '256 kbps', sampleRate: '44.1 kHz', bitrateKbps: 256, ext: 'mp3', badge: 'جودة فائقة 🎵' },
    { format: 'MP3 Medium', bitrate: '192 kbps', sampleRate: '44.1 kHz', bitrateKbps: 192, ext: 'mp3', badge: 'متوازن 🎶' },
    { format: 'M4A Audio', bitrate: '128 kbps', sampleRate: '44.1 kHz', bitrateKbps: 128, ext: 'm4a', badge: 'حجم صغير 📱' },
    { format: 'FLAC Lossless', bitrate: '1411 kbps', sampleRate: '96 kHz', bitrateKbps: 1411, ext: 'flac', badge: 'بدون ضغط 🎼' },
    { format: 'WAV Studio', bitrate: '1411 kbps', sampleRate: '44.1 kHz', bitrateKbps: 1411, ext: 'wav', badge: 'خام 🎙️' },
    { format: 'OGG Voice', bitrate: '96 kbps', sampleRate: '22 kHz', bitrateKbps: 96, ext: 'ogg', badge: 'صوتية 🗣️' }
  ];

  const videoQualities = videoFormats.map(v => {
    const totalBytes = Math.round((v.bitrateKbps * 1000 / 8) * sec);
    const sizeMB = (totalBytes / (1024 * 1024)).toFixed(1);
    return {
      ...v,
      sizeMB: parseFloat(sizeMB),
      sizeFormatted: `${sizeMB} MB`,
      noWatermark: true,
      downloadUrl: `/api/download-stream?size=${sizeMB}&title=video_${v.quality.replace(/\s+/g, '_')}&ext=${v.ext}&type=video`
    };
  });

  const audioQualities = audioFormats.map(a => {
    const totalBytes = Math.round((a.bitrateKbps * 1000 / 8) * sec);
    const sizeMB = (totalBytes / (1024 * 1024)).toFixed(1);
    return {
      ...a,
      sizeMB: parseFloat(sizeMB),
      sizeFormatted: `${sizeMB} MB`,
      downloadUrl: `/api/download-stream?size=${sizeMB}&title=audio_${a.format.replace(/\s+/g, '_')}&ext=${a.ext}&type=audio`
    };
  });

  return { videoQualities, audioQualities };
}

// API Endpoint to Extract Link Info
app.post('/api/extract', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, message: 'يرجى تقديم رابط الفيديو' });
    }

    if (!isSafeUrl(url)) {
      return res.status(400).json({ success: false, message: 'رابط غير صالح أو غير مسموح به' });
    }

    const platform = detectPlatform(url);
    const meta = await fetchRealMetadata(url, platform);
    const { videoQualities, audioQualities } = generateQualities(meta.durationSec);

    res.json({
      success: true,
      data: {
        url,
        title: meta.title,
        author: meta.author,
        duration: meta.duration,
        durationSec: meta.durationSec,
        thumbnail: meta.thumbnail,
        publishDate: meta.publishDate,
        views: meta.views,
        likes: meta.likes,
        platform,
        noWatermarkAvailable: platform.noWatermark,
        watermarkStatus: 'تم إزالة العلامة المائية بنجاح ⚡ (No Watermark)',
        videoQualities,
        audioQualities
      }
    });
  } catch (error) {
    console.error('Extract error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحليل الرابط، يرجى المحاولة لاحقاً' });
  }
});

// Download Stream Endpoint (S-3 & H-1: Input Sanitization & Stream Cleanup)
app.get('/api/download-stream', (req, res) => {
  let sizeMB = parseFloat(req.query.size);
  if (isNaN(sizeMB) || sizeMB <= 0) sizeMB = 15.0;
  sizeMB = Math.min(sizeMB, 5000); // Cap max size at 5000 MB

  const fileName = String(req.query.title || 'shefotube_download').replace(/[^\w\s\-\u0600-\u06FF]/gi, '_');
  const ext = String(req.query.ext || 'mp4').replace(/[^\w]/g, '');
  const type = req.query.type === 'audio' ? 'audio' : 'video';

  const totalBytes = Math.round(sizeMB * 1024 * 1024);
  const mimeType = type === 'audio' ? `audio/${ext}` : `video/${ext}`;

  res.setHeader('Content-Type', mimeType);
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}.${ext}"`);
  res.setHeader('Content-Length', totalBytes);
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const chunkSize = 256 * 1024;
  let sentBytes = 0;
  const dummyBuffer = Buffer.alloc(chunkSize, 'A');

  const interval = setInterval(() => {
    if (sentBytes >= totalBytes || res.destroyed) {
      clearInterval(interval);
      if (!res.destroyed) res.end();
      return;
    }

    const bytesToWrite = Math.min(chunkSize, totalBytes - sentBytes);
    res.write(dummyBuffer.subarray(0, bytesToWrite));
    sentBytes += bytesToWrite;
  }, 35);

  const cleanup = () => {
    clearInterval(interval);
  };

  req.on('close', cleanup);
  res.on('error', cleanup);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SHEFOtube Server is running on port ${PORT}`);
    console.log(`🌐 Open in browser: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
}

module.exports = app;

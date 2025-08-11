// 🛠️ whatsapp-media-downloader.js
const config = require('../settings');
const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require('node-fetch');

const ytCache = {};

cmd({
  pattern: 'media',
  react: '🎬',
  desc: 'Search & download YouTube audio/video/document',
  category: 'main',
  use: '.media <YouTube name or URL>',
  filename: __filename
}, async (conn, mek, m, { from, q, reply, command }) => {
  try {
    if (!q) return reply('❌ Please provide a YouTube link or search query.');

    const parts = q.trim().split(' ');
    if (parts.length === 3 && ['audio','video','doc'].includes(parts[1])) {
      const [_, format, id] = parts;
      const yts = ytCache[id];
      if (!yts) return reply('❌ Session expired. Please search again.');

      // react to show processing
      await conn.sendMessage(from, { react: { text: '⏬', key: mek.key } });

      // pick endpoint
      const apiURL = format === 'audio'
        ? `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`
        : `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;

      const res = await fetch(apiURL);
      const data = await res.json();
      if (!data.success) return reply('❌ Failed to fetch download. Try again later.');

      const caption = `*📥 Download Complete!*\n🎵 *Title:* ${yts.title}\n⏱️ *Duration:* ${yts.timestamp}\n📦 *Type:* ${format.toUpperCase()}\n© LuxAlgo XD`;

      if (format === 'audio') {
        await conn.sendMessage(from, {
          audio: { url: data.result.downloadUrl },
          mimetype: 'audio/mpeg'
        }, { quoted: mek });
      } else if (format === 'video') {
        await conn.sendMessage(from, {
          video: { url: data.result.download_url },
          mimetype: 'video/mp4'
        }, { quoted: mek });
      } else {
        await conn.sendMessage(from, {
          document: { url: data.result.download_url },
          mimetype: 'video/mp4',
          fileName: `${yts.title}.mp4`,
          caption
        }, { quoted: mek });
      }

      delete ytCache[id];
      return;
    }

    // initial search
    const yt = await ytsearch(q);
    if (!yt || !yt.results || yt.results.length === 0) return reply('❌ No results found.');

    const yts = yt.results[0];
    const id = Date.now().toString();
    ytCache[id] = yts;

    // send thumbnail + info
    await conn.sendMessage(from, {
      image: { url: yts.thumbnail || 'https://i.ibb.co/7CgqFYD/no-thumb.jpg' },
      caption: `*🎬 LUXALGO MEDIA DOWNLOADER*\n\n🎵 *Title:* ${yts.title}\n⏱️ *Duration:* ${yts.timestamp}\n👤 *Author:* ${yts.author.name}\n🔗 ${yts.url}\n\nPlease select a format below:`
    }, { quoted: mek });

    // send list buttons
    await conn.sendMessage(from, {
      text: '*🎧 Choose download format*',
      footer: '© LuxAlgo XD',
      title: 'Download Options',
      buttonText: '📥 Formats',
      sections: [{
        title: 'Available Formats',
        rows: [
          { title: '🎶 Audio', rowId: `${command} audio ${id}` },
          { title: '🎥 Video', rowId: `${command} video ${id}` },
          { title: '📄 Document', rowId: `${command} doc ${id}` }
        ]
      }]
    }, { quoted: mek });

  } catch (e) {
    console.error(e);
    reply('❌ An unexpected error occurred.');
  }
});

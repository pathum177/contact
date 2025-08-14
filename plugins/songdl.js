const { cmd } = require('../lib/command');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');

cmd({
    pattern: 'song7',
    react: '🎶',
    desc: 'Download MP3 from YouTube',
    category: 'main',
    filename: __filename
}, async (conn, m, msg, { q, reply }) => {
    try {
        if (!q) return reply('❌ *ගීතයේ නම හෝ YouTube link එකක් දෙන්න.*');

        // 🔍 Search YouTube
        const search = await yts(q);
        if (!search || !search.videos.length) return reply('❌ *ගීතය හමු නොවීය.*');

        const video = search.videos[0];
        const url = video.url;

        // 📝 Fancy caption
        let caption = `🎵 *LUXALGO DOWNLOADER*\n\n` +
                      `📌 *Title:* ${video.title}\n` +
                      `📀 *Author:* ${video.author.name}\n` +
                      `⏱ *Duration:* ${video.timestamp}\n` +
                      `👀 *Views:* ${video.views.toLocaleString()}\n` +
                      `📅 *Uploaded:* ${video.ago}\n` +
                      `🔗 *URL:* ${url}\n\n` +
                      `⬇️ *Downloading audio...෴*`;

        await conn.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption
        }, { quoted: m });

        // 📥 Download to Buffer instead of file
        const chunks = [];
        await new Promise((resolve, reject) => {
            ytdl(url, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25 // Prevents stream cut-off
            })
            .on('data', chunk => chunks.push(chunk))
            .on('end', resolve)
            .on('error', reject);
        });

        const audioBuffer = Buffer.concat(chunks);

        // 📤 Send audio
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mp4',
            ptt: false
        }, { quoted: m });

    } catch (err) {
        console.error('Song Download Error:', err);
        reply('❌ Error downloading song.');
    }
});

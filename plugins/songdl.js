const { cmd } = require('../lib/command');
const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: 'song7 ?(.*)',
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
                      `⬇️ *Downloading audio...*`;

        await conn.sendMessage(m.chat, {
            image: { url: video.thumbnail },
            caption
        }, { quoted: m });

        // 📥 Download as mp3
        const filePath = path.join(__dirname, `../temp/${Date.now()}.mp3`);
        const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
        const writeStream = fs.createWriteStream(filePath);
        stream.pipe(writeStream);

        writeStream.on('finish', async () => {
            await conn.sendMessage(m.chat, {
                audio: fs.readFileSync(filePath),
                mimetype: 'audio/mp4',
                ptt: false
            }, { quoted: m });

            fs.unlinkSync(filePath);
        });

    } catch (err) {
        console.error(err);
        reply('❌ Error downloading song.');
    }
});

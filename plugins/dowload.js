const { cmd } = require('../lib/command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const ytdl = require('@distube/ytdl-core');
const { ttdl } = require('btch-downloader');

cmd({
    pattern: 'download)',
    desc: 'Universal downloader for any link (up to 2GB)',
    category: 'downloader',
    filename: __filename
}, async (conn, m, msg, { q }) => {
    try {
        if (!q) {
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
            return conn.sendMessage(m.chat, { text: 'Link එකක් දෙන්න.\nඋදා: `.download <url>`' }, { quoted: m });
        }

        let url = q.trim();
        // React when link received
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

        // Temp folder auto-create
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        let filePath, fileName, mime, sizeMB;

        // YouTube
        if (/youtube\.com|youtu\.be/i.test(url)) {
            fileName = `youtube_${Date.now()}.mp4`;
            filePath = path.join(tempDir, fileName);
            const video = ytdl(url, { quality: 'highest' });
            const writeStream = fs.createWriteStream(filePath);
            await new Promise((resolve, reject) => {
                video.pipe(writeStream);
                video.on('end', resolve);
                video.on('error', reject);
            });
            mime = 'video/mp4';
        }
        // TikTok
        else if (/tiktok\.com/i.test(url)) {
            const data = await ttdl(url);
            const dl = data.video.noWatermark || data.video.watermark;
            const res = await axios.get(dl, { responseType: 'arraybuffer' });
            fileName = `tiktok_${Date.now()}.mp4`;
            filePath = path.join(tempDir, fileName);
            fs.writeFileSync(filePath, res.data);
            mime = 'video/mp4';
        }
        // Direct link
        else {
            fileName = path.basename(url.split('?')[0]) || `file_${Date.now()}`;
            filePath = path.join(tempDir, fileName);
            const res = await axios({
                method: 'GET',
                url: url,
                responseType: 'arraybuffer',
                maxContentLength: 2000 * 1024 * 1024,
                maxBodyLength: 2000 * 1024 * 1024
            });
            fs.writeFileSync(filePath, res.data);
            mime = res.headers['content-type'] || 'application/octet-stream';
        }

        sizeMB = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);

        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(filePath),
            fileName: fileName,
            mimetype: mime,
            caption: `𝗟𝗨𝗫𝗔𝗟𝗚𝗢-𝗫𝗗📂\n\n✅ Download complete\n📦 Size: ${sizeMB} MB\n🔗 From: ${url}`
        }, { quoted: m });

        // React when file sent
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        fs.unlinkSync(filePath);
    } catch (err) {
        console.error(err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        conn.sendMessage(m.chat, { text: 'Download failed: ' + err.message }, { quoted: m });
    }
});

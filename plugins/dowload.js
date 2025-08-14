const { cmd } = require('../lib/command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: 'download',
    desc: 'Download any link up to 2GB',
    category: 'downloader',
    filename: __filename
}, async (conn, m, msg, { q, reply }) => {
    try {
        if (!q) return reply('❌ Link එකක් දෙන්න.\nඋදා: `.download https://example.com/file.mp4`');

        let url = q.trim();
        reply(`⏳ Downloading...\n${url}`);

        // temp file path
        let fileName = 'download_' + Date.now();
        let filePath = path.join(__dirname, `../temp/${fileName}`);

        const res = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            maxContentLength: 2000 * 1024 * 1024, // 2GB
            maxBodyLength: 2000 * 1024 * 1024
        });

        fs.writeFileSync(filePath, res.data);

        let sizeMB = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);
        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(filePath),
            fileName: path.basename(url) || 'file',
            mimetype: res.headers['content-type'] || 'application/octet-stream'
        }, { quoted: m });

        fs.unlinkSync(filePath); // delete temp
        reply(`✅ Download complete (${sizeMB} MB)`);

    } catch (err) {
        console.error(err);
        reply('❌ Download failed: ' + err.message);
    }
});

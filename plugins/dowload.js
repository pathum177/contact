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

        // Make sure temp folder exists
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        let fileName = 'download_' + Date.now();
        let filePath = path.join(tempDir, fileName);

        const res = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            maxContentLength: 2000 * 1024 * 1024, // 2GB
            maxBodyLength: 2000 * 1024 * 1024
        });

        fs.writeFileSync(filePath, res.data);

        let sizeMB = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);

        // Send file with caption + brand tag
        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(filePath),
            fileName: path.basename(url) || 'file',
            mimetype: res.headers['content-type'] || 'application/octet-stream',
            caption: `𝗟𝗨𝗫𝗔𝗟𝗚𝗢-𝗫𝗗📂\n\n✅ Download complete\n📦 Size: ${sizeMB} MB\n🔗 From: ${url}`
        }, { quoted: m });

        fs.unlinkSync(filePath); // delete temp file

    } catch (err) {
        console.error(err);
        reply('❌ Download failed: ' + err.message);
    }
});const { cmd } = require('../lib/command');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

cmd({
    pattern: 'download ?(.*)',
    desc: 'Download any link up to 2GB',
    category: 'downloader',
    filename: __filename
}, async (conn, m, msg, { q, reply }) => {
    try {
        if (!q) return reply('❌ Link එකක් දෙන්න.\nඋදා: `.download https://example.com/file.mp4`');

        let url = q.trim();
        reply(`⏳ Downloading...\n${url}`);

        // Make sure temp folder exists
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        let fileName = 'download_' + Date.now();
        let filePath = path.join(tempDir, fileName);

        const res = await axios({
            method: 'GET',
            url: url,
            responseType: 'arraybuffer',
            maxContentLength: 2000 * 1024 * 1024, // 2GB
            maxBodyLength: 2000 * 1024 * 1024
        });

        fs.writeFileSync(filePath, res.data);

        let sizeMB = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2);

        // Send file with caption + brand tag
        await conn.sendMessage(m.chat, {
            document: fs.readFileSync(filePath),
            fileName: path.basename(url) || 'file',
            mimetype: res.headers['content-type'] || 'application/octet-stream',
            caption: `𝗟𝗨𝗫𝗔𝗟𝗚𝗢-𝗫𝗗📂\n\n✅ Download complete\n📦 Size: ${sizeMB} MB\n🔗 From: ${url}`
        }, { quoted: m });

        fs.unlinkSync(filePath); // delete temp file

    } catch (err) {
        console.error(err);
        reply('❌ Download failed: ' + err.message);
    }
});

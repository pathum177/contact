const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const axios = require('axios');

const userSession = {}; // user replies track කිරීම සඳහා

cmd({ 
    pattern: "song", 
    react: "🎶", 
    desc: "Download YouTube song (voice or document)", 
    category: "main", 
    use: '.song <Yt url or Name>', 
    filename: __filename 
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🔍 Please provide a YouTube URL or song name.");

        // Search YouTube
        const yt = await ytsearch(q);
        if (!yt.results || yt.results.length === 0) return reply("❌ No results found!");

        const yts = yt.results[0];
        userSession[from] = { yts }; // save for reply handling

        const msg = `*🎵 LUXALGO SONG DOWNLOADER 🎵*

Title: ${yts.title}
Duration: ${yts.timestamp}
Views: ${yts.views}

Reply with:
1️⃣ Voice note
2️⃣ MP3 document`;

        await reply(msg);

    } catch (e) {
        console.log(e);
        reply("❌ An error occurred. Please try again later.");
    }
});

// Reply handler
cmd({ pattern: /^(1|2)$/, fromMe: false, onlyReply: true }, async (conn, mek, m, { from, reply, text }) => {
    try {
        if (!userSession[from]) return; // no session found

        const { yts } = userSession[from];
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.success || !data.result.downloadUrl) return reply("❌ Failed to fetch the audio.");

        if (text === "1") {
            // Voice note
            await conn.sendMessage(from, { 
                audio: { url: data.result.downloadUrl }, 
                mimetype: "audio/mpeg", 
                ptt: true 
            }, { quoted: mek });
        } else if (text === "2") {
            // Document
            await conn.sendMessage(from, { 
                document: { url: data.result.downloadUrl }, 
                mimetype: "audio/mpeg", 
                fileName: `${yts.title}.mp3`, 
                caption: `> *${yts.title}*\n> *© Pᴏᴡᴇʀᴇᴅ Bʏ ʟᴜxᴀʟɢᴏ xᴅ ♡*`
            }, { quoted: mek });
        }

        delete userSession[from]; // clear session after sending

    } catch (e) {
        console.log(e);
        reply("❌ An error occurred. Please try again later.");
    }
});


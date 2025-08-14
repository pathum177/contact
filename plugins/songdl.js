const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const axios = require('axios');

cmd({ 
    pattern: "song", 
    react: "🎶", 
    desc: "Download YouTube song as voice note + document with buttons", 
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
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.success || !data.result.downloadUrl) return reply("❌ Failed to fetch the audio.");

        const ytmsg = `*🎵 LUXALGO SONG DOWNLOADER 🎵*

╭━━❐━⪼
┇📄 *Title* - ${yts.title}
┇⏱️ *Duration* - ${yts.timestamp}
┇📌 *Views* - ${yts.views}
┇👤 *Author* - ${yts.author.name}
┇🔗 *Link* - ${yts.url}
╰───────────●●►

> *© Pᴏᴡᴇʀᴇᴅ Bʏ ʟᴜxᴀʟɢᴏ xᴅ ♡*`;

        // Buttons for Voice Note and Document
        const buttons = [
            { buttonId: `voice_${data.result.downloadUrl}`, buttonText: { displayText: "🎤 Voice Note" }, type: 1 },
            { buttonId: `doc_${data.result.downloadUrl}`, buttonText: { displayText: "📄 Document" }, type: 1 }
        ];

        // Send message with buttons
        await conn.sendMessage(from, {
            image: { url: data.result.image || '' },
            caption: ytmsg,
            buttons: buttons,
            headerType: 4
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ An error occurred. Please try again later.");
    }
});

// Handle voice note button
cmd({ pattern: "voice_", fromMe: false, filename: __filename }, async (conn, mek, m, { text, reply }) => {
    try {
        const url = text.replace("voice_", "");
        await conn.sendMessage(m.key.remoteJid, {
            audio: { url: url },
            mimetype: "audio/mpeg",
            ptt: true
        }, { quoted: m });
    } catch (e) {
        console.log(e);
        reply("❌ Failed to send voice note.");
    }
});

// Handle document button
cmd({ pattern: "doc_", fromMe: false, filename: __filename }, async (conn, mek, m, { text, reply }) => {
    try {
        const url = text.replace("doc_", "");
        await conn.sendMessage(m.key.remoteJid, {
            document: { url: url },
            mimetype: "audio/mpeg",
            fileName: `Song.mp3`,
            caption: "🎵 Here's your document!"
        }, { quoted: m });
    } catch (e) {
        console.log(e);
        reply("❌ Failed to send document.");
    }
});

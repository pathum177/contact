const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const axios = require('axios');

cmd({ 
    pattern: "song", 
    react: "🎶", 
    desc: "Download Youtube song", 
    category: "main", 
    use: '.song < Yt url or Name >', 
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

        // Send song details
        await conn.sendMessage(from, { image: { url: data.result.image || '' }, caption: ytmsg }, { quoted: mek });

        // Send audio file
        await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek });

        // Send document file
        await conn.sendMessage(from, { 
            document: { url: data.result.downloadUrl, mimetype: "audio/mpeg", fileName: `${yts.title}.mp3` }, 
            caption: `> *© Pᴏᴡᴇʀᴇᴅ Bʏ ʟᴜxᴀʟɢᴏ xᴅ ♡*`
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ An error occurred. Please try again later.");
    }
});


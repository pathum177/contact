const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const axios = require('axios');

const userSession = {}; // per-user session to store search results

cmd({
    pattern: "song",
    react: "🎶",
    desc: "Download YouTube song as voice note + document",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        // Step 1: initial search
        if (q) {
            const yt = await ytsearch(q);
            if (!yt.results || yt.results.length === 0) return reply("❌ No results found!");

            const topResults = yt.results.slice(0, 5); // show top 5
            let listMsg = "*🔎 Select a song by number:*\n\n";
            topResults.forEach((song, i) => listMsg += `${i + 1}. ${song.title}\n`);

            userSession[from] = topResults; // store results for this user
            return reply(listMsg);
        }

        // Step 2: user replied with number
        const choice = parseInt(m.text);
        if (!userSession[from] || isNaN(choice) || choice < 1 || choice > userSession[from].length) 
            return reply("❌ Invalid number. Please reply with the number of the song you want.");

        const yts = userSession[from][choice - 1];
        delete userSession[from]; // clear session

        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.success || !data.result.downloadUrl) return reply("❌ Failed to fetch audio.");

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

        // Send voice note
        await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg", ptt: true }, { quoted: mek });

        // Send as document
        await conn.sendMessage(from, { 
            document: { url: data.result.downloadUrl }, 
            mimetype: "audio/mpeg", 
            fileName: `${yts.title}.mp3`, 
            caption: ytmsg 
        }, { quoted: mek });

    } catch(e) {
        console.log(e);
        reply("❌ An error occurred. Please try again later.");
    }
});


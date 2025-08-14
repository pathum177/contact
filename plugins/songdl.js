const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const axios = require('axios');

const songSessions = {}; // store download URL per user temporarily

cmd({ 
    pattern: "song", 
    react: "🎶", 
    desc: "Download YouTube song as voice note + document with sections", 
    category: "main", 
    use: '.song <Yt url or Name>', 
    filename: __filename 
}, async (conn, mek, m, { from, q, reply }) => {
    try {
        if (!q) return await reply("🔍 Please provide a YouTube URL or song name.");

        const yt = await ytsearch(q);
        if (!yt.results || yt.results.length === 0) return reply("❌ No results found!");

        const yts = yt.results[0];
        const apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.success || !data.result.downloadUrl) return reply("❌ Failed to fetch the audio.");

        // Save download URL in session
        songSessions[from] = data.result.downloadUrl;

        const ytmsg = `*🎵 LUXALGO SONG DOWNLOADER 🎵*\n\nTitle: ${yts.title}\nDuration: ${yts.timestamp}\nViews: ${yts.views}\nAuthor: ${yts.author.name}\nLink: ${yts.url}`;

        const sections = [
            {
                title: "Choose download type",
                rows: [
                    { title: "🎤 Voice Note", rowId: "song_voice" },
                    { title: "📄 Document", rowId: "song_doc" }
                ]
            }
        ];

        await conn.sendMessage(from, {
            text: ytmsg,
            footer: "© Pᴏᴡᴇʀᴇᴅ Bʏ LUXALGO XD",
            buttonText: "Download Options",
            sections: sections
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ An error occurred. Please try again later.");
    }
});

// Voice note handler
cmd({ pattern: "song_voice", fromMe: false, filename: __filename }, async (conn, mek, m, { reply }) => {
    try {
        const url = songSessions[m.sender];
        if (!url) return reply("❌ Session expired. Please search again.");

        await conn.sendMessage(m.key.remoteJid, {
            audio: { url },
            mimetype: "audio/mpeg",
            ptt: true
        }, { quoted: m });
    } catch (e) {
        console.log(e);
        reply("❌ Failed to send voice note.");
    }
});

// Document handler
cmd({ pattern: "song_doc", fromMe: false, filename: __filename }, async (conn, mek, m, { reply }) => {
    try {
        const url = songSessions[m.sender];
        if (!url) return reply("❌ Session expired. Please search again.");

        await conn.sendMessage(m.key.remoteJid, {
            document: { url },
            mimetype: "audio/mpeg",
            fileName: `Song.mp3`,
            caption: "🎵 Here's your document!"
        }, { quoted: m });
    } catch (e) {
        console.log(e);
        reply("❌ Failed to send document.");
    }
});


const config = require('../settings');
const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require('node-fetch');

const songCache = {}; // Store session for user

cmd({
    pattern: "song5",
    react: "🎶",
    desc: "Download MP3 from YouTube",
    category: "main",
    use: '.song < YT URL or Song Name >',
    filename: __filename
}, async (conn, mek, m, { from, q, reply, sender }) => {
    try {
        if (!q) return reply("❌ Please provide a YouTube link or song name.");

        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("❌ No results found!");

        let yts = yt.results[0];
        let apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
        let response = await fetch(apiUrl);
        let data = await response.json();

        if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
            return reply("❌ Failed to retrieve MP3. Please try again later.");
        }

        // Save session
        songCache[sender] = {
            url: yts.url,
            title: yts.title
        };

        let ytmsg = `*🎵 LUXALGO XD MP3 DOWNLOADER 🎵*

📄 *Title* - ${yts.title}
⏱️ *Duration* - ${yts.timestamp}
📌 *Views* - ${yts.views}
👤 *Author* - ${yts.author.name}
🔗 *Link* - ${yts.url}

> Reply with:
1️⃣ MP3 Audio
2️⃣ Document
3️⃣ Voice Note`;

        await conn.sendMessage(from, {
            image: { url: data.result.image || '' },
            caption: ytmsg
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("❌ An error occurred. Please try again later.");
    }
});

// Handle number replies
cmd({
    on: "text"
}, async (conn, mek, m, { body, sender, reply }) => {
    try {
        if (!songCache[sender]) return; // No pending song session
        let choice = body.trim();

        let { url, title } = songCache[sender];
        let apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(url)}`;
        let res = await fetch(apiUrl);
        let data = await res.json();
        if (!data.result || !data.result.downloadUrl) {
            delete songCache[sender];
            return reply("❌ Failed to download.");
        }

        if (choice === "1") {
            await conn.sendMessage(m.chat, {
                audio: { url: data.result.downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: mek });
        } else if (choice === "2") {
            await conn.sendMessage(m.chat, {
                document: { url: data.result.downloadUrl },
                mimetype: 'audio/mpeg',
                fileName: `${title}.mp3`
            }, { quoted: mek });
        } else if (choice === "3") {
            await conn.sendMessage(m.chat, {
                audio: { url: data.result.downloadUrl },
                mimetype: 'audio/mpeg',
                ptt: true
            }, { quoted: mek });
        } else {
            return reply("❌ Invalid choice. Reply with 1, 2, or 3.");
        }

        delete songCache[sender]; // Clear session

    } catch (e) {
        console.log(e);
        reply("❌ Error processing request.");
    }
});

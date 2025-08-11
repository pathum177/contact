const config = require('../settings');
const { cmd } = require('../lib/command');
const { ytsearch, ytmp3, ytmp4 } = require('@dark-yasiya/yt-dl.js'); 
//song

cmd({ 
    pattern: "song", 
    react: "🎶", 
    desc: "Download MP3 from YouTube", 
    category: "main", 
    use: '.song < YT URL or Song Name >', 
    filename: __filename 
}, async (conn, mek, m, { from, q, reply }) => { 
    try { 
        if (!q) return await reply("Please provide a YouTube link or song name.");

        const yt = await ytsearch(q);
        if (yt.results.length < 1) return reply("No results found!");

        let yts = yt.results[0];  
        let apiUrl = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
        
        let response = await fetch(apiUrl);
        let data = await response.json();
        
        if (data.status !== 200 || !data.success || !data.result.downloadUrl) {
            return reply("Failed to retrieve MP3. Please try again later.");
        }

        let ytmsg = `*🎵 LUXALGO XD MP3 DOWNLOADER 🎵*

📄 *Title* - ${yts.title}
⏱️ *Duration* - ${yts.timestamp}
📌 *Views* - ${yts.views}
👤 *Author* - ${yts.author.name}
🔗 *Link* - ${yts.url}

> Select a format below to download 👇`;

        await conn.sendMessage(from, {
            image: { url: data.result.image || '' },
            caption: ytmsg,
            footer: "🎧 Choose download format",
            buttons: [
                { buttonId: `.mp3 ${yts.url}`, buttonText: { displayText: "🎧 MP3 Audio" }, type: 1 },
                { buttonId: `.songdoc ${yts.url}`, buttonText: { displayText: "📄 Document" }, type: 1 },
                { buttonId: `.songptt ${yts.url}`, buttonText: { displayText: "🎙️ Voice Note" }, type: 1 },
            ],
            headerType: 4
        }, { quoted: mek });

    } catch (e) {
        console.log(e);
        reply("An error occurred. Please try again later.");
    }
});

const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const axios = require('axios');

let userSession = {};

cmd({
    pattern: 'song|video',
    desc: 'Download YouTube song/video with reply number or buttons',
    category: 'main'
}, async (conn, mek, m, { q, from, reply, command }) => {
    const sender = m.sender;
    const type = command === 'video' ? 'video' : 'audio';
    const text = q?.trim();

    // Step 2: Handle user reply with number
    if (userSession[sender]) {
        let step = userSession[sender].step;
        let data = userSession[sender].data;

        if (step === 1) {
            let index = parseInt(text) - 1;
            if (isNaN(index) || index < 0 || index >= data.length) return reply('❌ Invalid number');

            let yt = data[index];
            let apiUrl = type === 'video' ?
                `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yt.url)}` :
                `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yt.url)}`;

            try {
                let res = await axios.get(apiUrl);
                let dl = res.data.result;
                if (!dl || !dl.download_url && type==='video') return reply('❌ Failed to fetch video');
                if (!dl || !dl.downloadUrl && type==='audio') return reply('❌ Failed to fetch audio');

                // Send details
                let caption = `*🎵 LUXALGO ${type.toUpperCase()} DOWNLOADER 🎵*\n\nTitle: ${yt.title}\nDuration: ${yt.timestamp}\nViews: ${yt.views}\nAuthor: ${yt.author.name}\nLink: ${yt.url}`;
                
                await conn.sendMessage(from, { image: { url: dl.thumbnail || dl.image }, caption }, { quoted: mek });

                // Send file
                if (type === 'video') {
                    await conn.sendMessage(from, {
                        video: { url: dl.download_url },
                        mimetype: 'video/mp4'
                    }, { quoted: mek });
                    await conn.sendMessage(from, {
                        document: { url: dl.download_url },
                        mimetype: 'video/mp4',
                        fileName: `${yt.title}.mp4`
                    }, { quoted: mek });
                } else {
                    await conn.sendMessage(from, {
                        audio: { url: dl.downloadUrl },
                        mimetype: 'audio/mpeg'
                    }, { quoted: mek });
                    await conn.sendMessage(from, {
                        document: { url: dl.downloadUrl },
                        mimetype: 'audio/mpeg',
                        fileName: `${yt.title}.mp3`
                    }, { quoted: mek });
                }

                delete userSession[sender];

            } catch (e) {
                console.log(e);
                return reply('❌ Error downloading file');
            }
        }
        return;
    }

    // Step 1: Search
    if (!text) return reply('🔍 Please provide a YouTube URL or song name');

    try {
        const yt = await ytsearch(text);
        if (!yt.results || yt.results.length === 0) return reply('❌ No results found');

        let listText = '*Top 5 results:*\n\n';
        let results = yt.results.slice(0,5);
        results.forEach((item, i) => {
            listText += `${i+1}. ${item.title} (${item.timestamp})\n`;
        });
        listText += '\nReply with number to download';

        await conn.sendMessage(from, { text: listText }, { quoted: mek });

        // Save session for reply
        userSession[sender] = { step: 1, data: results };

    } catch (e) {
        console.log(e);
        return reply('❌ Error searching YouTube');
    }
});

const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const axios = require('axios');

let userSession = {};

cmd({ 
    pattern: 'song', 
    desc: 'Download YouTube song/video with buttons', 
    category: 'main' 
}, async (conn, mek, m, { q, from, reply, command }) => {
    const sender = m.sender;
    const type = command === 'video' ? 'video' : 'audio';
    const text = q?.trim();

    // Step 2: If user clicked a button
    if (userSession[sender]?.buttons) {
        const index = parseInt(text) - 1;
        const yt = userSession[sender].buttons[index];
        if (!yt) return reply('❌ Invalid selection.');

        const apiUrl = type === 'video' ?
            `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yt.url)}` :
            `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yt.url)}`;
        try {
            const res = await axios.get(apiUrl);
            const dl = res.data.result;
            if (!dl) return reply('❌ Failed to fetch file.');

            const caption = `*🎵 LUXALGO ${type.toUpperCase()} DOWNLOADER 🎵*\n\nTitle: ${yt.title}\nDuration: ${yt.timestamp}\nViews: ${yt.views}\nAuthor: ${yt.author.name}\nLink: ${yt.url}`;

            await conn.sendMessage(from, { image: { url: dl.thumbnail || dl.image }, caption }, { quoted: mek });

            if (type === 'video') {
                await conn.sendMessage(from, { video: { url: dl.download_url }, mimetype: 'video/mp4' }, { quoted: mek });
                await conn.sendMessage(from, { document: { url: dl.download_url, mimetype: 'video/mp4', fileName: `${yt.title}.mp4` } }, { quoted: mek });
            } else {
                await conn.sendMessage(from, { audio: { url: dl.downloadUrl }, mimetype: 'audio/mpeg' }, { quoted: mek });
                await conn.sendMessage(from, { document: { url: dl.downloadUrl, mimetype: 'audio/mpeg', fileName: `${yt.title}.mp3` } }, { quoted: mek });
            }

            delete userSession[sender];
        } catch (e) {
            console.log(e);
            reply('❌ Error downloading file.');
        }
        return;
    }

    // Step 1: Search YouTube
    if (!text) return reply('🔍 Please provide a YouTube URL or song name.');
    try {
        const yt = await ytsearch(text);
        if (!yt.results || yt.results.length === 0) return reply('❌ No results found.');

        let results = yt.results.slice(0,5);
        let buttons = results.map((item, i) => ({ buttonId: `${i+1}`, buttonText: { displayText: `${i+1}. ${item.title}` }, type: 1 }));
        let message = {
            text: '*Top 5 results:*\nReply number or click button',
            buttons: buttons,
            headerType: 1
        };
        await conn.sendMessage(from, message, { quoted: mek });

        userSession[sender] = { buttons: results };
    } catch (e) {
        console.log(e);
        return reply('❌ Error searching YouTube.');
    }
});



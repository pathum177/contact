const { cmd } = require('../lib/command');
const axios = require('axios');

const userStage = {}; // store what stage user is in
const searchResults = {};
const infoResults = {};

cmd({
    pattern: 'sinhalasub',
    desc: 'Search SinhalaSub movies',
    category: 'movie',
    filename: __filename
}, async (conn, m, msg, { q, reply }) => {
    try {
        if (!q) return reply('🎬 Movie name එකක් දෙන්න.\nඋදා: `.sinhalasub new`');

        const res = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub/search?q=${encodeURIComponent(q)}`);
        const data = res.data;

        if (!data.status || !data.results || data.results.length === 0) {
            return reply('❌ Movie search result නෑ.');
        }

        let text = `🎥 *SinhalaSub Search Results*\n\n`;
        data.results.forEach((mv, i) => {
            text += `*${i + 1}.* ${mv.title}\n${mv.url}\n\n`;
        });

        searchResults[m.sender] = data.results;
        userStage[m.sender] = 'search';
        reply(text + `_Reply with the number to get movie info_`);

    } catch (err) {
        console.error(err);
        reply('❌ Error while searching movies.');
    }
});

// Universal message listener
cmd({
    on: 'message'
}, async (conn, m, msg, { reply }) => {
    try {
        const num = parseInt(m.body.trim());

        // --- Stage 1: User selected a movie from search results ---
        if (userStage[m.sender] === 'search' && !isNaN(num)) {
            let movie = searchResults[m.sender]?.[num - 1];
            if (!movie) return reply('❌ Invalid number.');

            const res = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub/info?url=${movie.url}`);
            const info = res.data;

            if (!info.status || !info.downloads) {
                return reply('❌ Movie info not found.');
            }

            let text = `🎬 *${info.title}*\n`;
            text += `📅 Year: ${info.year}\n⭐ Rating: ${info.rating}\n📝 Genre: ${info.genre}\n\n${info.desc}\n\n`;
            text += `*Download Qualities:*\n`;
            info.downloads.forEach((dl, i) => {
                text += `*${i + 1}.* ${dl.quality} - ${dl.size}\n`;
            });

            infoResults[m.sender] = info.downloads;
            userStage[m.sender] = 'info';
            reply(text + `_Reply with number to download_`);
        }

        // --- Stage 2: User selected a download quality ---
        else if (userStage[m.sender] === 'info' && !isNaN(num)) {
            let dl = infoResults[m.sender]?.[num - 1];
            if (!dl) return reply('❌ Invalid number.');

            const res = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub/dl?url=${dl.url}`);
            if (!res.data.status || !res.data.download) {
                return reply('❌ Download link not found.');
            }

            reply(`⬇ Downloading *${dl.quality}*...`);
            await conn.sendMessage(
                m.chat,
                {
                    document: { url: res.data.download },
                    mimetype: 'video/mp4',
                    fileName: `${dl.quality}-movie.mp4`
                },
                { quoted: m }
            );

            // Clear user data after download
            delete userStage[m.sender];
            delete searchResults[m.sender];
            delete infoResults[m.sender];
        }

    } catch (err) {
        console.error(err);
        reply('❌ Error while processing request.');
    }
});

const { cmd } = require('../lib/command');
const axios = require('axios');

const searchCache = {};
const infoCache = {};

cmd({
    pattern: 'mv)',
    desc: 'Search SinhalaSub Movies',
    category: 'movie',
    filename: __filename
}, async (conn, m, msg, { q, reply }) => {
    try {
        if (!q) return reply('🎬 Movie name එකක් දෙන්න.\nඋදා: `.sinhalasub new`');

        const res = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub/search?q=${encodeURIComponent(q)}`);
        const data = res.data;

        if (!data.status || !data.results.length) return reply('❌ Movie search result නෑ.');

        let list = `🎥 *SinhalaSub Search Results:*\n\n`;
        data.results.forEach((mv, i) => {
            list += `*${i + 1}.* ${mv.title}\n${mv.url}\n\n`;
        });

        searchCache[m.sender] = data.results;
        reply(list + `_Reply with the number to get movie info_`);
    } catch (e) {
        console.error(e);
        reply('❌ Error fetching search results.');
    }
});

// Handle number reply for movie info
cmd({
    on: 'message'
}, async (conn, m, msg, { reply }) => {
    try {
        // Check if user has a search cache
        if (searchCache[m.sender] && /^\d+$/.test(m.body.trim())) {
            let index = parseInt(m.body.trim()) - 1;
            let movie = searchCache[m.sender][index];
            if (!movie) return;

            const res = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub/info?url=${movie.url}`);
            const info = res.data;

            if (!info.status) return reply('❌ Movie info not found.');

            let infoMsg = `🎬 *${info.title}*\n\n📅 Year: ${info.year}\n⭐ Rating: ${info.rating}\n📝 Genre: ${info.genre}\n\n${info.desc}\n\n🔗 *Movie Page:* ${movie.url}\n\n*Download Qualities:*\n`;
            info.downloads.forEach((dl, i) => {
                infoMsg += `*${i + 1}.* ${dl.quality} - ${dl.size}\n`;
            });

            infoCache[m.sender] = info.downloads;
            reply(infoMsg + `_Reply with number to download_`);
        }

        // Handle download
        else if (infoCache[m.sender] && /^\d+$/.test(m.body.trim())) {
            let index = parseInt(m.body.trim()) - 1;
            let dl = infoCache[m.sender][index];
            if (!dl) return;

            const res = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub/dl?url=${dl.url}`);
            if (!res.data.status) return reply('❌ Download link not found.');

            reply(`⬇ Downloading *${dl.quality}*...`);
            await conn.sendMessage(m.chat, { document: { url: res.data.download }, mimetype: 'video/mp4', fileName: `Movie-${dl.quality}.mp4` }, { quoted: m });

            // Clear caches
            delete searchCache[m.sender];
            delete infoCache[m.sender];
        }
    } catch (e) {
        console.error(e);
        reply('❌ Error processing request.');
    }
});

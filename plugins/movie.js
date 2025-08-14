const { cmd } = require('../lib/command');
const axios = require('axios');

let userSession = {};

cmd({
    pattern: "movie",
    desc: "Search & download SinhalaSub.lk movies",
    category: "movie"
}, async (conn, mek, m, { q, reply }) => {
    const sender = m.sender;
    const text = q?.trim();

    // STEP 2: If user replies with number in session
    if (userSession[sender]) {
        let step = userSession[sender].step;
        let data = userSession[sender].data;

        // Step 1 → Get Info
        if (step === 1) {
            let index = parseInt(text) - 1;
            if (isNaN(index) || index < 0 || index >= data.length) {
                return reply("❌ වැරදි අංකයක්");
            }

            let movie = data[index];
            let infoRes = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub/info?url=${movie.url}`);
            let info = infoRes.data;

            let caption = `🎬 *${info.title}*\n\n${info.description || ''}\n\n📀 *Download Options:*`;
            info.downloads?.forEach((d, i) => {
                caption += `\n${i + 1}. ${d.quality} - ${d.size}`;
            });

            await conn.sendMessage(m.chat, {
                image: info.image ? { url: info.image } : undefined,
                caption
            }, { quoted: mek });

            userSession[sender] = { step: 2, data: info.downloads, title: info.title };
            return;
        }

        // Step 2 → Download Movie
        if (step === 2) {
            let index = parseInt(text) - 1;
            if (isNaN(index) || index < 0 || index >= data.length) {
                return reply("❌ වැරදි අංකයක්");
            }

            let dl = data[index];
            try {
                // Fetch file as buffer
                const dlRes = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub/dl?url=${dl.url}`, { responseType: 'arraybuffer' });
                const buffer = Buffer.from(dlRes.data);

                // File size check (approx)
                let sizeMB = buffer.length / (1024 * 1024);
                if (sizeMB > 2000) {
                    return reply("🚫 Cannot send files larger than 2GB. Try low quality.");
                }

                await conn.sendMessage(m.chat, {
                    document: { buffer },
                    mimetype: 'video/mp4',
                    fileName: `${userSession[sender].title}.mp4`
                }, { quoted: mek });

                delete userSession[sender];
            } catch (e) {
                console.error(e);
                return reply("❌ Error downloading movie.");
            }
            return;
        }
    }

    // STEP 1: Search
    if (!text) return reply("🔍 Movie name එකක් type කරන්න.\nExample: `.movie avatar`");

    try {
        const res = await axios.get(`https://supun-md-mv.vercel.app/api/sinhalasub/search?q=${encodeURIComponent(text)}`);
        const movies = res.data || [];
        if (!movies.length) return reply("⚠️ කිසිවක් හමු නොවීය.");

        let list = "🎬 *Movies Found:*\n";
        movies.slice(0, 10).forEach((m, i) => list += `\n${i + 1}. ${m.title}`);

        reply(list + "\n\n➡️ Reply number to view details.");

        userSession[sender] = { step: 1, data: movies };
    } catch (e) {
        console.error(e);
        reply("⚠️ Error searching for movies.");
    }
});


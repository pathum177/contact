const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');

const userSession = {};

cmd({
    pattern: "video",
    react: "🎥",
    desc: "Search & Download YouTube video",
    category: "main",
    use: ".video <keyword>",
    filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
    const sender = m.sender;
    const input = q.trim();

    // Step 1: No input → check reply mode
    if (!input) {
        if (userSession[sender]?.step === "video_select") {
            const num = parseInt(m.body.trim());
            if (isNaN(num) || num < 1 || num > userSession[sender].results.length) {
                return reply("❌ Invalid number. Please choose from the list.");
            }

            const chosen = userSession[sender].results[num - 1];
            reply(`⏳ Downloading: ${chosen.title}`);

            try {
                const apiUrl = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(chosen.url)}`;
                const res = await fetch(apiUrl);
                const data = await res.json();

                if (!data.success) return reply("❌ Download failed.");

                await conn.sendMessage(from, {
                    video: { url: data.result.download_url },
                    mimetype: "video/mp4",
                    caption: `🎥 ${chosen.title}\n\n© DARK SHADOW`
                }, { quoted: mek });

            } catch (err) {
                console.error(err);
                reply("❌ Error downloading video.");
            }

            delete userSession[sender];
            return;
        }

        return reply("⚠️ Please provide a keyword or YouTube URL.");
    }

    // Step 2: Search
    try {
        const search = await ytsearch(input);
        if (!search.results.length) return reply("❌ No results found.");

        let list = `🎥 *YouTube Search Results:*\n\n`;
        search.results.slice(0, 10).forEach((vid, i) => {
            list += `${i + 1}. ${vid.title} (${vid.timestamp})\n`;
        });
        list += `\n💬 Reply with the number to download.`;

        const sentMsg = await reply(list);

        userSession[sender] = {
            step: "video_select",
            results: search.results
        };

    } catch (err) {
        console.error(err);
        reply("❌ Error searching YouTube.");
    }
});
              

const { cmd } = require('../lib/command');
const axios = require('axios');
const { generateWAMessageFromContent, proto, prepareWAMessageMedia } = require('@whiskeysockets/baileys'); // or your baileys version

cmd({
    pattern: "ttcard",
    alias: ["tiktokcard", "ttcarousel"],
    react: "🎞️",
    desc: "Download TikTok video result in WhatsApp carousel",
    category: "downloader",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    try {
        if (!q) return reply("🧩 Please provide a TikTok video URL.");
        if (!q.includes("tiktok.com")) return reply("🔗 Invalid TikTok URL.");

        reply("📥 Fetching TikTok video...");

        const { data } = await axios.get(`https://delirius-apiofc.vercel.app/download/tiktok?url=${encodeURIComponent(q)}`);
        if (!data?.status || !data.data) return reply("❌ Failed to fetch TikTok data.");

        const info = data.data;
        const videoUrl = info.meta.media.find(v => v.type === "video")?.org;
        const thumb = info.meta.cover || "https://i.supa.codes/7V4pfz";

        // Load image
        const imgMedia = await prepareWAMessageMedia({ image: { url: thumb } }, { upload: conn.waUploadToServer });

        // Carousel message
        const carousel = await generateWAMessageFromContent(m.chat, {
            ephemeralMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: { text: `🎵 TikTok video by ${info.author.nickname}` },
                        contextInfo: { mentionedJid: [m.sender] },
                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                            cards: [
                                {
                                    header: {
                                        title: info.title || "🎬 TikTok Video",
                                        hasMediaAttachment: true,
                                        ...imgMedia
                                    },
                                    nativeFlowMessage: {
                                        buttons: [{
                                            name: "cta_url",
                                            buttonParamsJson: JSON.stringify({
                                                display_text: "▶ Watch / Download",
                                                url: videoUrl,
                                                merchant_url: videoUrl
                                            })
                                        }]
                                    }
                                }
                            ]
                        })
                    })
                }
            }
        }, { userJid: m.chat, quoted: mek });

        await conn.relayMessage(m.chat, carousel.message, { messageId: carousel.key.id });

    } catch (e) {
        console.error(e);
        reply("⚠️ An error occurred. Please try again later.");
    }
});

const config = require('../settings');
const { cmd } = require('../lib/command');
const { ytsearch } = require('@dark-yasiya/yt-dl.js');
const fetch = require("node-fetch"); // npm install node-fetch if needed

const ytCache = {}; // Cache for storing search result details per session id

cmd({
  pattern: "media2",
  react: "🎬",
  desc: "Search and download YouTube video/audio",
  category: "main",
  use: ".media < YouTube name or URL >",
  filename: __filename
}, async (conn, mek, m, { from, q, reply, command }) => {
  try {
    if (!q) return reply("❌ Please provide a YouTube name or link.");

    // Split the message text into tokens.
    const args = q.trim().split(" ");
    
    // ─── BUTTON CLICK ACTION ──────────────────────────────────────────────
    // If the incoming text consists of exactly 2 tokens and the first token is one of the valid formats,
    // we consider it a button click response.
    if (args.length === 2 && ['audio', 'video', 'doc'].includes(args[0].toLowerCase())) {
      const format = args[0].toLowerCase(); // format: audio, video, or doc
      const id = args[1];
      const yts = ytCache[id];
      if (!yts) return reply("❌ Session expired. Please search again.");
      
      // React to the button click (⏬)
      await conn.sendMessage(from, { react: { text: "⏬", key: mek.key } });
      
      // Choose the proper API URL based on the format requested.
      let apiURL = "";
      if (format === "audio") {
        apiURL = `https://apis.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(yts.url)}`;
      } else { // For video and document downloads, using ytmp4 API.
        apiURL = `https://apis.davidcyriltech.my.id/download/ytmp4?url=${encodeURIComponent(yts.url)}`;
      }
      
      const res = await fetch(apiURL);
      const data = await res.json();
      if (!data.success) return reply("❌ Failed to download. Try again later.");
      
      const caption = `*📥 Download Complete!*\n\n🎵 *Title:* ${yts.title}\n⏱️ *Duration:* ${yts.timestamp}\n📦 *Type:* ${format.toUpperCase()}\n\n© LuxAlgo XD`;
      
      if (format === "audio") {
        await conn.sendMessage(from, { audio: { url: data.result.downloadUrl }, mimetype: "audio/mpeg" }, { quoted: mek });
      } else if (format === "video") {
        await conn.sendMessage(from, { video: { url: data.result.download_url }, mimetype: "video/mp4" }, { quoted: mek });
      } else if (format === "doc") {
        await conn.sendMessage(from, {
          document: { url: data.result.download_url },
          mimetype: "video/mp4",
          fileName: `${yts.title}.mp4`,
          caption
        }, { quoted: mek });
      }
      
      delete ytCache[id]; // Clear cached session entry after processing.
      return;
    }
    
    // ─── INITIAL SEARCH ACTION ──────────────────────────────────────────────
    // If it isn't a button click action, treat the q as the search query.
    const yt = await ytsearch(q);
    if (!yt?.results?.length) return reply("❌ No results found.");
    
    const yts = yt.results[0];
    const id = Date.now().toString();
    ytCache[id] = yts;
    
    // 1. Send image + caption message first.
    await conn.sendMessage(from, {
      image: { url: yts.thumbnail || "https://i.ibb.co/7CgqFYD/no-thumb.jpg" },
      caption: `*🎬 LUXALGO MEDIA DOWNLOADER 🎬*\n\n🎵 *Title:* ${yts.title}\n⏱️ *Duration:* ${yts.timestamp}\n👤 *Author:* ${yts.author.name}\n🔗 *Link:* ${yts.url}\n\n> Please choose a format to continue.`
    }, { quoted: mek });
    
    // 2. Then send list buttons message.
    const buttons = [
      { title: "🎶 Audio", rowId: `${command} audio ${id}` },
      { title: "🎥 Video", rowId: `${command} video ${id}` },
      { title: "📄 Document", rowId: `${command} doc ${id}` }
    ];
    
    const listMessage = {
      text: "*🎧 Choose format to download*",
      footer: "© Powered by LuxAlgo XD",
      title: "🎬 Format Options",
      buttonText: "📥 Select Format",
      sections: [
        {
          title: "Available Downloads",
          rows: buttons
        }
      ]
    };
    
    await conn.sendMessage(from, listMessage, { quoted: mek });
    
  } catch (err) {
    console.log(err);
    reply("❌ Unexpected error occurred.");
  }
});

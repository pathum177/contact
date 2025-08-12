const { cmd } = require('../lib/command');
const getFBInfo = require("@xaviabot/fb-downloader");

cmd({
  pattern: "fbdll",
  fromMe: false,
  desc: "Handle Facebook download button",
  filename: __filename
}, async (conn, msg, m, { args, reply }) => {
  try {
    const [type, ...linkArray] = args;
    const url = linkArray.join(" ");

    if (!url || !url.startsWith("http")) return reply("❌ Invalid or missing link.");

    const fb = await getFBInfo(url);

    switch (type) {
      case "sd":
        await conn.sendMessage(msg.chat, {
          video: { url: fb.sd },
          caption: "✅ SD Quality Video\n🔰 LUXALGO XD"
        }, { quoted: msg });
        break;

      case "hd":
        await conn.sendMessage(msg.chat, {
          video: { url: fb.hd },
          caption: "✅ HD Quality Video\n🔰 LUXALGO XD"
        }, { quoted: msg });
        break;

      case "audio":
        await conn.sendMessage(msg.chat, {
          audio: { url: fb.sd },
          mimetype: "audio/mpeg"
        }, { quoted: msg });
        break;

      case "doc":
        await conn.sendMessage(msg.chat, {
          document: { url: fb.sd },
          mimetype: "audio/mpeg",
          fileName: "fb_audio.mp3",
          caption: "✅ Audio as Document\n🔰 LUXALGO XD"
        }, { quoted: msg });
        break;

      case "voice":
        await conn.sendMessage(msg.chat, {
          audio: { url: fb.sd },
          mimetype: "audio/mpeg",
          ptt: true
        }, { quoted: msg });
        break;

      default:
        reply("❌ Unknown format selected.");
    }

  } catch (e) {
    console.log(e);
    reply("❌ Failed to send file.");
  }
});

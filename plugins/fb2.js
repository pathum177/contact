const config = require('../settings')
const { cmd } = require('../lib/command')
const getFBInfo = require("@xaviabot/fb-downloader");
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, jsonformat} = require('../lib/functions')

cmd({
  pattern: "fb2",
  alias: ["fbdl"],
  desc: "Download Facebook videos",
  category: "download",
  filename: __filename
},
async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q || !q.startsWith("https://")) {
      return conn.sendMessage(from, { text: "❌ Please provide a valid Facebook URL." }, { quoted: mek });
    }

    await conn.sendMessage(from, { react: { text: "💡", key: mek.key } });

    const result = await getFBInfo(q);

    const captionHeader = `
*│*🎥 *LUXALGO FB DOWNLOADER 🎥*

*┃ 🔗 ᴜʀʟ:* ${q} 

*⬇️ Select an option below:*
`;

    const buttons = [
      {
        buttonId: `.fbdl sd ${q}`,
        buttonText: { displayText: "📥 SD Video" },
        type: 1
      },
      {
        buttonId: `.fbdl hd ${q}`,
        buttonText: { displayText: "📺 *HD Video*" },
        type: 1
      },
      {
        buttonId: `.fbdl audio ${q}`,
        buttonText: { displayText: "🎶 Audio" },
        type: 1
      }
    ]

    await conn.sendMessage(from, {
      image: { url: result.thumbnail },
      caption: captionHeader,
      footer: "Powered by Luxalgo XD",
      buttons,
      headerType: 4
    }, { quoted: mek });

  } catch (e) {
    console.log(e);
    reply(`${e}`);
  }
})

// ================== Handle .fbdl ==================
cmd({
  pattern: "fbdl",
  desc: "Download from selected format",
  category: "download",
  filename: __filename
},
async (conn, mek, m, { args, from, reply }) => {
  try {
    const type = args[0];
    const url = args[1];
    if (!url) return reply("❌ Please provide a valid Facebook URL.");

    const result = await getFBInfo(url);

    if (type === "sd") {
      await conn.sendMessage(from, { video: { url: result.sd }, caption: "✅ SD Video" }, { quoted: mek });
    } else if (type === "hd") {
      await conn.sendMessage(from, { video: { url: result.hd }, caption: "✅ HD Video" }, { quoted: mek });
    } else if (type === "audio") {
      await conn.sendMessage(from, { audio: { url: result.sd }, mimetype: "audio/mpeg" }, { quoted: mek });
    } else {
      reply("❌ Unknown format!");
    }
  } catch (e) {
    console.log(e);
    reply(`${e}`);
  }
})

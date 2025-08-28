const { cmd } = require('../lib/command')
const yts = require('yt-search')
const ytdl = require('ytdlp-nodejs')
const fs = require('fs')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('ffmpeg-static')
ffmpeg.setFfmpegPath(ffmpegPath)

cmd({
  pattern: "yt",
  desc: "Download best YouTube result by number reply",
  category: "download",
  filename: __filename
}, async (conn, mek, m, { from, q, reply }) => {
  try {
    if (!q) return reply("❌ Example: .yt despacito");

    const search = await yts(q)
    const video = search.videos[0] // best result only

    if (!video) return reply("❌ No results found.")

    let caption = `
*🎬 Title:* ${video.title}
*📺 Channel:* ${video.author.name}
*⏱ Duration:* ${video.timestamp}
*👀 Views:* ${video.views}
*🔗 Link:* ${video.url}

*➡️ Reply with number:*
1 = 🎵 Audio (mp3)
2 = 🎥 Video (mp4)
3 = 📂 Document (mp3)
4 = 🎤 Voice (ptt)
    `

    const sent = await conn.sendMessage(from, {
      image: { url: video.thumbnail },
      caption: caption
    }, { quoted: mek })

    // Listen for reply
    conn.ev.on("messages.upsert", async (update) => {
      const msg = update.messages[0]
      if (!msg.message) return
      const text = msg.message.conversation || msg.message.extendedTextMessage?.text
      if (!text) return

      const from2 = msg.key.remoteJid
      const isReply = msg.message?.extendedTextMessage?.contextInfo?.stanzaId === sent.key.id

      if (from2 === from && isReply) {
        if (text === "1" || text === "3" || text === "4") {
          const filePath = `./tmp/${Date.now()}.mp3`
          const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' })
          ffmpeg(stream)
            .audioBitrate(128)
            .save(filePath)
            .on('end', async () => {
              if (text === "1") {
                await conn.sendMessage(from, { audio: { url: filePath }, mimetype: "audio/mpeg" }, { quoted: msg })
              } else if (text === "3") {
                await conn.sendMessage(from, {
                  document: { url: filePath },
                  mimetype: "audio/mpeg",
                  fileName: `${video.title}.mp3`
                }, { quoted: msg })
              } else if (text === "4") {
                await conn.sendMessage(from, { audio: { url: filePath }, mimetype: "audio/mpeg", ptt: true }, { quoted: msg })
              }
              fs.unlinkSync(filePath) // remove temp file
            })
        } else if (text === "2") {
          const filePath = `./tmp/${Date.now()}.mp4`
          const stream = ytdl(video.url, { filter: 'videoandaudio', quality: 'highestvideo' })
          stream.pipe(fs.createWriteStream(filePath))
            .on('finish', async () => {
              await conn.sendMessage(from, { video: { url: filePath }, caption: video.title }, { quoted: msg })
              fs.unlinkSync(filePath)
            })
        } else {
          reply("❌ Invalid number! Use 1, 2, 3 or 4.")
        }
      }
    })
  } catch (e) {
    console.log(e)
    reply(`${e}`)
  }
})

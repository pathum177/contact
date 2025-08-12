const { cmd } = require('../lib/command');

cmd({
  pattern: "owner",
  desc: "Show bot owner info",
  category: "main",
  react: "👨‍💻",
  filename: __filename
}, async (conn, msg, m, { reply }) => {
  try {
    const ownerInfo = `
*👑 BOT OWNER INFORMATION*

🔸 *Name:* Pathum Malsara
🔹 *Number:* wa.me/94773416478
🔸 *GitHub:* https://github.com/Pathum-Malsara
🔹 *Support Group:* https://chat.whatsapp.com/xyXXXXXX

🛠️ Need your own bot? Contact now!
`;

    const imageUrl = "https://files.catbox.moe/joo2gt.jpg";

    await conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: ownerInfo
    }, { quoted: msg });

  } catch (err) {
    console.error("❌ Error in .owner:", err);
    reply("⚠️ Something went wrong.");
  }
});

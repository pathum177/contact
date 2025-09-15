const axios = require("axios");

module.exports = async (conn, m) => {
  try {
    // Ignore own messages
    if (m.key.fromMe) return;

    // Handle ephemeral messages
    m.message = (m.message && m.message.ephemeralMessage)
      ? m.message.ephemeralMessage.message
      : m.message;

    if (!m.message) return;

    // Mark as read if group
    if (m.key.remoteJid.endsWith("@g.us")) {
      await conn.readMessages([m.key]);
    }

    // Extract text
    const userText = m.text || m.message.conversation || "";
    if (!userText) return;

    // Call AI API
    const res = await axios.get(
      `https://www.dark-yasiya-api.site/gpt?query=${encodeURIComponent(userText)}`
    );
    const result = res.data.result || "🤖 මට මේකට උත්තර නැහැ!";

    // Send reply
    await conn.sendMessage(m.chat, { text: result }, { quoted: m });

  } catch (e) {
    console.error("AI Reply Plugin Error:", e);
  }
};

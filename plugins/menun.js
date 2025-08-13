const { cmd } = require('../lib/command');

cmd({
  pattern: 'menu4',
  desc: 'Show full categorized command menu',
  category: 'main',
  filename: __filename
}, async (conn, m) => {
  try {
    const sections = [
      {
        title: "👑 OWNER COMMANDS",
        rows: [
          { title: "➤ delplugin", description: "Delete a plugin", rowId: ".delplugin" },
          { title: "➤ listplugins", description: "List all active plugins", rowId: ".listplugins" },
          { title: "➤ dawnloadplugin", description: "Download plugin by URL", rowId: ".dawnloadplugin" },
          { title: "➤ addplugin", description: "Add new plugin", rowId: ".addplugin" },
          { title: "➤ ban", description: "Ban a user", rowId: ".ban" },
          { title: "➤ unban", description: "Unban a user", rowId: ".unban" },
          { title: "➤ listban", description: "Show banned users", rowId: ".listban" },
          { title: "➤ privacy", description: "Bot privacy settings", rowId: ".privacy" },
          { title: "➤ blocklist", description: "Show block list", rowId: ".blocklist" },
          { title: "➤ getprofile", description: "Get user profile info", rowId: ".getprofile" }
        ]
      },
      {
        title: "👥 GROUP COMMANDS",
        rows: [
          { title: "➤ vcf", description: "Get group vcf", rowId: ".vcf" },
          { title: "➤ ginfo", description: "Group info", rowId: ".ginfo" },
          { title: "➤ mute", description: "Mute group", rowId: ".mute" },
          { title: "➤ unmute", description: "Unmute group", rowId: ".unmute" },
          { title: "➤ promote", description: "Promote user", rowId: ".promote" },
          { title: "➤ demote", description: "Demote user", rowId: ".demote" },
          { title: "➤ del", description: "Delete bot message", rowId: ".del" },
          { title: "➤ leave", description: "Bot leaves group", rowId: ".leave" },
          { title: "➤ invite", description: "Invite by link", rowId: ".invite" },
          { title: "➤ add", description: "Add member to group", rowId: ".add" }
        ]
      }
    ];

    const listMessage = {
      text: "📌 _Select a category to view available commandsx_",
      footer: "🔧LUXALGO-MD • Menu by Luxalgo",
      title: "📂 LUXALGO-MD COMMAND LIST",
      buttonText: "🗂 Open Menu",
      sections
    };

    await conn.sendMessage(m.chat, listMessage, { quoted: m });

  } catch (err) {
    m.reply('⚠️ Menu error: ' + err.message);
  }
});

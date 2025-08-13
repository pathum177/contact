const { cmd } = require('../lib/command');
const { exec } = require('child_process');

cmd({
  pattern: "update",
  desc: "Pull latest updates from repo",
  category: "owner",
  filename: __filename
}, async (conn, m, msg, { reply }) => {
  try {
    reply("⏳ Updating bot...");

    exec("git reset --hard && git pull", (err, stdout, stderr) => {
      if (err) {
        return reply(`❌ Update failed:\n${stderr}`);
      }
      reply("✅ Update completed! Restarting bot...");
      
      // Restart using PM2 or similar
      exec("pm2 restart all", (err2) => {
        if (err2) return reply(`⚠️ Bot updated but restart failed:\n${err2}`);
      });
    });

  } catch (e) {
    reply("❌ Error during update:\n" + e.message);
  }
});

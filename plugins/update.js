
const { cmd } = require("../lib/command");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const unzipper = require("unzipper");
const { exec } = require("child_process");

cmd({
  pattern: "update",
  desc: "Download latest repo zip and update bot (skip config files)",
  category: "owner",
  filename: __filename
}, async (conn, m, msg, { reply }) => {
  try {
    const repoOwner = "pathum177"; // <-- වෙනස් කරන්න
    const repoName = "contact";        // <-- වෙනස් කරන්න
    const zipUrl = `https://github.com/${repoOwner}/${repoName}/archive/refs/heads/main.zip`;

    reply("*Downloading latest update...⏳*");

    const zipPath = path.join(__dirname, "update.zip");
    const writer = fs.createWriteStream(zipPath);
    const response = await axios({ url: zipUrl, method: "GET", responseType: "stream" });

    response.data.pipe(writer);

    writer.on("finish", async () => {
      reply("*Extracting update..📦*");

      const skipFiles = ["index.js", "config.js", "settings.js"];

      await fs.createReadStream(zipPath)
        .pipe(unzipper.Parse())
        .on("entry", entry => {
          let entryName = entry.path.replace(`${repoName}-main/`, "");
          if (!entryName || skipFiles.includes(entryName)) {
            console.log(`⏭️ Skipped: ${entryName}`);
            entry.autodrain();
            return;
          }

          const filePath = path.join(__dirname, "..", entryName);
          if (entry.type === "Directory") {
            fs.mkdirSync(filePath, { recursive: true });
            entry.autodrain();
          } else {
            fs.mkdirSync(path.dirname(filePath), { recursive: true });
            entry.pipe(fs.createWriteStream(filePath));
          }
        })
        .promise();

      fs.unlinkSync(zipPath);

      reply("*Update completed! Restarting bot...✅*");
      exec("pm2 restart all", (err) => {
        if (err) reply(`⚠️ Update done, but restart failed:\n${err}`);
      });
    });

  } catch (err) {
    reply("❌ Update failed:\n" + err.message);
  }
});

const { cmd, commands } = require('../lib/command');
const os = require("os");
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive",
    alias: ["status", "runtime", "uptime"],
    desc: "Check uptime and system status",
    category: "main",
    react: "🧚‍♂️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        const uptime = runtime(process.uptime());
        const ramUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
        const ramTotal = (os.totalmem() / 1024 / 1024).toFixed(2);

        const status = `╭━━〔 *LUXALGO-XD* 〕━━┈⊷
┃◈╭────────────
┃◈┃• *⏳ Uptime*: ${uptime} 
┃◈┃• *📟 Ram usage*: ${ramUsed}MB / ${ramTotal}MB
┃◈┃• *⚙️ HostName*: ${os.hostname()}
┃◈┃• *👨‍💻 Owner*: Pathum Malsara
┃◈┃• *🧬 Version*: 3.0.0 BETA
┃◈└───────────
╰──────────────
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴘᴀᴛʜᴜᴍ ᴍᴀʟꜱᴀʀᴀ`;

        // Buttons
        let buttons = [
            { buttonId: '.owner', buttonText: { displayText: 'OWNER👨‍💻' }, type: 1 },
            { buttonId: '.ping', buttonText: { displayText: 'PING📡' }, type: 1 },
        ];

        await conn.sendMessage(from, { 
            image: { url: `https://files.catbox.moe/joo2gt.jpg` },
            caption: status,
            footer: "LUXALGO MINI BOT",
            buttons: buttons,
            headerType: 4,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363409414874042@newsletter',
                    newsletterName: 'LUXALGO',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in alive command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});












const { cmd, commands } = require('../lib/command');
const os = require("os");
const { runtime } = require('../lib/functions');

cmd({
    pattern: "alive",
    alias: ["status", "runtime", "uptime"],
    desc: "Check uptime and system status",
    category: "main",
    react: "🧚‍♂️",
    filename: __filename
},
async (conn, mek, m, { from, quoted, body, isCmd, command, args, q, isGroup, sender, senderNumber, botNumber2, botNumber, pushname, isMe, isOwner, groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins, reply }) => {
    try {
        // Generate system status message
        const status = `╭━━〔 *LUXALGO-XD* 〕━━┈⊷
┃◈╭────────────
┃◈┃• *⏳Uptime*:  ${runtime(process.uptime())} 
┃◈┃• *📟 Ram usage*: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB
┃◈┃• *⚙️ HostName*: ${os.hostname()}
┃◈┃• *👨‍💻 Owner*: Pathum Malsara
┃◈┃• *🧬 Version*: 3.0.0 BETA
┃◈└───────────
╰──────────────
> © ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴘᴀᴛʜᴜᴍ ᴍᴀʟꜱᴀʀᴀ`;

        // Send the status message with an image
        await conn.sendMessage(from, { 
            image: { url: `https://files.catbox.moe/joo2gt.jpg` },  // Image URL
            caption: status,
            contextInfo: {
                mentionedJid: [m.sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363409414874042@newsletter',
                    newsletterName: 'LUXALGO',
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error("Error in alive command:", e);
        reply(`An error occurred: ${e.message}`);
    }
});


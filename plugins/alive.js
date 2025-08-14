const { cmd, commands } = require('../lib/command')
const config = require('../settings')
const os = require('os')
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson, jsonformat} = require('../lib/functions')


cmd({
    pattern: "alive",
    react: "🧬",
    desc: "Check bot Commands.",
    category: "main",
    filename: __filename
}, async (conn, mek, m, { reply, prefix }) => {
    try {

const senderName = m.pushName || "User"

        let teksnya = `
*👋Hello ${senderName}, Welcome LUXALGO-XD❄️* 
╭──────────────●●►
| *🛠️  Version:* ${require("../package.json").version}
| *📟 Ram usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB
| *⏱️  Runtime:* ${runtime(process.uptime())}
| *👨‍💻 Owner*: Pathum Malsara
╰──────────────●●►
> *𝚂𝙾𝙼𝙴 𝙱𝚄𝙶𝚂 𝙼𝙰𝚈 𝙴𝚇𝙸𝚂𝚃 𝙰𝚂 𝙾𝙵 𝙽𝙾𝚆, 𝙰𝙽𝙳 𝚃𝙷𝙴𝚈 𝚆𝙸𝙻𝙻 𝙱𝙴 𝙵𝙸𝚇𝙴𝙳 𝙸𝙽 𝙵𝚄𝚃𝚄𝚁𝙴 𝚄𝙿𝙳𝙰𝚃𝙴𝚂.*⛓‍💥⚒️

> *𝙸𝙵 𝚈𝙾𝚄 𝙷𝙰𝚅𝙴 𝙰𝙽𝚈 𝙸𝚂𝚂𝚄𝙴𝚂, 𝙿𝙻𝙴𝙰𝚂𝙴 𝙲𝙾𝙽𝚃𝙰𝙲𝚃 𝚃𝙷𝙴 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁.🎉*

*ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴘᴀᴛʜᴜᴍ ᴍᴀʟꜱᴀʀᴀ*
 `;

        let imageUrl = "https://files.catbox.moe/no9rxp.jpeg";

        let vpsOptions = [
        
            { title: "𝙼𝙰𝙸𝙽 𝙼𝙴𝙽𝚄 ", description: "ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴘᴀᴛʜᴜᴍ ᴍᴀʟꜱᴀʀᴀ", id: `${prefix}menu` },
            { title: "𝙾𝚆𝙽𝙴𝚁 ", description: "ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴘᴀᴛʜᴜᴍ ᴍᴀʟꜱᴀʀᴀ", id: `${prefix}owner` },
            { title: "𝙿𝙸𝙽𝙶 ", description: "ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴘᴀᴛʜᴜᴍ ᴍᴀʟꜱᴀʀᴀ", id: `${prefix}ping` }
        ];

        let buttonSections = [
            {
                title: "List of LUXALGO-XD Bot Commands",
                highlight_label: "LUXALGO-XD",
                rows: vpsOptions
            }
        ];

        let buttons = [
    {
        buttonId: "action",
        buttonText: { displayText: "Select Menu" },
        type: 4,
        nativeFlowInfo: {
            name: "single_select",
            paramsJson: JSON.stringify({
                title: "𝗖𝗛𝗢𝗢𝗦𝗘 𝗔𝗟𝗜𝗩𝗘 𝗧𝗔𝗕",
                sections: buttonSections
            })
        }
    }
];



        conn.sendMessage(m.chat, {
            buttons,
            headerType: 1,
            viewOnce: true,
            caption: teksnya,
            image: { url: imageUrl },
            contextInfo: {
                mentionedJid: [m.sender], 
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363409414874042@newsletter',
                    newsletterName: `LUXALGO`,
                    serverMessageId: 143
                }
            }
        }, { quoted: mek });

    } catch (e) {
        console.error(e);
        reply(`Error: ${e.message}`);
    }
});


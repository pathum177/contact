const { cmd, commands } = require('../lib/command')
const config = require('../settings')
const os = require('os')
var { get_set , input_set } = require('../lib/set_db') 
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
*👋Hello ${senderName}, welcome LUXALGO-XD❄️* 
╭──────────────●●►
| *🛠️  Version:* ${require("../package.json").version}
| *📟 Ram usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${Math.round(require('os').totalmem / 1024 / 1024)}MB
| *⏱️  Runtime:* ${runtime(process.uptime())}
| *👨‍💻 Owner*: Pathum Malsara
╰──────────────●●►
> *𝚂𝙾𝙼𝙴 𝙱𝚄𝙶𝚂 𝙼𝙰𝚈 𝙴𝚇𝙸𝚂𝚃 𝙰𝚂 𝙾𝙵 𝙽𝙾𝚆, 𝙰𝙽𝙳 𝚃𝙷𝙴𝚈 𝚆𝙸𝙻𝙻 𝙱𝙴 𝙵𝙸𝚇𝙴𝙳 𝙸𝙽 𝙵𝚄𝚃𝚄𝚁𝙴 𝚄𝙿𝙳𝙰𝚃𝙴𝚂.*⛓‍💥⚒️

> *𝙸𝙵 𝚈𝙾𝚄 𝙷𝙰𝚅𝙴 𝙰𝙽𝚈 𝙸𝚂𝚂𝚄𝙴𝚂, 𝙿𝙻𝙴𝙰𝚂𝙴 𝙲𝙾𝙽𝚃𝙰𝙲𝚃 𝚃𝙷𝙴 𝙳𝙴𝚅𝙴𝙻𝙾𝙿𝙴𝚁.🎉*
> ᴄʀᴇᴀᴛᴇᴅ ʙʏ ᴘᴀᴛʜᴜᴍ ᴍᴀʟꜱᴀʀᴀ
 
 `;

        let imageUrl = "https://files.catbox.moe/joo2gt.jpg";

        let vpsOptions = [
        
            { title: "ᴍᴀɪɴ menu ", description: "Get Bot ᴍᴀɪɴ Menu", id: `${prefix}mainmenu` },
            { title: "ᴅᴏᴡɴʟᴏᴀᴅ menu ", description: "Get Bot Download Menu", id: `${prefix}dlmenu` },
            { title: "ᴍᴏᴠɪᴇ ᴍᴇɴᴜ ", description: "Get Bot Movie Menu", id: `${prefix}moviemenu` },
            { title: "ᴄᴏɴᴠᴇʀᴛ menu ", description: "Get Bot Convert Menu", id: `${prefix}convertmenu` },
            { title: "ɢʀᴏᴜᴘ ᴍᴇɴᴜ ", description: "Get Group Only Commands", id: `${prefix}groupmenu` },
            { title: "ᴀɪ ᴍᴇɴᴜ ", description: "Get Bot AI Commands List", id: `${prefix}aimenu` },
            { title: "ꜱᴇᴀʀᴄʜ menu ", description: "Get Bot Search Menu", id: `${prefix}searchmenu` },
            { title: "ꜰᴜɴ menu ", description: "Fun Joke Menu Bot", id: `${prefix}funmenu` },
            { title: "ᴀɴɪᴍᴇ menu ", description: "Owner Only Bug Menu", id: `${prefix}animemenu` },
            { title: "ʀᴇᴀᴄᴛɪᴏɴ menu ", description: "Get ʀᴇᴀᴄᴛɪᴏɴ Menu", id: `${prefix}reactions` },
            { title: "ᴏᴡɴᴇʀ menu ", description: "Get Bot ᴏᴡɴᴇʀ Menu", id: `${prefix}ownermenu` },
            { title: "ᴏᴛʜᴇʀ ᴍᴇɴᴜ ", description: "ᴏᴛʜᴇʀ Commands Menu", id: `${prefix}othermenu` }
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
                title: "MENU📃",
                sections: buttonSections
            })
        }
    },
    {
        buttonId: ".owner",
        buttonText: { displayText: "OWNER👨‍💻" },
        type: 1
    },
    {
        buttonId: ".ping",
        buttonText: { displayText: "PING🧬" },
        type: 1
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

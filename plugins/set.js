const { cmd } = require('../lib/command');
const config = require('../settings');

cmd({
    pattern: "settings",
    alias: ["setting"],
    desc: "Settings the bot",
    category: "owner",
    react: "⚙",
    filename: __filename
},
async (conn, mek, m, { from, isOwner, reply }) => {

    if (!isOwner) return reply("❌ You are not the owner!");

    const text = `*⚙️ LUXALGO  BOT SETTINGS*

Select options below to configure the bot:`;

    let buttons = [
        // MODE OPTIONS
        { buttonId: '.update MODE:public', buttonText: { displayText: '🌐 Public Mode' }, type: 1 },
        { buttonId: '.update MODE:private', buttonText: { displayText: '🔒 Private Mode' }, type: 1 },
        { buttonId: '.update MODE:group', buttonText: { displayText: '👥 Group Only' }, type: 1 },
        { buttonId: '.update MODE:inbox', buttonText: { displayText: '💬 Inbox Only' }, type: 1 },

        // AUTO VOICE
        { buttonId: '.update AUTO_VOICE:true', buttonText: { displayText: '🎤 Auto Voice ON' }, type: 1 },
        { buttonId: '.update AUTO_VOICE:false', buttonText: { displayText: '🎤 Auto Voice OFF' }, type: 1 },

        // AUTO STATUS SEEN
        { buttonId: '.update AUTO_READ_STATUS:true', buttonText: { displayText: '👀 Status Seen ON' }, type: 1 },
        { buttonId: '.update AUTO_READ_STATUS:false', buttonText: { displayText: '👀 Status Seen OFF' }, type: 1 },

        // AUTO STICKER
        { buttonId: '.update AUTO_STICKER:true', buttonText: { displayText: '💫 Auto Sticker ON' }, type: 1 },
        { buttonId: '.update AUTO_STICKER:false', buttonText: { displayText: '💫 Auto Sticker OFF' }, type: 1 },

        // AUTO REPLY
        { buttonId: '.update AUTO_REPLY:true', buttonText: { displayText: '🤖 Auto Reply ON' }, type: 1 },
        { buttonId: '.update AUTO_REPLY:false', buttonText: { displayText: '🤖 Auto Reply OFF' }, type: 1 },

        // OFFLINE MODE
        { buttonId: '.update ALLWAYS_OFFLINE:true', buttonText: { displayText: '📴 Offline Mode ON' }, type: 1 },
        { buttonId: '.update ALLWAYS_OFFLINE:false', buttonText: { displayText: '📴 Offline Mode OFF' }, type: 1 },

        // READ MSG
        { buttonId: '.update READ_MESSAGE:true', buttonText: { displayText: '✅ Read Msg ON' }, type: 1 },
        { buttonId: '.update READ_MESSAGE:false', buttonText: { displayText: '✅ Read Msg OFF' }, type: 1 },

        // AUTO REACT
        { buttonId: '.update AUTO_REACT:true', buttonText: { displayText: '❤️ Auto React ON' }, type: 1 },
        { buttonId: '.update AUTO_REACT:false', buttonText: { displayText: '❤️ Auto React OFF' }, type: 1 },

        // ANTI LINK
        { buttonId: '.update ANTI_LINK:true', buttonText: { displayText: '🚫 Anti-Link ON' }, type: 1 },
        { buttonId: '.update ANTI_LINK:false', buttonText: { displayText: '🚫 Anti-Link OFF' }, type: 1 },
        { buttonId: '.update ANTI_LINK:remove', buttonText: { displayText: '⛔ Remove Links' }, type: 1 },

        // STATUS REACT & REPLY
        { buttonId: '.update AUTO_REACT_STATUS:true', buttonText: { displayText: '👁️ Status React ON' }, type: 1 },
        { buttonId: '.update AUTO_REACT_STATUS:false', buttonText: { displayText: '👁️ Status React OFF' }, type: 1 },
        
        { buttonId: '.update AUTO_STATUS_REPLY:true', buttonText: { displayText: '💬 Status Reply ON' }, type: 1 },
        { buttonId: '.update AUTO_STATUS_REPLY:false', buttonText: { displayText: '💬 Status Reply OFF' }, type: 1 },

        // AI MODE
        { buttonId: '.update AUTO_AI:true', buttonText: { displayText: '🤖 AI Mode ON' }, type: 1 },
        { buttonId: '.ping', buttonText: { displayText: '🤖 AI Mode OFF' }, type: 1 },
    ];

    await conn.sendMessage(from, {
        image: { url: "https://files.catbox.moe/joo2gt.jpg" },
        caption: text,
        buttons: buttons,
        headerType: 4
    }, { quoted: mek });

});

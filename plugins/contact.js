const { cmd } = require('../lib/command')

cmd({
    pattern: "sendinfo",
    desc: "Send your info to all group members in DM",
    category: "owner",
}, async (conn, mek, m, { reply, isOwner }) => {

    if (!isOwner) return reply("❌ Owner only command!")

    const groupMetadata = await conn.groupMetadata(m.chat)
    const participants = groupMetadata.participants

    // --- Owner's info ---
    const ownerName = "Pathum Malsara"
    const ownerNumber = "94773416478"
    const ownerDescription = "⚡ WhatsApp Bot Developer\n📌 LUXALGO BOT Owner\n📱 Contact for projects!"
    const ownerImage = "https://files.catbox.moe/joo2gt.jpg" // photo URL

    reply(`📤 Sending info to ${participants.length} members...`)

    const messageTemplate = (name, number, desc) => `╔══❖•ೋ° °ೋ•❖══╗
🌟 *LUXALGO BROADCAST SYSTEM* 🌟
╚══❖•ೋ° °ೋ•❖══╝

👤 *Name:* ${name}
📞 *Number:* wa.me/${number}

${desc}

━━━━━━━━━━━━━━━
💬 _Message sent via automated bot_ 
`

    for (let member of participants) {
        if (member.id.endsWith("@g.us")) continue // skip groups
        if (member.id === m.sender) continue // skip yourself

        try {
            await conn.sendMessage(member.id, {
                image: { url: ownerImage },
                caption: messageTemplate(ownerName, ownerNumber, ownerDescription)
            })
        } catch (e) {
            console.log(`❌ Failed to send to ${member.id}`, e)
        }
        await new Promise(r => setTimeout(r, 500)) // delay to avoid block
    }

    reply("✅ Info sent to all members successfully!")
})

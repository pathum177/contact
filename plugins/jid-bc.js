const { cmd } = require('../lib/command')

cmd({
    pattern: "sendinfo2",
    desc: "Send your info to all group members or a specific JID",
    category: "owner",
    filename: __filename
}, async (conn, mek, m, { reply, isOwner, q }) => {

    if (!isOwner) return reply("❌ Owner only command!")

    // --- Owner's info ---
    const ownerName = "Pathum Malsara"
    const ownerNumber = "94773416478"
    const ownerDescription = "⚡ WhatsApp Bot Developer\n📌 LUXALGO BOT Owner\n📱 Contact for projects!"
    const ownerImage = "https://files.catbox.moe/joo2gt.jpg" // photo URL

    const messageTemplate = (name, number, desc) => `╔══❖•ೋ° °ೋ•❖══╗
🌟 *LUXALGO BROADCAST SYSTEM* 🌟
╚══❖•ೋ° °ೋ•❖══╝

👤 *Name:* ${name}
📞 *Number:* wa.me/${number}

${desc}

━━━━━━━━━━━━━━━
💬 _Message sent via automated bot_ 
`

    // ✅ If in a group → send to all members
    if (m.chat.endsWith("@g.us") && !q) {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const participants = groupMetadata.participants

        reply(`📤 Sending info to ${participants.length} members...`)

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
            await new Promise(r => setTimeout(r, 500)) // delay
        }

        return reply("✅ Info sent to all members successfully!")
    }

    // ✅ If JID or number is provided → send only to that JID
    if (q) {
        let target = q.replace(/[^0-9]/g, '')
        if (!target.includes('@')) target = target + '@s.whatsapp.net'

        try {
            await conn.sendMessage(target, {
                image: { url: ownerImage },
                caption: messageTemplate(ownerName, ownerNumber, ownerDescription)
            })
            return reply(`✅ Info sent to ${target} successfully!`)
        } catch (e) {
            return reply(`❌ Failed to send to ${target}\nError: ${e.message}`)
        }
    }

    // If in PM without number
    return reply('❌ Please enter a number/JID to send in PM.\nExample: `.sendinfo 9477xxxxxxx`')
})

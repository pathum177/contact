const { cmd } = require('../lib/command');
const axios = require('axios');

cmd({
    pattern: "ai",
    alias: ["chatbot", "dj", "gpt3", "bing"],
    desc: "Chat with an AI model",
    category: "ai",
    react: "🤖",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for the AI.\nExample: `.ai Hello`");

        const apiUrl = `https://lance-frank-asta.onrender.com/api/gpt?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.message) {
            await react("❌");
            return reply("AI failed to respond. Please try again later.");
        }

        await reply(`🤖 *g𝙿𝚃 ₐ𝙸 ᵣ𝙴𝚂𝙿𝙾𝙽𝚂𝙴:*\n\n${data.message}\n\n𝚃𝚁𝚈 𝙰𝙽𝙾𝚃𝙷𝙴𝚁 𝙰𝙸 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 ▸ .𝙳𝙴𝙴𝙿𝚂𝙴𝙴𝙺 𝙾𝚁 .𝙾𝙿𝙴𝙽𝙰𝙸`);
        await react("✅");
    } catch (e) {
        console.error("Error in AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with the AI.");
    }
});

cmd({
    pattern: "openai",
    alias: ["chatgpt", "gpt2", "open-gpt"],
    desc: "Chat with OpenAI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for OpenAI.\nExample: `.openai Hello`");

        const apiUrl = `https://vapis.my.id/api/openai?q=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.result) {
            await react("❌");
            return reply("OpenAI failed to respond. Please try again later.");
        }

        await reply(`🧠 *ₒ𝙿𝙴𝙽 ₐ𝙸 ᵣ𝙴𝚂𝙿𝙾𝙽𝚂𝙴:*\n\n${data.result}\n\n𝚃𝚁𝚈 𝙰𝙽𝙾𝚃𝙷𝙴𝚁 𝙰𝙸 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 ▸ .𝙳𝙴𝙴𝙿𝚂𝙴𝙴𝙺 𝙾𝚁 .𝙰𝙸`);
        await react("✅");
    } catch (e) {
        console.error("Error in OpenAI command:", e);
        await react("❌");
        reply("An error occurred while communicating with OpenAI.");
    }
});

cmd({
    pattern: "deepseek",
    alias: ["gpt", "seekai"],
    desc: "Chat with DeepSeek AI",
    category: "ai",
    react: "🧠",
    filename: __filename
},
async (conn, mek, m, { from, args, q, reply, react }) => {
    try {
        if (!q) return reply("Please provide a message for DeepSeek AI.\nExample: `.deepseek Hello`");

        const apiUrl = `https://api.ryzendesu.vip/api/ai/deepseek?text=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.answer) {
            await react("❌");
            return reply("DeepSeek AI failed to respond. Please try again later.");
        }

        await reply(`🧠 *d𝙴𝙴𝙿𝚂𝙴𝙴𝙺 ₐ𝙸 ᵣ𝙴𝚂𝙿𝙾𝙽𝚂𝙴:*\n\n${data.answer}\n\n𝚃𝚁𝚈 𝙰𝙽𝙾𝚃𝙷𝙴𝚁 𝙰𝙸 𝙲𝙾𝙼𝙼𝙰𝙽𝙳 ▸ .𝙰𝙸 𝙾𝚁 .𝙾𝙿𝙴𝙽𝙰𝙸`);
        await react("✅");
    } catch (e) {
        console.error("Error in DeepSeek AI command:", e);
        await react("❌");
        reply("An error occurred while communicating with DeepSeek AI.");
    }
});


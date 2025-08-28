const axios = require('axios');

class DeepSeekPlugin {
    constructor(apiKey = null) {
        this.name = "DeepSeek AI Plugin";
        this.description = "DeepSeek AI සමඟ සංවාදයට සහ ප්‍රශ්නවලට පිළිතුරු ලබාගැනීමට";
        this.version = "1.0.0";
        this.author = "pathum";
        
        // DeepSeek API endpoint
        this.apiUrl = "https://api.deepseek.com/v1/chat/completions";
        this.apiKey = "sk-ddef1a800e02499bb7b30a66c94f2ba3";
        
        // විධාන ලැයිස්තුව
        this.commands = {
            'deepseek': this.handleDeepSeek.bind(this),
            'ai': this.handleDeepSeek.bind(this),
            'ask': this.handleDeepSeek.bind(this),
            'help': this.handleHelp.bind(this)
        };
    }

    // Plugin ආරම්භක සැකසුම
    async initialize() {
        console.log(`${this.name} v${this.version} පූරණය කරන ලදී`);
        
        if (!this.apiKey) {
            console.warn('⚠️  DeepSeek API key සොයාගත නොහැක. DEEPSEEK_API_KEY පරිසර විචල්යය සකසන්න.');
        }
    }

    // පණිවිඩයක් ලැබුණු විට
    async onMessage(message, client) {
        const text = message.body.toLowerCase().trim();
        
        // විධාන හඳුනාගැනීම
        for (const [command, handler] of Object.entries(this.commands)) {
            if (text.startsWith(`!${command}`)) {
                const query = text.replace(`!${command}`, '').trim();
                await handler(message, client, query);
                return true;
            }
        }
        
        return false;
    }

    // DeepSeek AI සමඟ සංවාදය
    async handleDeepSeek(message, client, query) {
        if (!query) {
            await client.sendMessage(message.from, '❗කරුණාකර ප්‍රශ්නයක් ඇතුළත් කරන්න. උදා: !ai ලංකාවේ ජනසංඛ්‍යාව කීයද?');
            return;
        }

        if (!this.apiKey) {
            await client.sendMessage(message.from, '❌ DeepSeek API key සකසා නොමැත. Bot සම්පාදකයා අමතන්න.');
            return;
        }

        try {
            // පරිශීලකයාට "ප්‍රශ්නය සැකසෙමින් පවතී" ලෙස පණිවිඩයක් යැවීම
            await client.sendMessage(message.from, "🤔 DeepSeek AI ඔබේ ප්‍රශ්නය සැකසෙමින් පවතී...");

            // DeepSeek API ඇමතුම
            const response = await axios.post(this.apiUrl, {
                model: "deepseek-chat",
                messages: [
                    { role: "system", content: "ඔබ සහායක සහ ප්‍රයෝජනවත් AI සහායකයෙකි. ප්‍රශ්නවලට සවිස්තරාත්මකව සහ පැහැදිලිව පිළිතුරු සපයන්න." },
                    { role: "user", content: query }
                ],
                max_tokens: 1000,
                temperature: 0.7
            }, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            const aiResponse = response.data.choices[0].message.content;
            
            // පිළිතුරු පණිවිඩය යැවීම (කොටස් වශයෙන් යැවීමට අවශ්‍ය නම්)
            if (aiResponse.length > 1000) {
                // දිගු පිළිතුරු කොටස් කිරීම
                for (let i = 0; i < aiResponse.length; i += 1000) {
                    const part = aiResponse.substring(i, i + 1000);
                    await client.sendMessage(message.from, `🤖 DeepSeek AI (${i/1000 + 1}/${Math.ceil(aiResponse.length/1000)}):\n\n${part}`);
                }
            } else {
                await client.sendMessage(message.from, `🤖 DeepSeek AI:\n\n${aiResponse}`);
            }

        } catch (error) {
            console.error('DeepSeek API දෝෂය:', error);
            await client.sendMessage(message.from, '❌ DeepSeek API ඇමතුමේ දෝෂයක් ඇති විය. කරුණාකර පසුව උත්සාහ කරන්න.');
        }
    }

    // උදව් පණිවිඩය
    async handleHelp(message, client) {
        const helpText = `
🤖 *DeepSeek AI Bot - උදව් මෙනුව* 🤖

විධාන:
!ai [ප්‍රශ්නය] - DeepSeek AI එකට ප්‍රශ්නයක් අසන්න
!deepseek [ප්‍රශ්නය] - DeepSeek AI එකට ප්‍රශ්නයක් අසන්න
!ask [ප්‍රශ්නය] - DeepSeek AI එකට ප්‍රශ්නයක් අසන්න
!help - මෙම උදව් පණිවිඩය පෙන්වන්න

උදාහරණ:
!ai ලංකාවේ ජනසංඛ්‍යාව කීයද?
!deepseek පයිතන් ක්‍රමලේඛන භාෂාව ගැන දැනුම
!ask ග්‍රහණයක් ගැන මට විස්තර කරන්න
        `.trim();
        
        await client.sendMessage(message.from, helpText);
    }

    // අවසන් කිරීමේ ක්‍රියාවලිය
    async destroy() {
        console.log(`${this.name} plugin අක්‍රීය කරන ලදී`);
    }
}

module.exports = DeepSeekPlugin;

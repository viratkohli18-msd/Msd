const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// 🔑 Apna Bot Token yaha
const TOKEN = "8624025132:AAHyTmWegjSzUO5hjo57WNYxOCjCpcTvgM8";

// Start bot
const bot = new TelegramBot(TOKEN, { polling: true });
console.log("🤖 Bot Started...");

// Country flag function
function getFlag(code) {
  if (!code) return "🌐";
  return code.toUpperCase().replace(/./g, char =>
    String.fromCodePoint(127397 + char.charCodeAt())
  );
}

// /start command
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`👑 Welcome to Pro Lookup Bot

Use:
/check USERNAME_OR_ID

Powered by  ⏤͟͟͞͞ 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`,
  { parse_mode: "Markdown" });
});

// /check command
bot.onText(/\/check (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1];

  bot.sendMessage(chatId, "🔍 Searching...");

  try {
    const res = await axios.get(`https://username-to-number.vercel.app/?key=my_dayne&q=${query}`);

    let number =
      res.data?.phone_info_from_id?.number ||
      res.data?.api3_phone_details?.number;

    let country = res.data?.phone_info_from_id?.country || "Unknown";
    let code = res.data?.phone_info_from_id?.country_code || "N/A";
    let flag = getFlag(country.slice(0,2));

    if (number) {
      bot.sendMessage(chatId,
`╭━━━〔 Lookup Result 〕━━━╮

👤 Query: ${query}
📱 Number: ${number}
🌍 Country: ${flag} ${country}
☎️ Code: ${code}

╰━━━━━━━━━━━━╯
Powered by Virat`,
      { parse_mode: "Markdown" });
    } else {
      bot.sendMessage(chatId, "❌ Number Not Found", { parse_mode: "Markdown" });
    }

  } catch {
    bot.sendMessage(chatId, "⚠️ API Error / Server Down", { parse_mode: "Markdown" });
  }
});

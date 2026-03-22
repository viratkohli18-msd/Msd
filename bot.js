// tg-bot/bot.js
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// 🔑 Apna Bot Token yaha
const BOT_TOKEN = "8624025132:AAHyTmWegjSzUO5hjo57WNYxOCjCpcTvgM8";

// 🔑 Apna API key yaha
const API_KEY = "my_dayne";

// Bot start
const bot = new TelegramBot(BOT_TOKEN, { polling: true });
console.log("🤖 Bot Started...");

// Helper function to fetch number info
async function fetchNumber(query) {
  try {
    const response = await axios.get(`https://username-to-number.vercel.app/?key=${API_KEY}&q=${query}`);
    const data = response.data;

    let number = data.phone_info_from_id?.number || data.api3_phone_details?.results?.[0]?.mobile || null;
    let country = data.phone_info_from_id?.country || "Unknown";
    let code = data.phone_info_from_id?.country_code || "+91";
    let flag = country === "India" ? "🇮🇳" : "🌐";

    return { number, country, code, flag };
  } catch (err) {
    console.error("API Fetch Error:", err.message);
    return null;
  }
}

// Command: /check <username_or_id>
bot.onText(/\/check (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  let query = match[1];

  // Try username first
  let result = await fetchNumber(query);

  // If username fails, try fallback user_id
  if (!result?.number) {
    query = msg.from.id;
    result = await fetchNumber(query);
  }

  // Send response
  if (result?.number) {
    bot.sendMessage(
      chatId,
      `╭━━━〔 Lookup Result 〕━━━╮
👤 Query: ${query}
📱 Number: ${result.number}
🌍 Country: ${result.flag} ${result.country}
☎️ Code: ${result.code}
╰━━━━━━━━━━━━╯
Powered by Virat`,
      { parse_mode: "Markdown" }
    );
  } else {
    bot.sendMessage(chatId, "❌ Number Not Found or API Down", { parse_mode: "Markdown" });
  }
});

// Optional: reply to any other message
bot.on("message", (msg) => {
  if (!msg.text.startsWith("/check")) {
    bot.sendMessage(msg.chat.id, "Bot is online ✅\nUse /check <username> to lookup a number");
  }
});

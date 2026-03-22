// bot.js
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

// 🔑 Apna Bot Token aur API Key yaha
const BOT_TOKEN = "8624025132:AAHyTmWegjSzUO5hjo57WNYxOCjCpcTvgM8";       // Telegram bot token
const API_KEY = "https://username-to-number.vercel.app/?key=my_dayne&q=${query}`);           // Username-to-number API key

// Polling mode
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ===================== /check command =====================
bot.onText(/\/check (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  let query = match[1]; // username ya user ID

  try {
    // 🔹 Step 1: Username lookup
    let response = await axios.get(`https://username-to-number.vercel.app/?key=${API_KEY}&q=${query}`);
    let data = response.data;

    // 🔹 Extract number info
    let number = data.phone_info_from_id?.number || data.api3_phone_details?.results?.[0]?.mobile || null;
    let country = data.phone_info_from_id?.country || data.api3_phone_details?.results?.[0]?.country || "Unknown";
    let code = data.phone_info_from_id?.country_code || data.api3_phone_details?.results?.[0]?.country_code || "+91";
    let flag = country === "India" ? "🇮🇳" : ""; // Simple flag fallback

    // 🔹 Step 2: Fallback → Telegram user ID
    if (!number) {
      query = msg.from.id; // numeric user ID
      response = await axios.get(`https://username-to-number.vercel.app/?key=${API_KEY}&q=${query}`);
      data = response.data;
      number = data.phone_info_from_id?.number || data.api3_phone_details?.results?.[0]?.mobile || null;
      country = data.phone_info_from_id?.country || data.api3_phone_details?.results?.[0]?.country || "Unknown";
      code = data.phone_info_from_id?.country_code || data.api3_phone_details?.results?.[0]?.country_code || "+91";
      flag = country === "India" ? "🇮🇳" : "";
    }

    // 🔹 Step 3: Send result
    if (number) {
      bot.sendMessage(
        chatId,
        `╭━━━〔 Lookup Result 〕━━━╮
👤 Query: ${query}
📱 Number: ${number}
🌍 Country: ${flag} ${country}
☎️ Code: ${code}
╰━━━━━━━━━━━━╯
Powered by Virat`,
        { parse_mode: "Markdown" }
      );
    } else {
      bot.sendMessage(
        chatId,
        `❌ Number Not Found / API Error
👤 Query: ${query}
📱 Number: +911234567890
🌍 Country: 🇮🇳 India
☎️ Code: +91
Powered by Virat`,
        { parse_mode: "Markdown" }
      );
    }

  } catch (err) {
    // 🔹 Catch API errors
    bot.sendMessage(
      chatId,
      `⚠️ API Error / Server Down
👤 Query: ${query}
📱 Number: +911234567890
🌍 Country: 🇮🇳 India
☎️ Code: +91
Powered by Virat`,
      { parse_mode: "Markdown" }
    );
  }
});

// ===================== Every message response =====================
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "Bot working ✅");
});

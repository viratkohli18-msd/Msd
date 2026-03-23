const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

const BOT_TOKEN = "8624025132:AAEu2T9-bKw0N9OP9tA73J-ZomUcZIFANL8";
const API_KEY = "my_dayne";

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖 Bot Started...");

// 🌍 Country → Flag function
function getFlag(country) {
  if (!country) return "🌐";
  const map = {
    "India": "🇮🇳",
    "United States": "🇺🇸",
    "Pakistan": "🇵🇰",
    "Bangladesh": "🇧🇩",
    "Nepal": "🇳🇵"
  };
  return map[country] || "🌐";
}

// 🔎 API fetch function
async function fetchData(query, isUserId = false) {
  try {
    let url = `https://username-to-number.vercel.app/?key=${API_KEY}&q=${query}`;

    // 👇 agar userID hai to extra params
    if (isUserId) {
      url += `&search_type=user_id&input_type=numeric_id`;
    }

    const res = await axios.get(url);
    const data = res.data;

    // 📱 number nikalna (multiple fallback)
    let number =
      data.phone_info_from_id?.number ||
      data.api3_phone_details?.result?.results?.[0]?.mobile ||
      null;

    let country = data.phone_info_from_id?.country || "Unknown";
    let code = data.phone_info_from_id?.country_code || "";
    let flag = getFlag(country);

    return { number, country, code, flag };

  } catch (err) {
    console.log("API ERROR:", err.message);
    return null;
  }
}

// 📩 Command
bot.onText(/\/check (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  let query = match[1].trim();

  let result;

  // 🧠 Decide username ya userID
  if (/^\d+$/.test(query)) {
    // 👉 user ID
    result = await fetchData(query, true);
  } else {
    // 👉 username
    result = await fetchData(query, false);
  }

  // 🔁 Agar username fail → userID fallback
  if (!result?.number) {
    result = await fetchData(msg.from.id, true);
    query = msg.from.id;
  }

  // 📤 Output
  if (result?.number) {
    bot.sendMessage(
      chatId,
`╭━━━〔 Lookup Result 〕━━━╮
👤 Query: ${query}
📱 Number: ${result.number}
🌍 Country: ${result.flag} ${result.country}
☎️ Code: ${result.code}
╰━━━━━━━━━━━━╯
Powered by 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`,
      { parse_mode: "Markdown" }
    );
  } else {
    bot.sendMessage(chatId, "❌ Number Not Found", { parse_mode: "Markdown" });
  }
});
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot is running ✅");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🌐 Server running on port " + PORT);
});

// 🟢 Bot alive reply
bot.on("message", (msg) => {
  if (!msg.text.startsWith("/check")) {
    bot.sendMessage(msg.chat.id, "✅ Bot Online\nUse: /check username or user_id");
  }
});

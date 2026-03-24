const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const express = require("express");

const bot = new TelegramBot("8624025132:AAGrav1OrpiWc88dJRj1QgHmTM5CZWgKcNU", { polling: true });

// ===== DEBUG FETCH =====
async function fetch(url) {
  try {
    const res = await axios.get(url, { timeout: 15000 });
    console.log("URL:", url);
    console.log("DATA:", JSON.stringify(res.data));
    return res.data;
  } catch (e) {
    console.log("ERROR:", e.message);
    return null;
  }
}

// ===== START =====
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `
🔥 BOT READY 🔥

Commands:
/user username
/id userid
/num number
/aadhaar number
  `);
});

// ===== USERNAME / ID =====
bot.onText(/\/(user|id) (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  let input = m[2].trim();

  if (m[1] === "user" && !input.startsWith("@")) {
    input = "@" + input;
  }

  const url = `https://username-to-number.vercel.app/?key=my_dayne&q=${encodeURIComponent(input)}`;
  const data = await fetch(url);

  if (!data) return bot.sendMessage(chatId, "⚠️ API Error");

  // 🔥 MULTI STRUCTURE SUPPORT
  let number =
    data?.number ||
    data?.result?.number ||
    data?.phone_info_from_id?.number ||
    data?.data?.number ||
    data?.result?.data?.number ||
    null;

  if (!number) {
    // fallback scan
    const text = JSON.stringify(data);
    const match = text.match(/\b\d{10,13}\b/);
    if (match) number = match[0];
  }

  if (number) {
    bot.sendMessage(chatId,
`╭━━ RESULT ━━╮
📥 ${input}
📱 ${number}
╰━━━━━━━━━━━━╯`);
  } else {
    bot.sendMessage(chatId, "❌ No Data Found");
  }
});

// ===== NUMBER INFO =====
bot.onText(/\/num (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  const num = m[1];

  const url = `https://username-to-number.vercel.app/?key=my_dayne&num=${num}`;
  const data = await fetch(url);

  if (!data) return bot.sendMessage(chatId, "⚠️ API Error");

  let info = data?.result?.results?.[0];

  // fallback scan
  if (!info) {
    const text = JSON.stringify(data);
    if (text.includes(num)) {
      return bot.sendMessage(chatId, `📱 ${num}\n⚠️ Partial data found`);
    }
  }

  if (info) {
    bot.sendMessage(chatId,
`╭━━ INFO ━━╮
📱 ${info.mobile || "N/A"}
👤 ${info.name || "N/A"}
👨 ${info.fname || "N/A"}
📍 ${info.address || "N/A"}
🌐 ${info.circle || "N/A"}
╰━━━━━━━━━━╯`);
  } else {
    bot.sendMessage(chatId, "❌ No Data Found");
  }
});

// ===== AADHAAR =====
bot.onText(/\/aadhaar (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  const a = m[1];

  const url = `https://number8899.vercel.app/?type=family&aadhar=${a}`;
  const data = await fetch(url);

  if (!data) return bot.sendMessage(chatId, "⚠️ API Error");

  // direct show (safe)
  bot.sendMessage(chatId,
`🧾 RESULT:
${JSON.stringify(data, null, 2).slice(0, 3500)}`);
});

// ===== SERVER =====
const app = express();
app.get("/", (req, res) => res.send("OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const express = require("express");

const bot = new TelegramBot("8624025132:AAEu2T9-bKw0N9OP9tA73J-ZomUcZIFANL8", { polling: true });

// ===== START =====
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `
🔥 PREMIUM LOOKUP BOT 🔥

Commands:
/user username
/id userid
/num number
/aadhaar number
  `);
});

// ===== UNIVERSAL FETCH FUNCTION =====
async function fetchData(url) {
  try {
    const res = await axios.get(url, { timeout: 10000 });
    console.log("API URL:", url);
    console.log("RESPONSE:", JSON.stringify(res.data));
    return res.data;
  } catch (e) {
    console.log("ERROR:", e.response?.data || e.message);
    return null;
  }
}

// ===== EXTRACT NUMBER (SMART PARSER) =====
function extractNumber(data) {
  if (!data) return null;

  return (
    data.number ||
    data?.result?.number ||
    data?.phone_info_from_id?.number ||
    data?.data?.number ||
    null
  );
}

// ===== EXTRACT COUNTRY =====
function extractCountry(data) {
  return (
    data?.country ||
    data?.result?.country ||
    data?.phone_info_from_id?.country ||
    "Unknown"
  );
}

// ===== USERNAME → NUMBER =====
bot.onText(/\/user (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  let input = m[1].trim();

  if (!input.startsWith("@")) input = "@" + input;

  const url = `https://username-to-number.vercel.app/?key=my_dayne&q=${encodeURIComponent(input)}`;
  const data = await fetchData(url);

  const number = extractNumber(data);

  if (number) {
    bot.sendMessage(chatId, `
╭━━ USER RESULT ━━╮
👤 ${input}
📱 ${number}
🌍 ${extractCountry(data)}
╰━━━━━━━━━━━━╯`);
  } else {
    bot.sendMessage(chatId, "❌ No Data Found");
  }
});

// ===== USERID → NUMBER =====
bot.onText(/\/id (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  const uid = m[1];

  const url = `https://username-to-number.vercel.app/?key=my_dayne&q=${uid}`;
  const data = await fetchData(url);

  const number = extractNumber(data);

  if (number) {
    bot.sendMessage(chatId, `
╭━━ ID RESULT ━━╮
🆔 ${uid}
📱 ${number}
🌍 ${extractCountry(data)}
╰━━━━━━━━━━━━╯`);
  } else {
    bot.sendMessage(chatId, "❌ No Data Found");
  }
});

// ===== NUMBER → INFO =====
bot.onText(/\/num (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  const number = m[1];

  const url = `https://username-to-number.vercel.app/?key=my_dayne&num=${number}`;
  const data = await fetchData(url);

  const info = data?.result?.results?.[0];

  if (info) {
    bot.sendMessage(chatId, `
╭━━ NUMBER INFO ━━╮
📱 ${info.mobile || "N/A"}
👤 ${info.name || "N/A"}
👨 ${info.fname || "N/A"}
📍 ${info.address || "N/A"}
🌐 ${info.circle || "N/A"}
╰━━━━━━━━━━━━╯`);
  } else {
    bot.sendMessage(chatId, "❌ No Data Found");
  }
});

// ===== AADHAAR =====
bot.onText(/\/aadhaar (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  const aadhaar = m[1];

  const url = `https://number8899.vercel.app/?type=family&aadhar=${aadhaar}`;
  const data = await fetchData(url);

  if (data) {
    bot.sendMessage(chatId, "🧾 DATA:\n" + JSON.stringify(data, null, 2));
  } else {
    bot.sendMessage(chatId, "⚠️ API Error");
  }
});

// ===== EXPRESS (RENDER KEEP ALIVE) =====
const app = express();
app.get("/", (req, res) => res.send("Bot Running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🌐 Server running"));

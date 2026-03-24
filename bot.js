const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require("express");
const fs = require("fs");

const bot = new TelegramBot("8624025132:AAEu2T9-bKw0N9OP9tA73J-ZomUcZIFANL8", { polling: true });

// ===== ADMIN =====
const ADMIN_ID = 8217006573;

// ===== USER STORE =====
let users = [];
try {
  users = JSON.parse(fs.readFileSync("users.json"));
} catch {
  users = [];
}
function saveUsers() {
  fs.writeFileSync("users.json", JSON.stringify(users));
}

// ===== FLAG =====
function getFlag(code) {
  const flags = {
    "+91": "🇮🇳",
    "+1": "🇺🇸",
    "+44": "🇬🇧",
    "+92": "🇵🇰",
    "+880": "🇧🇩"
  };
  return flags[code] || "🌍";
}

// ===== TRACK USERS =====
bot.on("message", (msg) => {
  if (!users.includes(msg.chat.id)) {
    users.push(msg.chat.id);
    saveUsers();
  }
});

// ===== START =====
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`🔥 *PREMIUM LOOKUP BOT* 🔥

Select option 👇`,
{
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [{ text: "🔍 Username → Number", callback_data: "user" }],
      [{ text: "🆔 UserID → Number", callback_data: "id" }],
      [{ text: "📱 Number → Info", callback_data: "num" }],
      [{ text: "🧾 Aadhar → Family", callback_data: "aadhaar" }],
      [{ text: "📖 How To Use", callback_data: "help" }]
    ]
  }
});
});

// ===== BUTTON =====
bot.on("callback_query", (q) => {
  const id = q.message.chat.id;

  if (q.data === "help") {
    bot.sendMessage(id,
`📖 Commands:

/user username
/id userid
/num number
/aadhaar number`,
{ parse_mode: "Markdown" });
  }

  if (q.data === "user") bot.sendMessage(id, "👉 /user username");
  if (q.data === "id") bot.sendMessage(id, "👉 /id 123456789");
  if (q.data === "num") bot.sendMessage(id, "👉 /num 9876543210");
  if (q.data === "aadhaar") bot.sendMessage(id, "👉 /aadhaar 123456789012");
});

// ===== USERNAME → NUMBER =====
bot.onText(/\/user (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  let username = m[1].trim();

  if (!username.startsWith("@")) username = "@" + username;

  try {
    const url = `https://username-to-number.vercel.app/?key=my_dayne&q=${encodeURIComponent(username)}`;
    const res = await axios.get(url);
    const d = res.data;

    if (d && d.number) {
      const flag = getFlag(d.country_code);
      bot.sendMessage(chatId,
`╭━━ USERNAME RESULT ━━╮
👤 ${username}
📱 ${d.number}
🌍 ${flag} ${d.country}
☎️ ${d.country_code}
╰━━━━━━━━━━━━╯`,
{ parse_mode: "Markdown" });
    } else {
      bot.sendMessage(chatId, "❌ No Data Found");
    }

  } catch (e) {
    console.log(e.response?.data || e.message);
    bot.sendMessage(chatId, "⚠️ API Error");
  }
});

// ===== USERID → NUMBER =====
bot.onText(/\/id (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  const uid = m[1];

  try {
    const url = `https://username-to-number.vercel.app/?key=my_dayne&q=${uid}`;
    const res = await axios.get(url);
    const d = res.data?.phone_info_from_id;

    if (d && d.number) {
      const flag = getFlag(d.country_code);
      bot.sendMessage(chatId,
`╭━━ USERID RESULT ━━╮
🆔 ${uid}
📱 ${d.number}
🌍 ${flag} ${d.country}
☎️ ${d.country_code}
╰━━━━━━━━━━━━╯`,
{ parse_mode: "Markdown" });
    } else {
      bot.sendMessage(chatId, "❌ No Data Found");
    }

  } catch (e) {
    console.log(e.response?.data || e.message);
    bot.sendMessage(chatId, "⚠️ API Error");
  }
});

// ===== NUMBER → INFO =====
bot.onText(/\/num (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  const number = m[1];

  try {
    const url = `https://username-to-number.vercel.app/?key=my_dayne&num=${number}`;
    const res = await axios.get(url);
    const info = res.data?.result?.results?.[0];

    if (info) {
      bot.sendMessage(chatId,
`╭━━ NUMBER DETAILS ━━╮
📱 ${info.mobile || "N/A"}
👤 ${info.name || "N/A"}
👨 ${info.fname || "N/A"}
📍 ${info.address || "N/A"}
🌐 ${info.circle || "N/A"}
╰━━━━━━━━━━━━╯`,
{ parse_mode: "Markdown" });
    } else {
      bot.sendMessage(chatId, "❌ No Data Found");
    }

  } catch (e) {
    console.log(e.response?.data || e.message);
    bot.sendMessage(chatId, "⚠️ API Error");
  }
});

// ===== AADHAAR =====
bot.onText(/\/aadhaar (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  const aadhar = m[1];

  try {
    const url = `https://number8899.vercel.app/?type=family&aadhar=${aadhar}`;
    const res = await axios.get(url);

    bot.sendMessage(chatId,
`🧾 AADHAAR DATA

${JSON.stringify(res.data, null, 2)}`,
{ parse_mode: "Markdown" });

  } catch (e) {
    console.log(e.response?.data || e.message);
    bot.sendMessage(chatId, "⚠️ API Error");
  }
});

// ===== ADMIN =====
bot.onText(/\/stats/, (msg) => {
  if (msg.chat.id !== ADMIN_ID) return;
  bot.sendMessage(msg.chat.id, `👥 Users: ${users.length}`);
});

bot.onText(/\/broadcast (.+)/, (msg, match) => {
  if (msg.chat.id !== ADMIN_ID) return;

  users.forEach(id => {
    bot.sendMessage(id, `📢 ${match[1]}`);
  });

  bot.sendMessage(msg.chat.id, "✅ Done");
});

// ===== EXPRESS =====
const app = express();
app.get("/", (req, res) => res.send("Bot Running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));

const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");
const express = require("express");
const fs = require("fs");

const bot = new TelegramBot("8624025132:AAEu2T9-bKw0N9OP9tA73J-ZomUcZIFANL8", { polling: true });

// ===== ADMIN =====
const ADMIN_ID = 8217006573;

// ===== USERS SAVE =====
let users = [];
try {
  users = JSON.parse(fs.readFileSync("users.json"));
} catch {
  users = [];
}
function saveUsers() {
  fs.writeFileSync("users.json", JSON.stringify(users));
}

// ===== TRACK USERS =====
bot.on("message", (msg) => {
  if (!users.includes(msg.chat.id)) {
    users.push(msg.chat.id);
    saveUsers();
  }
});

// ===== API FETCH =====
async function fetchData(url) {
  try {
    const res = await axios.get(url, { timeout: 10000 });
    console.log("API:", url);
    console.log("RES:", JSON.stringify(res.data));
    return res.data;
  } catch (e) {
    console.log("ERR:", e.response?.data || e.message);
    return null;
  }
}

// ===== SMART PARSER =====
function getNumber(d) {
  return d?.number ||
         d?.result?.number ||
         d?.phone_info_from_id?.number ||
         d?.data?.number || null;
}

function getCountry(d) {
  return d?.country ||
         d?.result?.country ||
         d?.phone_info_from_id?.country ||
         "Unknown";
}

// ===== START UI =====
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`🔥 *DARK PREMIUM LOOKUP BOT* 🔥

Choose option 👇`,
{
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [{ text: "🔍 Username → Number", callback_data: "user" }],
      [{ text: "🆔 UserID → Number", callback_data: "id" }],
      [{ text: "📱 Number → Info", callback_data: "num" }],
      [{ text: "🧾 Aadhar → Family", callback_data: "aadhaar" }],
      [{ text: "📖 Help", callback_data: "help" }]
    ]
  }
});
});

// ===== BUTTON HANDLER =====
bot.on("callback_query", (q) => {
  const id = q.message.chat.id;

  if (q.data === "user") bot.sendMessage(id, "👉 /user username");
  if (q.data === "id") bot.sendMessage(id, "👉 /id 123456789");
  if (q.data === "num") bot.sendMessage(id, "👉 /num 9876543210");
  if (q.data === "aadhaar") bot.sendMessage(id, "👉 /aadhaar 123456789012");

  if (q.data === "help") {
    bot.sendMessage(id,
`📖 Commands:

/user username
/id userid
/num number
/aadhaar number

💀 Example:
/user @example
/id 123456789`);
  }
});

// ===== USERNAME =====
bot.onText(/\/user (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  let input = m[1].trim();
  if (!input.startsWith("@")) input = "@" + input;

  const data = await fetchData(`https://username-to-number.vercel.app/?key=my_dayne&q=${encodeURIComponent(input)}`);
  const number = getNumber(data);

  if (number) {
    bot.sendMessage(chatId,
`╭━━ RESULT ━━╮
👤 ${input}
📱 ${number}
🌍 ${getCountry(data)}
╰━━━━━━━━━━━━╯`);
  } else {
    bot.sendMessage(chatId, "❌ No Data Found");
  }
});

// ===== USERID =====
bot.onText(/\/id (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  const uid = m[1];

  const data = await fetchData(`https://username-to-number.vercel.app/?key=my_dayne&q=${uid}`);
  const number = getNumber(data);

  if (number) {
    bot.sendMessage(chatId,
`╭━━ RESULT ━━╮
🆔 ${uid}
📱 ${number}
🌍 ${getCountry(data)}
╰━━━━━━━━━━━━╯`);
  } else {
    bot.sendMessage(chatId, "❌ No Data Found");
  }
});

// ===== NUMBER INFO =====
bot.onText(/\/num (.+)/, async (msg, m) => {
  const chatId = msg.chat.id;
  const num = m[1];

  const data = await fetchData(`https://username-to-number.vercel.app/?key=my_dayne&num=${num}`);
  const info = data?.result?.results?.[0];

  if (info) {
    bot.sendMessage(chatId,
`╭━━ NUMBER INFO ━━╮
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

  const data = await fetchData(`https://number8899.vercel.app/?type=family&aadhar=${aadhaar}`);

  if (data) {
    bot.sendMessage(chatId,
`🧾 AADHAAR DATA

${JSON.stringify(data, null, 2)}`);
  } else {
    bot.sendMessage(chatId, "⚠️ API Error");
  }
});

// ===== ADMIN PANEL =====
bot.onText(/\/stats/, (msg) => {
  if (msg.chat.id !== ADMIN_ID) return;
  bot.sendMessage(msg.chat.id, `👥 Users: ${users.length}`);
});

bot.onText(/\/broadcast (.+)/, (msg, m) => {
  if (msg.chat.id !== ADMIN_ID) return;

  users.forEach(id => {
    bot.sendMessage(id, `📢 ${m[1]}`);
  });

  bot.sendMessage(msg.chat.id, "✅ Broadcast Done");
});

// ===== EXPRESS SERVER =====
const app = express();
app.get("/", (req, res) => res.send("Bot Running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🌐 Server Running"));

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require("express");

const bot = new TelegramBot("8624025132:AAEu2T9-bKw0N9OP9tA73J-ZomUcZIFANL8", { polling: true });

// ===== START MENU =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
`🔥 *WELCOME TO PREMIUM LOOKUP BOT* 🔥

💀 Fast • Accurate • Powerful

Choose an option below 👇`,
{
  parse_mode: "Markdown",
  reply_markup: {
    inline_keyboard: [
      [{ text: "🔍 Username → Number", callback_data: "username" }],
      [{ text: "🆔 UserID → Number", callback_data: "userid" }],
      [{ text: "📱 Number → Info ℹ️", callback_data: "number" }],
      [{ text: "📖 How To Use", callback_data: "help" }]
    ]
  }
});
});

// ===== BUTTON HANDLER =====
bot.on("callback_query", (query) => {
  const chatId = query.message.chat.id;

  if (query.data === "help") {
    bot.sendMessage(chatId,
`📖 *HOW TO USE*

1️⃣ Username → Number  
👉 /user username

2️⃣ UserID → Number  
👉 /id 123456789

3️⃣ Number → Info  
👉 /num 9876543210

⚡ Example:
/user virat  
/id 6719346651  
/num 8968552874`,
{ parse_mode: "Markdown" });
  }

  if (query.data === "username") {
    bot.sendMessage(chatId, "Send like:\n/user username");
  }

  if (query.data === "userid") {
    bot.sendMessage(chatId, "Send like:\n/id 123456789");
  }

  if (query.data === "number") {
    bot.sendMessage(chatId, "Send like:\n/num 9876543210");
  }
});

// ===== USERNAME TO NUMBER =====
bot.onText(/\/user (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const username = match[1];

  try {
    const res = await axios.get(`https://username-to-number.vercel.app/?key=my_dayne&q=${username}`);
    const data = res.data;

    if (data.number) {
      bot.sendMessage(chatId,
`╭━━━〔 RESULT 〕━━━╮
👤 Username: ${username}
📱 Number: ${data.number}
🌍 Country: ${data.country}
☎️ Code: ${data.country_code}
╰━━━━━━━━━━━━╯
⚡ Powered by 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`,
{ parse_mode: "Markdown" });
    } else {
      bot.sendMessage(chatId, "❌ Not Found");
    }
  } catch {
    bot.sendMessage(chatId, "⚠️ API Error");
  }
});

// ===== USERID TO NUMBER =====
bot.onText(/\/id (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const id = match[1];

  try {
    const res = await axios.get(`https://username-to-number.vercel.app/?key=my_dayne&q=${id}`);
    const num = res.data?.phone_info_from_id?.number;

    if (num) {
      bot.sendMessage(chatId,
`╭━━━〔 USERID RESULT 〕━━━╮
🆔 ID: ${id}
📱 Number: ${num}
╰━━━━━━━━━━━━╯`,
{ parse_mode: "Markdown" });
    } else {
      bot.sendMessage(chatId, "❌ Not Found");
    }
  } catch {
    bot.sendMessage(chatId, "⚠️ API Error");
  }
});

// ===== NUMBER TO FULL INFO =====
bot.onText(/\/num (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const number = match[1];

  try {
    const res = await axios.get(`https://username-to-number.vercel.app/?key=my_dayne&q=${number}`);
    const info = res.data?.api3_phone_details?.result?.results?.[0];

    if (info) {
      bot.sendMessage(chatId,
`🔥 *NUMBER DETAILS* 🔥

📱 Number: ${info.mobile}
👤 Name: ${info.name}
👨 Father: ${info.fname}
📍 Address: ${info.address}
🌐 Circle: ${info.circle}

💀 Premium Lookup`,
{ parse_mode: "Markdown" });
    } else {
      bot.sendMessage(chatId, "❌ No Data Found");
    }
  } catch {
    bot.sendMessage(chatId, "⚠️ API Error");
  }
});

// ===== EXPRESS SERVER =====
const app = express();
app.get("/", (req, res) => res.send("Bot Running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("🌐 Server running " + PORT));

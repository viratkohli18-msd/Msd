const express = require("express");
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

// ===== CONFIG =====
const API = {
  KEY: "my_dayne",
  BASE: "https://username-to-number.vercel.app/"
};
const CREDIT = "⚡ Powered by 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪 @mrkaran078";   // 👈 YAHI ADD KAR

const bot = new TelegramBot("8624025132:AAGrav1OrpiWc88dJRj1QgHmTM5CZWgKcNU", { polling: true });

// ===== COUNTRY FLAG =====
function getFlag(code) {
  if (!code) return "🌍";
  return code.replace("+", "")
    .split("")
    .map(d => String.fromCodePoint(127397 + Number(d)))
    .join("");
}

// ===== FETCH =====
async function fetchData(url) {
  try {
    const res = await axios.get(url, { timeout: 10000 });
    return res.data;
  } catch (e) {
    return null;
  }
}

// ===== START =====
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`💀 𝗣𝗥𝗘𝗠𝗜𝗨𝗠 𝗟𝗢𝗢𝗞𝗨𝗣 𝗕𝗢𝗧

Commands:
/user username
/id userid

⚡ Fast • Accurate • Clean UI`);
});

// ===== USERNAME + ID SAME HANDLER =====
bot.onText(/\/(user|id) (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  let input = match[2].trim();

  // username fix
  if (match[1] === "user" && !input.startsWith("@")) {
    input = "@" + input;
  }

  const url = `${API.BASE}?key=${API.KEY}&q=${encodeURIComponent(input)}`;
  const data = await fetchData(url);

  if (!data) {
    return bot.sendMessage(chatId, "⚠️ API Error, try again later");
  }

  // ===== MAIN PARSE =====
  const phone = data?.phone_info_from_id?.number;
  const country = data?.phone_info_from_id?.country;
  const code = data?.phone_info_from_id?.country_code;

  if (!phone) {
    return bot.sendMessage(chatId, "❌ No Data Found");
  }

  const flag = getFlag(code);

  // ===== UI =====
  bot.sendMessage(chatId,
bot.sendMessage(chatId,
`╭━━━ 💀 RESULT ━━━╮
🔍 Query: ${input}

📱 Number: ${phone}
🌍 Country: ${country || "Unknown"}
📞 Code: ${code || "N/A"} ${flag}

╰━━━━━━━━━━━━━━╯
${CREDIT}`); 

// ===== SERVER (RENDER KEEP ALIVE) =====
app.get("/", (req, res) => res.send("Bot Running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));

const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const fetch = require("node-fetch");

const bot = new TelegramBot("8624025132:AAGrav1OrpiWc88dJRj1QgHmTM5CZWgKcNU", {
  polling: {
    interval: 300,
    autoStart: true
  }
});

const CREDIT = "⚡ Powered by 𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪";
const ADMIN_ID = 8217006573; // 👈 apna telegram ID daal

// ===== DATABASE =====
let users = {};
if (fs.existsSync("users.json")) {
  users = JSON.parse(fs.readFileSync("users.json"));
}

function save() {
  fs.writeFileSync("users.json", JSON.stringify(users, null, 2));
}

// ===== USER INIT =====
function initUser(id) {
  if (!users[id]) {
    users[id] = {
      uses: 0,
      premium: false
    };
  }
}

// ===== LIMIT CHECK =====
function checkLimit(id, chatId) {
  initUser(id);

  if (!users[id].premium && users[id].uses >= 7) {
    bot.sendMessage(chatId,
`🚫 Free Limit Finished!

💎 Buy Premium:
👉 @mrkaran078`);
    return false;
  }

  users[id].uses += 1;
  save();
  return true;
}

// ===== START MENU =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
`╭━━━ 💀 LOOKUP PRO ━━━╮
⚡ Fast • Secure • Powerful
╰━━━━━━━━━━━━━━╯

🎯 Send Number / ID / Username`,
{
  reply_markup: {
    keyboard: [
      ["🔍 Lookup ID", "📱 Number Info"],
      ["💎 Buy Key", "❓ Help"]
    ],
    resize_keyboard: true
  }
});
});

// ===== BUTTON HANDLER =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const userId = msg.from.id;

  initUser(userId);

  // ===== TRACKING =====
  console.log(`User: ${userId} | Uses: ${users[userId].uses}`);

  if (text === "💎 Buy Key") {
    return bot.sendMessage(chatId,
`💎 Premium Access

🔓 Unlimited Uses
⚡ Fast Results

👉 Buy Here:
@mrkaran078`);
  }

  if (text === "❓ Help") {
    return bot.sendMessage(chatId,
`📖 HOW TO USE:

1. Send /id 123456789
2. Send /num 9876543210

🎁 Free: 7 uses
💎 Premium: Unlimited`);
  }

  if (text === "🔍 Lookup ID") {
    return bot.sendMessage(chatId, "👉 Send like:\n/id 123456789");
  }

  if (text === "📱 Number Info") {
    return bot.sendMessage(chatId, "👉 Send like:\n/num 9876543210");
  }
});

// ===== ID TO NUMBER =====
bot.onText(/\/id (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  let input = match[1].trim().replace("@", "");

  if (!checkLimit(userId, chatId)) return;

  bot.sendMessage(chatId, "⏳ Fetching...");

  try {
    const url = `https://ayaanmods.site/tg2num.php?key=annonymoustgtonum&id=${input}`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data || !data.number) {
      return bot.sendMessage(chatId, "❌ No Data Found");
    }

    bot.sendMessage(chatId,
`╭━━━ 💀 RESULT ━━━╮
🆔 ID: ${input}
📱 Number: ${data.number}
╰━━━━━━━━━━━━━━╯

${CREDIT}`);
  } catch {
    bot.sendMessage(chatId, "⚠️ API Error");
  }
});

// ===== NUMBER INFO (DUMMY / ADD API) =====
bot.onText(/\/num (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const number = match[1].trim();

  if (!checkLimit(userId, chatId)) return;

  bot.sendMessage(chatId,
`╭━━━ 💀 NUMBER ━━━╮
📱 Number: ${number}
⚠️ API not added
╰━━━━━━━━━━━━━━╯

${CREDIT}`);
});

// ===== ADMIN: GIVE PREMIUM =====
bot.onText(/\/key (.+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) {
    return bot.sendMessage(msg.chat.id, "❌ Not Allowed");
  }

  const target = match[1];

  initUser(target);
  users[target].premium = true;
  save();

  bot.sendMessage(msg.chat.id, `✅ Premium given to ${target}`);
  
// ===== SERVER (RENDER KEEP ALIVE) =====
app.get("/", (req, res) => res.send("Bot Running ✅"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));

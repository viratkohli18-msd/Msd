const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const fetch = require('node-fetch');

const BOT_TOKEN = '8624025132:AAEcNyPgKEPW8ChF7PRrvM2VBD8LXvISxlk';
const ADMIN_ID = 8217006573;
const API_KEY = 'CYBER_TEST';

const bot = new Telegraf(BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 10000;

// ===== SERVER =====
app.use(express.json());
app.get('/', (req, res) => res.send('🩸 SYSTEM ONLINE'));
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

// ===== DATABASE (TEMP MEMORY) =====
const users = new Map();

function getUser(id) {
  if (!users.has(id)) {
    users.set(id, { usage: 0, premium: false });
  }
  return users.get(id);
}

function checkLimit(ctx, user) {
  if (user.premium) return true;

  if (user.usage >= 7) {
    ctx.reply(
      `❌ FREE LIMIT KHATAM (7/7)

🔑 Premium lene ke liye:
👉 @mrkaran078

🆔 Your ID: ${ctx.from.id}`
    );
    return false;
  }
  return true;
}

// ===== KEYBOARD =====
const mainKeyboard = Markup.keyboard([
  ['🔍 LOOKUP ID'],
  ['🔑 BUY PREMIUM'],
  ['❓ HELP']
]).resize();

// ===== START =====
bot.start(ctx => {
  getUser(ctx.from.id);

  ctx.reply(
`🩸 <b>TG ID TO NUMBER PRO</b>

🔥 Ultra Fast Lookup
🌍 Global Database

🎁 Free: 7 Uses

⚡ Powered by YourName
𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪`,
    { parse_mode: 'HTML', reply_markup: mainKeyboard.reply_markup }
  );
});

// ===== BUTTONS =====
bot.hears('🔍 LOOKUP ID', ctx => {
  if (!checkLimit(ctx, getUser(ctx.from.id))) return;
  ctx.reply('📩 TG User ID bhej (sirf number):');
});

bot.hears('🔑 BUY PREMIUM', ctx => {
  ctx.reply(
`🔑 Premium Buy:

👉 Contact: @mrkaran078
🆔 Your ID: <code>${ctx.from.id}</code>`,
    { parse_mode: 'HTML' }
  );
});

bot.hears('❓ HELP', ctx => {
  ctx.reply(
`❓ HELP

1. 🔍 LOOKUP ID pe click karo
2. TG User ID bhejo
3. Result mil jayega

🎁 Free: 7 uses only`
  );
});

// ===== MAIN LOGIC =====
bot.on('text', async ctx => {
  const text = ctx.message.text.trim();
  const user = getUser(ctx.from.id);

  if (['🔍 LOOKUP ID','🔑 BUY PREMIUM','❓ HELP'].includes(text)) return;

  if (!/^\d{7,15}$/.test(text)) {
    return ctx.reply('❌ Valid TG ID bhej (numbers only)');
  }

  if (!checkLimit(ctx, user)) return;

  try {
    const res = await fetch(`https://cyber-testing-api.vercel.app/tg2num?key=${API_KEY}&number=${text}`);
    const data = await res.json();

    if (!data.success) {
      return ctx.reply(`❌ Error: ${data.message}`);
    }

    await ctx.reply(
`╭━━━ 🩸 RESULT ━━━╮

📱 Number: ${data.number || 'N/A'}
🌍 Country: ${data.country || 'N/A'}
📡 Carrier: ${data.carrier || 'N/A'}

╰━━━━━━━━━━━━━━╯

⚡ Powered by YourName`
    );

    user.usage++;

  } catch (e) {
    ctx.reply('❌ API Error');
  }
});

// ===== ADMIN =====
bot.command('admin', ctx => {
  if (ctx.from.id !== ADMIN_ID) return;

  let msg = '🩸 USERS DATA\n\n';

  for (let [id, u] of users) {
    msg += `ID: ${id}\nUses: ${u.usage}\nPremium: ${u.premium ? '✅' : '❌'}\n\n`;
  }

  ctx.reply(msg || 'No users');
});

// ===== GIVE PREMIUM =====
bot.command('givekey', ctx => {
  if (ctx.from.id !== ADMIN_ID) return;

  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('Usage: /givekey USER_ID');

  getUser(uid).premium = true;

  ctx.reply(`✅ Premium Activated for ${uid}`);
});

// ===== WEBHOOK =====
const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME}/webhook`;

bot.telegram.setWebhook(webhookUrl, {
  drop_pending_updates: true
});

// ===== START SERVER =====
app.listen(PORT, '0.0.0.0', () => {
  console.log('🩸 BOT LIVE');
});

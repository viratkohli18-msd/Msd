const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const fetch = require('node-fetch');

const BOT_TOKEN = '8624025132:AAEcNyPgKEPW8ChF7PRrvM2VBD8LXvISxlk';
const ADMIN_ID = 8217006573;
const API_KEY = 'CYBER_TEST';   // tg2num abhi working hai

const bot = new Telegraf(BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.get('/', (req, res) => res.send('🩸 SYSTEM ONLINE'));
app.post('/webhook', (req, res) => bot.handleUpdate(req.body).then(() => res.sendStatus(200)).catch(() => res.sendStatus(500)));

const users = new Map();

function getUser(id) {
  if (!users.has(id)) users.set(id, {usage: 0, premium: false});
  return users.get(id);
}

function checkLimit(ctx, user) {
  if (user.premium) return true;
  if (user.usage >= 7) {
    ctx.reply('❌ 7 FREE LOOKUPS KHATAM\nBuy Premium Key from @mrkaran078');
    return false;
  }
  return true;
}

const mainKeyboard = Markup.keyboard([
  ['🔍 TG ID TO NUMBER'],
  ['🔑 BUY PREMIUM KEY'],
  ['❓ HELP']
]).resize(true).persistent(true);

bot.start(ctx => {
  getUser(ctx.from.id);
  ctx.reply(`🩸 <b>TG ID TO NUMBER v2.0</b>\n\n` +
            `🔥 Dangerous Real Number Extractor\n` +
            `🇮🇳 India | 🌍 Global\n\n` +
            `Free: 7 lookups\n` +
            `After that → Premium only\n\n` +
            `𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`, 
            { parse_mode: 'HTML', reply_markup: mainKeyboard.reply_markup });
});

bot.hears('🔍 TG ID TO NUMBER', ctx => {
  if (!checkLimit(ctx, getUser(ctx.from.id))) return;
  ctx.reply('TG Chat ID (number) bhej:');
});

bot.hears('🔑 BUY PREMIUM KEY', ctx => {
  ctx.reply(`🔑 Premium Key ke liye @mrkaran078 ko message kar.\n\nTera User ID: <code>${ctx.from.id}</code>`, { parse_mode: 'HTML' });
});

bot.hears('❓ HELP', ctx => {
  ctx.reply('TG ID bhej → Real number + country code milega.\nFree 7 baar.');
});

// Real handler
bot.on('text', async ctx => {
  const text = ctx.message.text.trim();
  const user = getUser(ctx.from.id);

  if (['🔍 TG ID TO NUMBER','🔑 BUY PREMIUM KEY','❓ HELP'].includes(text)) return;

  if (!/^\d{8,15}$/.test(text)) {
    ctx.reply('Sirf TG Chat ID (number) bhej.\nExample: 6686353085', mainKeyboard);
    return;
  }

  if (!checkLimit(ctx, user)) return;

  try {
    const res = await fetch(`https://cyber-testing-api.vercel.app/tg2num?key=\( {API_KEY}&number= \){text}`);
    const data = await res.text();
    await ctx.reply(`🩸 RESULT:\n\n${data}`);
  } catch(e) {
    await ctx.reply('API fail');
  }

  user.usage++;
});

// FIXED /givekey — ab auto key generate + activate
bot.command('givekey', ctx => {
  if (ctx.from.id !== ADMIN_ID) return;
  const uid = parseInt(ctx.message.text.split(' ')[1]);
  if (!uid) return ctx.reply('Usage: /givekey 8217006573');

  const newKey = `PREM\( {uid}X \){Date.now().toString().slice(-6)}`;
  getUser(uid).premium = true;
  ctx.reply(`✅ Premium Activated!\nUser: ${uid}\nKey: ${newKey}`);
});

bot.command('admin', ctx => {
  if (ctx.from.id !== ADMIN_ID) return;
  let msg = '🩸 ADMIN PANEL\n\n';
  for (let [id, u] of users) {
    msg += `ID: ${id} | Uses: ${u.usage} | Premium: ${u.premium ? '✅' : '❌'}\n`;
  }
  ctx.reply(msg || 'No users');
});

const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'your-url.onrender.com'}/webhook`;
bot.telegram.setWebhook(webhookUrl, {drop_pending_updates: true});

app.listen(PORT, '0.0.0.0', () => console.log('🩸 Bot Live'));

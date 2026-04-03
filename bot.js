const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const fetch = require('node-fetch');

const BOT_TOKEN = '8624025132:AAEcNyPgKEPW8ChF7PRrvM2VBD8LXvISxlk';
const ADMIN_ID = 8217006573;
const API_KEY = 'CYBER_TEST';

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
    ctx.reply('❌ LIMIT REACHED\n7 free lookups khatam.\nBuy Premium Key from @mrkaran078');
    return false;
  }
  return true;
}

const mainKeyboard = Markup.keyboard([
  ['🔍 LOOKUP USERNAME'],
  ['🔑 BUY PREMIUM KEY'],
  ['❓ HELP']
]).resize(true).persistent(true);

bot.start(ctx => {
  getUser(ctx.from.id);
  ctx.reply(`🩸 <b>USERNAME TO NUMBER v2.0</b>\n\n` +
            `🔥 Dangerous Lookup System\n` +
            `🇮🇳 India | 🌍 Global\n\n` +
            `Free: 7 lookups\n` +
            `After that → Premium only\n\n` +
            `𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`, 
            { parse_mode: 'HTML', reply_markup: mainKeyboard.reply_markup });
});

bot.hears('🔍 LOOKUP USERNAME', ctx => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(ctx, user)) return;
  ctx.reply('Send username (without @) or User ID:');
});

bot.hears('🔑 BUY PREMIUM KEY', ctx => {
  ctx.reply(`🔑 Premium Key kharidne ke liye @mrkaran078 ko message kar.\n\nTera User ID: <code>${ctx.from.id}</code>\nYe ID copy-paste kar ke bhej dena.`, { parse_mode: 'HTML' });
});

bot.hears('❓ HELP', ctx => {
  ctx.reply('7 free lookups allowed.\nAfter that buy premium key.\nOnly username lookup available.');
});

bot.on('text', async ctx => {
  const text = ctx.message.text.trim();
  const user = getUser(ctx.from.id);

  if (['🔍 LOOKUP USERNAME','🔑 BUY PREMIUM KEY','❓ HELP'].includes(text)) return;

  if (!checkLimit(ctx, user)) return;

  if (!/^[A-Za-z0-9_]{4,}$/.test(text)) {
    ctx.reply('Invalid format. Button se LOOKUP USERNAME daba ke username bhej.', mainKeyboard);
    return;
  }

  try {
    const res = await fetch(`https://cyber-testing-api.vercel.app/tguser?key=\( {API_KEY}&username= \){text}`);
    const data = await res.text();
    await ctx.reply(`🩸 RESULT:\n\n${data}`);
  } catch(e) {
    await ctx.reply('API ERROR');
  }

  user.usage++;
});

bot.command('givekey', ctx => {
  if (ctx.from.id !== ADMIN_ID) return;
  const args = ctx.message.text.split(' ');
  if (args[1]) {
    getUser(parseInt(args[1])).premium = true;
    ctx.reply(`✅ Premium activated for ${args[1]}`);
  }
});

bot.command('admin', ctx => {
  if (ctx.from.id !== ADMIN_ID) return;
  let msg = '🩸 ADMIN PANEL\n\n';
  for (let [id, u] of users) {
    msg += `ID: ${id} | Uses: ${u.usage} | Premium: ${u.premium ? '✅' : '❌'}\n`;
  }
  ctx.reply(msg || 'No users yet');
});

const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'your-url.onrender.com'}/webhook`;
bot.telegram.setWebhook(webhookUrl, {drop_pending_updates: true});

app.listen(PORT, '0.0.0.0', () => console.log('🩸 Bot Live'));

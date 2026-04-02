const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const fetch = require('node-fetch');

const BOT_TOKEN = '8624025132:AAEcNyPgKEPW8ChF7PRrvM2VBD8LXvISxlk';   // ←←← yahan real token paste kar
const ADMIN_ID = 8217006573;                      // ←←← tera telegram user id
const API_KEY = 'CYBER_TEST';

const bot = new Telegraf(BOT_TOKEN);
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());

// Health check
app.get('/', (req, res) => res.send('Bot running ✅'));

// Webhook route
app.post('/webhook', (req, res) => {
  bot.handleUpdate(req.body)
    .then(() => res.sendStatus(200))
    .catch(() => res.sendStatus(500));
});

const appServer = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Bot live on port ${PORT}`);
});

// Database (in-memory)
const users = new Map(); // userId => {usage:0, credits:0, key:null}

function getUser(id) {
  if (!users.has(id)) users.set(id, {usage:0, credits:0, key:null});
  return users.get(id);
}

function checkLimit(ctx, user) {
  if (user.key || user.credits > 0) {
    if (user.credits > 0) user.credits--;
    return true;
  }
  if (user.usage >= 7) {
    ctx.reply('Free 7 uses khatam.\nRefer kar ya @mrkaran078 se key le.');
    return false;
  }
  return true;
}

// Main keyboard
const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🔍 Lookup ID/Username', 'lookup')],
  [Markup.button.callback('🚘 Vehicle Info', 'vehicle')],
  [Markup.button.callback('🪪 Aadhar Family', 'aadhar')],
  [Markup.button.callback('📱 Number Info', 'number')],
  [Markup.button.callback('🔑 Buy Premium Key', 'buykey')],
  [Markup.button.callback('👥 Refer & Earn', 'refer')],
  [Markup.button.callback('❓ Help', 'help')]
]);

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  getUser(userId);
  await ctx.reply('Welcome bhai 🔥\nFree 7 uses. Refer ya key le unlimited ke liye.', mainKeyboard);
});

bot.action('lookup', async (ctx) => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(ctx, user)) return;
  await ctx.reply('Username (without @) ya User ID bhej:');
});

bot.action('vehicle', async (ctx) => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(ctx, user)) return;
  await ctx.reply('Vehicle number bhej (MH14KK9159):');
});

bot.action('aadhar', async (ctx) => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(ctx, user)) return;
  await ctx.reply('Aadhar number bhej (12 digits):');
});

bot.action('number', async (ctx) => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(ctx, user)) return;
  await ctx.reply('10 digit number bhej:');
});

bot.action('buykey', async (ctx) => {
  await ctx.reply(`Premium key ke liye @mrkaran078 ko message kar.\nTera User ID: ${ctx.from.id}\nYe ID unko bhej.`);
});

bot.action('refer', async (ctx) => {
  const uid = ctx.from.id;
  let u = getUser(uid);
  if (!u.key) u.key = `REF${uid}`;
  await ctx.reply(`Refer link:\nhttps://t.me/\( {ctx.botInfo.username}?start= \){u.key}\n\n1 Refer = 1 Credit`);
});

bot.action('help', async (ctx) => {
  await ctx.reply('Free: 7 baar\nRefer = extra 7\nKey = unlimited\nButton daba aur data bhej.');
});

// Text handler (API calls)
bot.on('text', async (ctx) => {
  const text = ctx.message.text.trim();
  const userId = ctx.from.id;
  const user = getUser(userId);

  if (!checkLimit(ctx, user)) return;

  let url = '';

  if (/^[A-Za-z0-9_]{4,}$/.test(text)) { // username
    url = `https://cyber-testing-api.vercel.app/tguser?key=\( {API_KEY}&username= \){text}`;
  } else if (/^[A-Z]{2}\d{2}[A-Z0-9]{4,}$/.test(text)) { // vehicle
    url = `https://cyber-testing-api.vercel.app/rc2?key=\( {API_KEY}&vehicle= \){text}`;
  } else if (/^\d{12}$/.test(text)) { // aadhar
    url = `https://cyber-testing-api.vercel.app/aadhar-family?key=\( {API_KEY}&term= \){text}`;
  } else if (/^\d{10}$/.test(text)) { // number
    url = `https://cyber-testing-api.vercel.app/num2info?key=\( {API_KEY}&number= \){text}`;
  } else {
    await ctx.reply('Button se choose kar ke sahi data bhej.');
    return;
  }

  try {
    const res = await fetch(url);
    const data = await res.text();
    await ctx.reply(data || 'No data');
  } catch (e) {
    await ctx.reply('API error');
  }

  user.usage++;
});

// Admin panel
bot.command('admin', (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return;
  let msg = 'Admin Panel:\n';
  for (let [id, u] of users) {
    msg += `ID:\( {id} | Uses: \){u.usage} | Credits:\( {u.credits} | Key: \){u.key||'no'}\n`;
  }
  ctx.reply(msg || 'Koi user nahi');
});

// Webhook set
const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'your-render-url.onrender.com'}/webhook`;
bot.telegram.setWebhook(webhookUrl, { drop_pending_updates: true })
  .then(() => console.log('Webhook set ✅'))
  .catch(err => console.log('Webhook fail:', err));

module.exports = app;  // Render ke liye

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
app.get('/', (req, res) => res.send('Bot running ✅'));
app.post('/webhook', (req, res) => bot.handleUpdate(req.body).then(() => res.sendStatus(200)).catch(() => res.sendStatus(500)));

const users = new Map();

function getUser(id) {
  if (!users.has(id)) users.set(id, {usage:0, credits:0, premiumKey:null});
  return users.get(id);
}

function checkLimit(ctx, user) {
  if (user.premiumKey || user.credits > 0) {
    if (user.credits > 0) user.credits--;
    return true;
  }
  if (user.usage >= 7) {
    ctx.reply('Free 7 uses khatam.\nRefer kar ya Buy Key le.');
    return false;
  }
  return true;
}

// Niche wala Reply Keyboard
const mainKeyboard = Markup.keyboard([
  ['🔍 Lookup ID', '📱 Number Info'],
  ['🚘 Vehicle Info', '🪪 Aadhar Family'],
  ['🔑 Buy Premium Key', '👥 Refer & Earn'],
  ['❓ Help']
]).resize(true).persistent(true);

bot.start(ctx => {
  getUser(ctx.from.id);
  ctx.reply(`Welcome bhai 🔥\nFree 7 uses.\n\n𝑺𝒌 ꭗ 𓆩𝐌.𝐒.𝐃𓆪 & ☠︎𝙑𝙞𝙧𝙖𝙩𓆪 𓆩𖤍𓆪`, mainKeyboard);
});

bot.hears('🔍 Lookup ID', ctx => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(ctx, user)) return;
  ctx.reply('Username (without @) ya User ID bhej:');
});

bot.hears('📱 Number Info', ctx => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(ctx, user)) return;
  ctx.reply('10 digit number bhej:');
});

bot.hears('🚘 Vehicle Info', ctx => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(ctx, user)) return;
  ctx.reply('Vehicle number bhej:');
});

bot.hears('🪪 Aadhar Family', ctx => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(ctx, user)) return;
  ctx.reply('Aadhar 12 digit bhej:');
});

bot.hears('🔑 Buy Premium Key', ctx => {
  ctx.reply(`Premium Key ke liye @mrkaran078 ko message kar.\nTera User ID: ${ctx.from.id}`);
});

bot.hears('👥 Refer & Earn', async ctx => {
  let u = getUser(ctx.from.id);
  if (!u.premiumKey) u.premiumKey = `PREM\( {ctx.from.id}X \){Date.now().toString().slice(-4)}`;
  await ctx.reply(`Refer link:\nhttps://t.me/\( {ctx.botInfo.username}?start= \){u.premiumKey}\n1 Refer = 1 Credit`);
});

bot.hears('❓ Help', ctx => {
  ctx.reply('Free 7 uses\nRefer = +1 credit\nBuy Key = unlimited\nButton daba ke data bhej.');
});

// Text handler for data
bot.on('text', async ctx => {
  const text = ctx.message.text.trim();
  const user = getUser(ctx.from.id);

  // Agar keyboard button nahi hai to data samajh
  if (['🔍 Lookup ID','📱 Number Info','🚘 Vehicle Info','🪪 Aadhar Family','🔑 Buy Premium Key','👥 Refer & Earn','❓ Help'].includes(text)) return;

  if (!checkLimit(ctx, user)) return;

  let url = '';
  if (/^[A-Za-z0-9_]{4,}\( /.test(text)) url = `https://cyber-testing-api.vercel.app/tguser?key= \){API_KEY}&username=${text}`;
  else if (/^[A-Z]{2}\d{2}[A-Z0-9]{4,}\( /.test(text)) url = `https://cyber-testing-api.vercel.app/rc2?key= \){API_KEY}&vehicle=${text}`;
  else if (/^\d{12}\( /.test(text)) url = `https://cyber-testing-api.vercel.app/aadhar-family?key= \){API_KEY}&term=${text}`;
  else if (/^\d{10}\( /.test(text)) url = `https://cyber-testing-api.vercel.app/num2info?key= \){API_KEY}&number=${text}`;
  else {
    ctx.reply('Button se choose kar aur sahi data bhej.', mainKeyboard);
    return;
  }

  try {
    const res = await fetch(url);
    const data = await res.text();
    await ctx.reply(data);
  } catch(e) {
    await ctx.reply('API fail');
  }
  user.usage++;
});

bot.command('givekey', ctx => {
  if (ctx.from.id !== ADMIN_ID) return;
  const args = ctx.message.text.split(' ');
  if (args[1] && args[2]) {
    getUser(parseInt(args[1])).premiumKey = args[2];
    ctx.reply(`Key ${args[2]} activated for ${args[1]}`);
  }
});

bot.command('admin', ctx => {
  if (ctx.from.id !== ADMIN_ID) return;
  let msg = 'Users:\n';
  for (let [id, u] of users) msg += `ID:\( {id} | Uses: \){u.usage} | Credits:\( {u.credits} | Key: \){u.premiumKey||'no'}\n`;
  ctx.reply(msg);
});

const webhookUrl = `https://${process.env.RENDER_EXTERNAL_HOSTNAME || 'your-url.onrender.com'}/webhook`;
bot.telegram.setWebhook(webhookUrl, {drop_pending_updates: true});

app.listen(PORT, '0.0.0.0', () => console.log(`Live on ${PORT}`));

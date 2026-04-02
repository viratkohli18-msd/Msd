// bot.js
const { Telegraf, Markup } = require('telegraf');
const fetch = require('node-fetch'); // npm i node-fetch

const BOT_TOKEN = '8624025132:AAGrav1OrpiWc88dJRj1QgHmTM5CZWgKcNU'; // yahan daal
const ADMIN_ID = 8217006573; // tera user id (admin)
const API_KEY = 'CYBER_TEST';

const bot = new Telegraf(BOT_TOKEN);

// Database (simple JSON file - Render pe /tmp ya GitHub + lowdb bhi chalega, abhi simple Map)
let users = new Map(); // userId -> { usage: 0, credits: 0, referredBy: null, key: null }

function getUser(userId) {
  if (!users.has(userId)) {
    users.set(userId, { usage: 0, credits: 0, referredBy: null, key: null });
  }
  return users.get(userId);
}

const mainKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback('🔍 Lookup ID/Username', 'lookup')],
  [Markup.button.callback('🚘 Vehicle Info', 'vehicle')],
  [Markup.button.callback('🪪 Aadhar Family Info', 'aadhar')],
  [Markup.button.callback('📱 Number Info', 'number')],
  [Markup.button.callback('🔑 Buy Premium Key', 'buykey')],
  [Markup.button.callback('👥 Refer & Earn (1 Credit)', 'refer')],
  [Markup.button.callback('❓ Help', 'help')]
]);

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);
  const refCode = ctx.message.text.split(' ')[1];
  if (refCode && refCode !== String(userId)) {
    // referral logic
    const referrer = [...users.entries()].find(([id, u]) => u.key === refCode);
    if (referrer) {
      const refUser = getUser(referrer[0]);
      refUser.credits += 1;
      user.referredBy = referrer[0];
    }
  }

  await ctx.reply(`Welcome bhai 🔥\nFree me 7 baar use kar sakta hai.\nRefer kar ya key le for unlimited.`, mainKeyboard);
});

bot.action('lookup', async (ctx) => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(user, ctx)) return;
  await ctx.reply('Username bhej (without @) ya User ID bhej:');
  // next step handler daal sakte ho, abhi simple assume next message handle kar
});

bot.action('vehicle', async (ctx) => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(user, ctx)) return;
  await ctx.reply('Vehicle number bhej (MH14KK9159 jaise):');
});

bot.action('aadhar', async (ctx) => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(user, ctx)) return;
  await ctx.reply('Aadhar number bhej:');
});

bot.action('number', async (ctx) => {
  const user = getUser(ctx.from.id);
  if (!checkLimit(user, ctx)) return;
  await ctx.reply('Indian number bhej (9876543210):');
});

bot.action('buykey', async (ctx) => {
  await ctx.reply(`Premium Key kharidne ke liye @mrkaran078 ko message kar.\n\nTera User ID: ${ctx.from.id}\nYe ID unko bhej dena.`);
});

bot.action('refer', async (ctx) => {
  const userId = ctx.from.id;
  let user = getUser(userId);
  if (!user.key) user.key = `REF${userId}`; // unique key
  await ctx.reply(`Tera Refer Link:\nhttps://t.me/\( {ctx.botInfo.username}?start= \){user.key}\n\n1 Refer = 1 Credit\nCredit se extra 7 uses milenge.`);
});

bot.action('help', async (ctx) => {
  await ctx.reply('Free: 7 uses\nRefer kar ya key le for unlimited.\nHar button pe click karke data daal.');
});

// Message handler for inputs
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const user = getUser(userId);
  const text = ctx.message.text.trim();

  if (text.startsWith('/')) return;

  if (!checkLimit(user, ctx)) return;

  // simple logic - last action track karne ke liye advanced bana sakte ho, abhi basic
  if (/^[A-Za-z0-9_]{3,}$/.test(text) && text.length < 20) { // username jaise
    const res = await fetch(`https://cyber-testing-api.vercel.app/tguser?key=\( {API_KEY}&username= \){text}`);
    const data = await res.text();
    await ctx.reply(`TG User Info:\n${data}`);
  } 
  else if (/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(text)) { // vehicle
    const res = await fetch(`https://cyber-testing-api.vercel.app/rc2?key=\( {API_KEY}&vehicle= \){text}`);
    const data = await res.text();
    await ctx.reply(`Vehicle Info:\n${data}`);
  } 
  else if (/^\d{12}$/.test(text)) { // aadhar
    const res = await fetch(`https://cyber-testing-api.vercel.app/aadhar-family?key=\( {API_KEY}&term= \){text}`);
    const data = await res.text();
    await ctx.reply(`Aadhar Family Info:\n${data}`);
  } 
  else if (/^\d{10}$/.test(text)) { // number
    const res = await fetch(`https://cyber-testing-api.vercel.app/num2info?key=\( {API_KEY}&number= \){text}`);
    const data = await res.text();
    await ctx.reply(`Number Info:\n${data}`);
  } 
  else {
    await ctx.reply('Samajh nahi aaya. Button se choose kar aur data bhej.');
  }

  user.usage += 1;
});

// Limit check
function checkLimit(user, ctx) {
  if (user.key || user.credits > 0) {
    if (user.credits > 0) user.credits -= 1;
    return true;
  }
  if (user.usage >= 7) {
    ctx.reply('Free limit khatam.\nRefer kar (1 credit) ya @mrkaran078 se key le.');
    return false;
  }
  return true;
}

// Admin panel command
bot.command('admin', async (ctx) => {
  if (ctx.from.id !== ADMIN_ID) return ctx.reply('Admin only');
  let stats = 'Admin Panel:\n\n';
  for (let [id, u] of users) {
    stats += `ID: ${id} | Uses: ${u.usage} | Credits: ${u.credits} | Key: ${u.key || 'No'}\n`;
  }
  await ctx.reply(stats || 'Koi user nahi');
});

bot.launch();
console.log('Bot chal raha hai...');

// Render ke liye webhook (port)
const port = process.env.PORT || 3000;
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Bot running'));
app.listen(port, () => console.log(`Port ${port} pe live`));

// webhook setup kar lena Render pe (Telegraf docs se)

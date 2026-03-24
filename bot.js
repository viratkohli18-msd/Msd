const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

// --- Configuration ---
const TOKEN = '8624025132:AAGrav1OrpiWc88dJRj1QgHmTM5CZWgKcNU';
const const API = {
  KEY: "my_dayne",
  BASE: "https://username-to-number.vercel.app/",
  AADHAAR: "https://number8899.vercel.app/"
};
const app = express();
const bot = new TelegramBot(TOKEN, { polling: true });

// Keep-alive server for Render
app.get('/', (req, res) => res.send('Bot is running! 🤖'));
app.listen(process.env.PORT || 3000);

// --- Robust Data Parser ---
function extractData(data) {
    // 1. Try Username/ID Path
    const fromId = data?.phone_info_from_id;
    if (fromId?.success) {
        return {
            number: fromId.number,
            country: fromId.country || 'Unknown',
            source: 'ID Lookup'
        };
    }

    // 2. Try Number-to-Info Path
    const details = data?.phone_details?.result?.results?.[0];
    if (details) {
        return {
            number: details.mobile,
            name: details.name,
            fname: details.fname,
            address: details.address,
            circle: details.circle,
            source: 'Database'
        };
    }

    // 3. Fallback: Regex Scan for 10-13 digit numbers
    const rawString = JSON.stringify(data);
    const phoneMatch = rawString.match(/\d{10,13}/);
    if (phoneMatch) {
        return { number: phoneMatch[0], status: 'Extracted via Scan' };
    }

    return null;
}

// --- UI Formatter ---
function formatResponse(info) {
    if (!info) return "❌ No data found for this query.";
    
    let message = "╔══════════════════╗\n";
    message += "║   📱 DATA FOUND    \n";
    message += "╠══════════════════╝\n";
    
    Object.entries(info).forEach(([key, val]) => {
        message += `➤ ${key.toUpperCase()}: ${val}\n`;
    });
    
    message += "╚══════════════════╝";
    return `<code>${message}</code>`;
}

// --- Bot Commands ---
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome! Use /user, /id, or /num to lookup info.");
});

bot.onText(/\/(user|id|num) (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const query = match[2];

    try {
        const response = await axios.get(`${API_BASE_URL}/search?q=${query}`, { timeout: 5000 });
        const result = extractData(response.data);
        bot.sendMessage(chatId, formatResponse(result), { parse_mode: 'HTML' });
    } catch (error) {
        bot.sendMessage(chatId, "⚠️ API Error or Timeout. Please try again later.");
    }
});

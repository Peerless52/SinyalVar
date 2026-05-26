const axios = require("axios");
const ti = require("technicalindicators");

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const symbols = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT"
];

async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: TELEGRAM_CHAT_ID,
    text: message
  });
}

async function getCandles(symbol) {
  const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=15m&limit=50`;

  const response = await axios.get(url);

  return response.data.map(candle => parseFloat(candle[4]));
}

async function checkSignals() {
  for (const symbol of symbols) {
    try {
      const closes = await getCandles(symbol);

      const ema8 = ti.EMA.calculate({
        period: 8,
        values: closes
      });

      const ema21 = ti.EMA.calculate({
        period: 21,
        values: closes
      });

      const lastEMA8 = ema8[ema8.length - 1];
      const prevEMA8 = ema8[ema8.length - 2];

      const lastEMA21 = ema21[ema21.length - 1];
      const prevEMA21 = ema21[ema21.length - 2];

      if (prevEMA8 < prevEMA21 && lastEMA8 > lastEMA21) {
        await sendTelegramMessage(
          `🚀 AL Sinyali: ${
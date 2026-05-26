import axios from "axios";
import { EMA } from "technicalindicators";

const BOT_TOKEN = "8864946380:AAH-T9JYLNYNXBlAXXMU-jL3EIOw2FiG9xQ";
const CHAT_ID = "1544983039";

const symbols = [
  "BTCUSDT",
  "ETHUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "PEPEUSDT"
];

async function sendTelegramMessage(message) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await axios.post(url, {
    chat_id: CHAT_ID,
    text: message
  });
}

async function checkSignals() {
  for (const symbol of symbols) {
    try {
      const response = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=15m&limit=50`
      );

      const closes = response.data.map(candle => parseFloat(candle[4]));

      const ema8 = EMA.calculate({
        period: 8,
        values: closes
      });

      const ema21 = EMA.calculate({
        period: 21,
        values: closes
      });

      const lastEMA8 = ema8[ema8.length - 1];
      const prevEMA8 = ema8[ema8.length - 2];

      const lastEMA21 = ema21[ema21.length - 1];
      const prevEMA21 = ema21[ema21.length - 2];

      if (prevEMA8 < prevEMA21 && lastEMA8 > lastEMA21) {
        await sendTelegramMessage(
          `🚀 AL Sinyali: ${symbol}\nEMA 8, EMA 21 üzerine çıktı`
        );
      }

      if (prevEMA8 > prevEMA21 && lastEMA8 < lastEMA21) {
        await sendTelegramMessage(
          `📉 SAT Sinyali: ${symbol}\nEMA 8, EMA 21 altına düştü`
        );
      }

      console.log(`${symbol} kontrol edildi`);
    } catch (error) {
      console.log(`Hata: ${symbol}`);
    }
  }
}

checkSignals();

setInterval(checkSignals, 1000 * 60 * 5);
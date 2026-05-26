import express from "express";
import axios from "axios";
import { EMA } from "technicalindicators";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("SinyalVar çalışıyor");
});

app.listen(PORT, () => {
  console.log(`SinyalVar ${PORT} portunda çalışıyor`);
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const symbols = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT"];

async function sendTelegramMessage(message) {
  await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: message
  });
}

async function checkSignals() {
  console.log("Sinyaller kontrol ediliyor...");

  for (const symbol of symbols) {
    try {
      const response = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=15m&limit=100`
      );

      const closes = response.data.map(candle => parseFloat(candle[4]));

      const ema8 = EMA.calculate({ period: 8, values: closes });
      const ema21 = EMA.calculate({ period: 21, values: closes });

      const lastEMA8 = ema8[ema8.length - 1];
      const prevEMA8 = ema8[ema8.length - 2];
      const lastEMA21 = ema21[ema21.length - 1];
      const prevEMA21 = ema21[ema21.length - 2];

      if (prevEMA8 < prevEMA21 && lastEMA8 > lastEMA21) {
        await sendTelegramMessage(`🚀 AL Sinyali: ${symbol}`);
      }

      if (prevEMA8 > prevEMA21 && lastEMA8 < lastEMA21) {
        await sendTelegramMessage(`📉 SAT Sinyali: ${symbol}`);
      }

      console.log(`${symbol} kontrol edildi`);
    } catch (error) {
      console.log(`Hata: ${symbol} - ${error.message}`);
    }
  }
}

checkSignals();
setInterval(checkSignals, 1000 * 60 * 5);
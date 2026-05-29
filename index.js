import express from "express";
import axios from "axios";
import { EMA } from "technicalindicators";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("SinyalVar çalışıyor");
});

app.listen(PORT, () => {
  console.log(`SinyalVar çalışıyor: ${PORT}`);
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

const symbols = [
  "BTCUSDT",
  "ETHUSDT",
  "BNBUSDT",
  "SOLUSDT",
  "XRPUSDT",
  "DOGEUSDT",
  "PEPEUSDT",
  "SHIBUSDT",
  "FLOKIUSDT",
  "BONKUSDT",
  "WIFUSDT",
  "ORDIUSDT",
  "SUIUSDT",
  "SEIUSDT",
  "APTUSDT",
  "ARBUSDT",
  "OPUSDT",
  "TIAUSDT",
  "INJUSDT",
  "RNDRUSDT",
  "FETUSDT",
  "NEARUSDT",
  "AVAXUSDT",
  "LINKUSDT",
  "MATICUSDT",
  "ADAUSDT",
  "DOTUSDT",
  "LTCUSDT"
];

async function sendTelegramMessage(message) {
  await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    chat_id: CHAT_ID,
    text: message
  });
}

async function checkSignals() {
  console.log("Kontrol başladı");

  for (const symbol of symbols) {
    try {
      const response = await axios.get(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=15m&limit=100`
      );

      const closes = response.data.map(c => parseFloat(c[4]));

      const ema8 = EMA.calculate({ period: 8, values: closes });
      const ema21 = EMA.calculate({ period: 21, values: closes });

      const prevEMA8 = ema8[ema8.length - 2];
      const lastEMA8 = ema8[ema8.length - 1];
      const prevEMA21 = ema21[ema21.length - 2];
      const lastEMA21 = ema21[ema21.length - 1];

      if (prevEMA8 < prevEMA21 && lastEMA8 > lastEMA21) {
        await sendTelegramMessage(`🚀 AL Sinyali: ${symbol}\nEMA 8, EMA 21 üzerine çıktı.`);
      }

      if (prevEMA8 > prevEMA21 && lastEMA8 < lastEMA21) {
        await sendTelegramMessage(`📉 SAT Sinyali: ${symbol}\nEMA 8, EMA 21 altına indi.`);
      }

      console.log(`${symbol} kontrol edildi`);
      await new Promise(resolve => setTimeout(resolve, 300));

    } catch (error) {
      console.log(`${symbol} hata: ${error.message}`);
    }
  }
}

sendTelegramMessage("✅ SinyalVar aktif. Agresif coin taraması başladı.");
checkSignals();
setInterval(checkSignals, 300000);

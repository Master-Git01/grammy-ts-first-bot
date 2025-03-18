import express from "express";
import { Bot } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Создаем бота с помощью grammY
const bot = new Bot(process.env.BOT_TOKEN || "");
// Задаем chat_id, куда бот будет отправлять сообщение (можно задать в .env)
const chatId = process.env.CHAT_ID || "";

// Опционально запускаем бота (например, polling)
bot.start();

// Эндпоинт для приема данных из Mini App
app.post("/receive", async (req: any, res: any) => {
  const { userName, result } = req.body;
  if (!userName || !result) {
    return res.status(400).json({ error: "Недостаточно данных" });
  }

  try {
    // Отправляем сообщение в Telegram через bot.api.sendMessage
    await bot.api.sendMessage(
      chatId,
      `Пользователь: ${userName} получил число: ${result}`
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Ошибка отправки сообщения:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend-сервер запущен на порту ${PORT}`);
});

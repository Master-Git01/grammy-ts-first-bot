import express from "express";
import { Bot, GrammyError, HttpError } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

// Создаем бота с помощью grammY
const bot = new Bot(process.env.BOT_TOKEN || "");
// Задаем chat_id, куда бот будет отправлять сообщение (можно задать в .env)
const chatId = process.env.CHAT_ID || "";

// Обрабатываем команду /start
bot.command("start", (ctx) =>
  ctx.reply("Привет! Отправь мне данные через Mini App.")
);

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error:", e);
  }
});

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

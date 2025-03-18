import express from "express";
import { Bot, GrammyError, HttpError } from "grammy";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const bot = new Bot(process.env.BOT_TOKEN || "");

// Обработчик команды /start
bot.command("start", (ctx) =>
  ctx.reply("Привет! Отправь мне данные через Mini App.")
);

// Обработчик для данных, полученных через web_app_data
bot.on("message:web_app_data", async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    await ctx.reply(`Получены данные: ${JSON.stringify(data)}`);
  } catch (error) {
    await ctx.reply("Ошибка при обработке данных из Mini App.");
  }
});

// Глобальная обработка ошибок
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`);
  const e = err.error;
  if (e instanceof GrammyError) {
    console.error("Ошибка в запросе:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Не удалось связаться с Telegram:", e);
  } else {
    console.error("Неизвестная ошибка:", e);
  }
});

// Определите публичный URL вашего сервера, который доступен из интернета (например, из переменной окружения)
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Пример: https://your-app-domain.com

// Зарегистрируйте webhook в Telegram
bot.api.setWebhook(`${WEBHOOK_URL}/webhook`).catch(console.error);

// Создайте endpoint для webhook
app.post("/webhook", (req, res: any) => {
  // Передаем обновление в bot.handleUpdate. Если нужно, можно передать res для отправки ответа сразу.
  bot.handleUpdate(req.body, res);
});

// Также можно оставить HTTP endpoint для получения данных напрямую (если нужно)
app.post("/receive", async (req: any, res: any) => {
  const { userName, result } = req.body;
  if (!userName || !result) {
    return res.status(400).json({ error: "Недостаточно данных" });
  }
  try {
    await bot.api.sendMessage(
      process.env.CHAT_ID || "",
      `Пользователь: ${userName} получил число: ${result}`
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Ошибка отправки сообщения:", error);
    res.status(500).json({ error: "Внутренняя ошибка сервера" });
  }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});

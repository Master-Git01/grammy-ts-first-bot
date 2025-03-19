import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { Bot, Context, GrammyError, HttpError, Keyboard } from "grammy";

// Глобальная переменная для хранения последнего username,
// полученного из данных Mini App.
let latestUsername = "";

// Инициализируем бота
const bot = new Bot(process.env.BOT_TOKEN || "");

// Обрабатываем команду /start с inline-кнопкой для открытия Mini App
bot.command("start", async (ctx: Context) => {
  const keyboard = new Keyboard().webApp(
    "Открыть Mini App наконец-то! Как надо! Да!",
    process.env.WEBAPP_URL || ""
  );

  await ctx.reply("Откройте Mini App и отправьте данные:", {
    reply_markup: keyboard,
  });
});

// Обрабатываем данные, полученные из Mini App
bot.on("message:web_app_data", async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    // Сохраняем username, полученный из данных мини-приложения
    latestUsername = data.userName || "";
    await ctx.reply(`Пользователь: ${data.userName}, Число: ${data.result}`);
  } catch (error) {
    await ctx.reply("Ошибка при обработке данных из Mini App.");
  }
});

// Обработка ошибок бота
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

// Создаем express-сервер для реализации endpoint
const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint для получения username
app.get("/getUsername", (req, res) => {
  // Возвращаем JSON с последним username
  res.json({ username: latestUsername });
});

// Запускаем express-сервер
app.listen(PORT, () => {
  console.log(`Express-сервер запущен на порту ${PORT}`);
});

// Запускаем бота
bot.start();

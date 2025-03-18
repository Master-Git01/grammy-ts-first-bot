import dotenv from "dotenv";
dotenv.config();

import { Bot, GrammyError, HttpError } from "grammy";

const bot = new Bot(process.env.BOT_TOKEN || "");

// Обрабатываем команду /start
bot.command("start", (ctx) =>
  ctx.reply("Привет! Отправь мне данные через Mini App.")
);

// Обрабатываем данные, полученные из Mini App
bot.on("message:web_app_data", async (ctx) => {
  try {
    const data = JSON.parse(ctx.message.web_app_data.data);
    await ctx.reply(`Пользователь: ${data.userName}, Число: ${data.result}`);
  } catch (error) {
    await ctx.reply("Ошибка при обработке данных из Mini App.");
  }
});

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

// Запускаем бота
bot.start();

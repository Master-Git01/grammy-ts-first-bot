"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const grammy_1 = require("grammy");
const bot = new grammy_1.Bot(process.env.BOT_TOKEN || "");
// Обрабатываем команду /start
bot.command("start", async (ctx) => {
    await ctx.reply(`Привет, это Test App 👋
🚀 Получите самое крутое число в мире! Только у нас!`, {
        reply_markup: new grammy_1.Keyboard()
            .webApp("Открыть Test App", process.env.WEBAPP_URL || "") // Кнопка Mini App
            .resized(), // Автоматическое изменение размера клавиатуры
    });
});
// Обрабатываем данные, полученные из Mini App
bot.on("message:web_app_data", async (ctx) => {
    try {
        const data = JSON.parse(ctx.message.web_app_data.data);
        await ctx.reply(`Пользователь: ${data.userName},
Ваше число: ${data.result}`);
    }
    catch (error) {
        await ctx.reply("Ошибка при обработке данных из Mini App.");
    }
});
bot.catch((err) => {
    const ctx = err.ctx;
    console.error(`Error while handling update ${ctx.update.update_id}:`);
    const e = err.error;
    if (e instanceof grammy_1.GrammyError) {
        console.error("Error in request:", e.description);
    }
    else if (e instanceof grammy_1.HttpError) {
        console.error("Could not contact Telegram:", e);
    }
    else {
        console.error("Unknown error:", e);
    }
});
// Запускаем бота
bot.start();

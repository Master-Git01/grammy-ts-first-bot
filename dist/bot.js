"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const grammy_1 = require("grammy");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Создаем бота с помощью grammY
const bot = new grammy_1.Bot(process.env.BOT_TOKEN || "");
// Задаем chat_id, куда бот будет отправлять сообщение (можно задать в .env)
const chatId = process.env.CHAT_ID || "";
// Обрабатываем команду /start
bot.command("start", (ctx) => ctx.reply("Привет! Отправь мне данные через Mini App."));
bot.on("message:web_app_data", async (ctx) => {
    try {
        const data = JSON.parse(ctx.message.web_app_data.data);
        await ctx.reply(`Получены данные: ${JSON.stringify(data)}`);
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
// Опционально запускаем бота (например, polling)
bot.start();
// Эндпоинт для приема данных из Mini App
app.post("/receive", async (req, res) => {
    const { userName, result } = req.body;
    if (!userName || !result) {
        return res.status(400).json({ error: "Недостаточно данных" });
    }
    try {
        // Отправляем сообщение в Telegram через bot.api.sendMessage
        await bot.api.sendMessage(chatId, `Пользователь: ${userName} получил число: ${result}`);
        res.json({ success: true });
    }
    catch (error) {
        console.error("Ошибка отправки сообщения:", error);
        res.status(500).json({ error: "Внутренняя ошибка сервера" });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend-сервер запущен на порту ${PORT}`);
});

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

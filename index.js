const TelegramBot = require("node-telegram-bot-api")
const { token, options } = require("./config")
const Controllers = require("./modules/controllers")

const bot = new TelegramBot(token, options)

bot.on("text", (message) => Controllers.TextMessage(message, bot))
bot.on("contact", (message) => Controllers.ContactMessage(message, bot))

Controllers.BotSendMessage(bot)
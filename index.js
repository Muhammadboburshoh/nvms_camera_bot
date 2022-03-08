const express = require("express")
const app = express()

const TelegramBot = require("node-telegram-bot-api")
const { token, options, express_port } = require("./config")
const Controllers = require("./modules/controllers")

const bot = new TelegramBot(token, options)

bot.on("text", (message) => Controllers.TextMessage(message, bot))
bot.on("contact", (message) => Controllers.ContactMessage(message, bot))

Controllers.BotSendMessage(bot)

app.listen(express_port, ()=> {console.log(`Started ${express_port}`)})
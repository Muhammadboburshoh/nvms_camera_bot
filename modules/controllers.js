const model = require("./model")

module.exports = {
    TextMessage: async (message, bot) => {
        const chat_id = message.chat.id
        const user_id = message.from.id
        const text = message.text

        const step = await model.parentStep(user_id)
        const findParent = await model.findParent(user_id)

        if(!findParent) {
            bot.sendMessage(
                chat_id,
                `Asslamu alaykum ${message.chat.first_name} botimizga xush kelibsiz!\nBotga telefon raqamingizni yuboring!`,
                {
                    reply_markup: {
                        keyboard: [
                            [
                                {
                                    text: "Telefon raqamni yuborish",
                                    request_contact: true
                                }
                            ]
                        ],
                        resize_keyboard: true,
                        one_time_keyboard: true
                    }
                }
            )
        } else if(text && step.step == 1) {
            try {
                const findPassword = await model.findPassword(text.trim())

                if(findPassword) {
                    const secondStep = await model.secondStep(user_id)
                    if(secondStep) {
                        bot.sendMessage(
                            chat_id,
                            `Botdan muvaffaqiyatli ro'yxatdan o'tdingiz!\n\nTez orada sizga farzandingiz maktabga kelgan, ketgan vaqtlarini yubora boshlaymiz.`
                        )
                    }
                }
                else {
                    bot.sendMessage(
                        chat_id,
                        `Password noto'g'ri, to'g'ri password kiriting:`
                    )
                }
            } catch(e) {
                bot.sendMessage(
                    chat_id,
                    `Xatolik yuz berdi! Botni qayta ishga tushuring.\n\n/start\n${e}`
                )
            }
        } else if(text === "/start" && step.step == 2) {
            bot.sendMessage(
                chat_id,
                `Siz botdan muvaffaqiyatli ro'yxatdan o'tgansiz.\nTez orada sizga farzandingiz maktabga kelgan, ketgan vaqtlarini yubora boshlaymiz.`
            )
        }
    },

    ContactMessage: async (message, bot) => {
        const chat_id = message.chat.id
        const user_id = message.from.id
        const phone = message.contact.phone_number.split('').filter(e => e != '+').join('')
        try {
            const is_insert = await model.insertTelegramId(user_id, phone)

            if (is_insert.find_tg_id == 1) {
                bot.sendMessage(
                    chat_id,
                    `Maktab mamuriyati tomonidan berilgan passwordni yuboring:`,
                    {
                        reply_markup: {
                            remove_keyboard: true
                        }
                    }
                )
            }
            else if(is_insert.find_tg_id == 2) {
                bot.sendMessage(
                    chat_id,
                    `Bu raqam ro'yxatdan o'tkazilmagan!`
                )
            }
        } catch(e) {
            bot.sendMessage(
                chat_id,
                `Xatolik yuz berdi! Botni qayta ishga tushuring.\n\n/start\n${e}`
            )
        }
    },


    //send attendanse
    BotSendMessage: (bot) => {
        const path = require("path")
        const excelToJson = require('convert-excel-to-json')
        const fs = require("fs")
        const util = require("util")
        const watch = require("node-watch")

        const scan = util.promisify(fs.readdir)
        const unlink = util.promisify(fs.unlink)

        const dirName = path.dirname(__dirname)
        const folderPath = path.join(dirName, "attendance_files")

        watch(folderPath, { recursive: true }, async (curr, prev) => {
            let fileNames = await scan(folderPath)

            fs.exists(folderPath + "/" + fileNames[0], async(isExist)=>{
                if(isExist) {
                    const result = excelToJson({sourceFile: folderPath + "/" + fileNames[0]})
                    if(result.Sheet1) {
                        if(result.Sheet1[0].A === "Time") {
                            if(result) {
                                const deletedFile = await unlink(folderPath + "/" + fileNames[0])
                            }

                            result.Sheet1 = result.Sheet1.slice(1)
                            let MAX = Date.parse(result.Sheet1[0].A)
                            result.Sheet1.forEach((e, i) => {
                                if(MAX < Date.parse(e.A)) {
                                    MAX = Date.parse(e.A)
                                }
                            });

                            const data = []
                            result.Sheet1.forEach(e => {
                                if(Date.parse(e.A) == MAX){
                                    data.push(e)
                                }
                            })

                            data.forEach(async (e) => {
                                const telegramId = await model.returnTelegramId(e.C)
                                const attedanceDay = e.A.split("-").reverse().join(".")
                                if(telegramId) {
                                    let attedanceStatus = ""
                                    if(e.E === "Normal") {
                                        attedanceStatus = "kechikib keldi."
                                    }
                                    else if(e.E === "Absent") {
                                        attedanceStatus = "kelmadi."
                                    }
                                    else {
                                        attedanceStatus = "keldi."
                                    }
                                    bot.sendMessage(
                                        telegramId.telegram_id,
                                        `Sizning ${e.B} farzandingiz ${e.D} ${attedanceDay} kuni maktabga ${attedanceStatus}`
                                    )
                                }
                            })
                        }
                        else {
                            const deletedFile = await unlink(folderPath + "/" + fileNames[0])
                        }
                    }
                    else {
                        const deletedFile = await unlink(folderPath + "/" + fileNames[0])
                    }
                }
            })
        });
    }
}
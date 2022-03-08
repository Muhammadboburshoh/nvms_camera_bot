const { row } = require("../util/db")

const findParentSQL = `
    select * from parents
        where telegram_id = $1;
`
const findParent = (telegram_id) => row(findParentSQL, telegram_id);

const insertTelegramIdSQL = `
    select find_tg_id($1, $2)
`
const insertTelegramId = (telegram_id, phone) => row(insertTelegramIdSQL, telegram_id, phone)


const parentStepSQL = `
    select
        step
    from parents
    where
        telegram_id = $1
`
const parentStep = (telegram_id) => row(parentStepSQL, telegram_id)

const findPasswordSQL = `
    select * from parents
    where
        password = $1
`
const findPassword = (password) => row(findPasswordSQL, password)

const secondStepSQL = `
    update parents
    set step = 2
    where
        telegram_id = $1
    returning *
`
const secondStep = (telegram_id) => row(secondStepSQL, telegram_id)

const returnTelegramIdSQL = `
    select
        telegram_id
    from parents
    where
        phone = $1 and telegram_id is not null;
`
const returnTelegramId = (phone) => row(returnTelegramIdSQL, phone)

module.exports.findParent = findParent
module.exports.insertTelegramId = insertTelegramId
module.exports.parentStep = parentStep
module.exports.findPassword = findPassword
module.exports.secondStep = secondStep
module.exports.returnTelegramId = returnTelegramId
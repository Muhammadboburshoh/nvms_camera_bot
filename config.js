require('dotenv').config()

const { env } = process

module.exports = {
    token: env.TOKEN,
    port: env.PORT,
    host: env.HOST,
    database: env.DATABASE,
    user: env.USER,
    password: env.PASSWORD,
    options: {
        polling: true
    }
}

import Bot from './struct/Client.js'
import { configDotenv } from 'dotenv'

configDotenv()

async function start() {
    const client = new Bot()
    console.log('NABS Bot Starting..')
    await client.login(process.env.TOKEN)
    await client.loadCommands()
    await client.loadEvents()
    await client.loadDatabase()
    await client.loadGuilds()
    console.log('NABS Bot Started')
}

start()

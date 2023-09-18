const { Client, Partials, IntentsBitField } = require("discord.js")

const { initChatActivityService } = require("./Services/chatActivityService")
const { initVoiceActivityService } = require("./Services/voiceActivityService")
const { getBannerImage } = require("./Services/drawBannerService")

const { botToken, guildId } = require("./config")
const { getCurrentBestUser } = require("./methods")

const Core = new Client({
    partials: [
        Partials.Message, Partials.Channel, Partials.User,
        Partials.GuildMember, Partials.Reaction
    ],
    intents: new IntentsBitField([
        `Guilds`, `GuildVoiceStates`, `GuildMembers`, `GuildMessages`, `MessageContent`
    ]),
    restRequestTimeout: 120000
})

Core.login(botToken).then(() => {
    console.log(`${Core.user.username} was succesfully started!`)
})

let CurrentBestUser = null
let UserStorage = new Map()
setInterval(async () => {
    try {
        const result = await getCurrentBestUser(Core, UserStorage)

        if (result) {
            CurrentBestUser = result
        }
    } catch (error) {
        console.log(error)
    }
}, 60_000)

const VoiceJoinedMap = new Map()
initVoiceActivityService(Core, VoiceJoinedMap, UserStorage)

const ChatCooldown = new Map()
initChatActivityService(Core, ChatCooldown, UserStorage)

setInterval(async () => {
    try {
        const guild = await Core.guilds.fetch(guildId)
        if (!guild) return


        const voiceChannels = guild.channels.cache.filter(ch => ch.isVoiceBased())
        let count = 0

        for (const [id, channel] of voiceChannels) {
            if (channel.members.size == 0) continue

            for (const [id, member] of channel.members) {
                if (member.user.bot) continue

                count += 1
            }
        }

        const image = await getBannerImage(count, CurrentBestUser)

        await guild.setBanner(image)

        const date = new Date(Date.now())

        console.log(`Banner was updated! ${date.getHours()}:${date.getMinutes()}`)
    } catch (error) {
        console.log(error)
    }
}, 120_000)

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection');
    console.log(reason, p)
})

process.on("uncaughtException", (err, origin) => {
    console.log('Uncaught Exception');
    console.log(err, origin)
})

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.log('Uncaught Monitor Exception');
    console.log(err, origin)
})
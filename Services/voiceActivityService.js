const { Client } = require("discord.js")
const { guildId } = require("../config")

/**
 * @param {Client} Core 
 * @param {Map<any, any>} VoiceJoinedMap 
 * @param {Map<any, any>} UserStorage 
 */
function initVoiceActivityService(Core, VoiceJoinedMap, UserStorage) {
    Core.on(`ready`, async () => {
        const guild = await Core.guilds.fetch(guildId)
        if (!guild) return
        
        const voiceChannels = guild.channels.cache.filter(ch => ch.isVoiceBased())

        for (const [id, channel] of voiceChannels) {
            if (channel.members.size == 0) continue

            for (const [id, member] of channel.members) {
                if (member.user.bot) continue

                VoiceJoinedMap.set(member, Date.now())
            }
        }
    })

    Core.on(`voiceStateUpdate`, async (oldState, newState) => {
        if (oldState.member.user.bot) return
        if (oldState.channelId === newState.channelId) return

        const target = oldState.member

        // Join
        if(!oldState?.channel && newState?.channel) {
            VoiceJoinedMap.set(target.id, Date.now())
        }
        
        // Leave
        if (oldState?.channel && !newState?.channel) {
            VoiceJoinedMap.delete(target.id)
        }
    })

    setInterval(async () => {
        try {
            const guild = await Core.guilds.fetch(guildId)
            if (!guild) return

            for (const [userId, joinedAt] of VoiceJoinedMap) {
                if (Date.now() < joinedAt + 60000) continue

                const { voice } = await guild.members.fetch(userId)

                if (
                    voice.selfDeaf || voice.selfMute ||
                    voice.serverDeaf || voice.serverMute
                ) continue

                if (UserStorage.has(userId)) {
                    const points = UserStorage.get(userId)

                    UserStorage.set(userId, points + 1)
                } else {
                    UserStorage.set(userId, 1)
                }
            }
        } catch (error) {
            console.log(error)
        }
    }, 60_000)
}

module.exports.initVoiceActivityService = initVoiceActivityService
const { Client } = require("discord.js")
const { mainChatId } = require("../config")

/**
 * @param {Client} Core 
 * @param {Map<any, any>} VoiceJoinedMap 
 * @param {Map<any, any>} UserStorage 
 */
function initChatActivityService(Core, ChatCooldown, UserStorage) {
    Core.on("messageCreate", (message) => {
        const { author, channel, content } = message

        if (author.bot) return
        if (channel.id !== mainChatId) return
        if (content.length < 10) return

        if (ChatCooldown.has(author.id)) return

        if (UserStorage.has(author.id)) {
            const points = UserStorage.get(author.id)

            UserStorage.set(author.id, points + 1)
        } else {
            UserStorage.set(author.id, 1)
        }

        ChatCooldown.set(author.id)

        setTimeout(() => ChatCooldown.delete(author.id), 60_000)
    })
}

module.exports.initChatActivityService = initChatActivityService
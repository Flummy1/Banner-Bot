const { Client } = require('discord.js');
const { guildId } = require("./config");
const moment = require('moment');
moment().locale(`ru`);

/**
 * @param {Client} Core 
 * @param {Map<any, any>} UserStorage 
 */
async function getCurrentBestUser(Core, UserStorage) {
    const hours = moment().hour();
    const minutes = moment().minute();

    let best = { userId: null, points: null };

    const guild = await Core.guilds.fetch(guildId);
    if (!guild) return null;

    if (hours % 2 === 0 && minutes == 0) {
        console.log(`Best User update started ` + hours + ` : ` + minutes)

        for (const [userId, points] of UserStorage) {
            if (best.points < points) {
                best = { userId, points };
            }
        }

        UserStorage = new Map()
    }

    if (best.userId) {
        return await guild.members.fetch(best.userId);
    } else {
        return null
    }
}

module.exports.getCurrentBestUser = getCurrentBestUser;
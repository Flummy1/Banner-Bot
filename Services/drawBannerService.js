const { GuildMember } = require("discord.js");
const Canvas = require('canvas');
const moment = require('moment');
moment().locale(`ru`);

const configuration = require('../config');

/**
 * @returns `night` | `morning` | `day` | `evening`
 */
function getCurrentDayTime() {
	const hour = moment().hour();

	if (0 <= hour && hour < 6) {
		return `night`;
	} else if (6 <= hour && hour < 12) {
		return `morning`;
	} else if (12 <= hour && hour < 18) {
		return `day`;
	} else if (18 <= hour) {
		return `evening`;
	}
}

Canvas.registerFont(configuration.fontPath, {
	family: "VAG"
});

/**
 * @param {number} voiceActiveMap
 * @param {GuildMember} currentMostActiveUser
 * @returns 
 */
async function getBannerImage(voiceActiveMap, currentMostActiveUser) {
	const canvas = Canvas.createCanvas(960, 540)
	const ctx = canvas.getContext('2d')

	ctx.fillStyle = `#FFFFFF`
	ctx.textAlign = 'center'
	ctx.font = `76px VAG`

	const backgroundImage = await Canvas.loadImage(
		configuration.backgroundPath[getCurrentDayTime()]
	) 
 
	ctx.drawImage(backgroundImage, 0, 0, 960, 540)
 
  let displayName = `Пустота`
 
  if (currentMostActiveUser) {
    displayName = currentMostActiveUser?.displayName
    
   	const avatarURL = currentMostActiveUser?.displayAvatarURL({ extension: 'png', size: 256 })
  	const avatarImage = avatarURL ? await Canvas.loadImage(avatarURL) : null
  
  	if (avatarImage) {
  		ctx.save();
  
  		ctx.beginPath();
  		ctx.arc(190, 382, 70, 0, Math.PI * 2, true);
  		ctx.closePath();
  		ctx.clip();
  
  		ctx.drawImage(avatarImage, 120, 312, 140, 140);
  
  		ctx.restore();
  	}
  }

	ctx.fillText(voiceActiveMap, 840, 485)

	ctx.textAlign = 'left'

	while (ctx.measureText(`Wolfi4Gate`).width < ctx.measureText(displayName).width) {
		displayName = displayName.substring(0, displayName.length - 3)
		displayName = displayName.substring(0, displayName.length - 1) + `...`
	}

	ctx.fillText(displayName, 300, 405)

	return canvas.toBuffer()
}

module.exports.getBannerImage = getBannerImage;

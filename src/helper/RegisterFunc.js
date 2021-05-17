// NPM Modules
const { MessageEmbed } = require("discord.js-light");

module.exports = (client) => {
	client.djsCommandControl =
		{
			getEmbed: () => (new MessageEmbed)
				.setColor("#ffa800")
				.setFooter(client.user.username, client.user.avatarURL())
		};
};

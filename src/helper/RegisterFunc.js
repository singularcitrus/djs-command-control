import { MessageEmbed } from "discord.js-light";
import FilterCommands from "./FilterCommands";

export default (client) => {
	client.djsCommandControl =
		{
			getEmbed: () => (new MessageEmbed)
				.setColor("#ffa800")
				.setFooter(client.user.username, client.user.avatarURL()),
			FilterCommands,
		};
};

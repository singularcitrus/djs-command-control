export default {
	name: "Help",

	invoke: ["help"],

	description: "Shows this dialog with all the commands",

	usage: "",

	execute: async function (message, others) {
		const { commands, prefix, commandCategories } = others;
		const args = message.content.split(" ");

		// Start by filtering commands by user permission level and whether they should be omitted from help
		let viableCommands = (await message.client.djsCommandControl.FilterCommands.byPermission(commands, message)).filter((command) => !command.omitHelp);

		// Divide command into their respective categories
		const categories = {};
		viableCommands.forEach((command) => {
			if (!categories[command.category]) categories[command.category] = [];
			categories[command.category].push(command);
		});

		// No args, meaning list categories
		if (!args[1]) {
			// Create an embed with
			const embed =
				message.client.djsCommandControl.getEmbed()
					.setTitle("Help Categories")
					.setDescription(`Simply type \`${prefix}help {{category name}}\` to see the commands in that category.\nCategory names are in codeblocks below each category`);

			// Add each category to the embed
			Object.keys(categories).forEach((key) => {
				const category = commandCategories.find((item) => item.name === key);
				if (category) {
					embed.addField(category.title, `\`${category.name}\``);
				}
			});

			// Respond to the users message
			return message.inlineReply(embed);
		} else {
			// The first argument does exists, so we should display the list of commands for each category
			const category = args[1];

			// Make sure the category that the user specified is actually connected to a command
			if (Object.keys(categories).includes(category)) {
				// Try to find the category from the categories enumeration
				const categoryEnum = commandCategories.find((item) => item.name === category);

				// Create a base embed, that we can add to later
				const embed = message.client.djsCommandControl.getEmbed()
					// Fallback to category shortname if the categories enumeration does not contain the category
					.setTitle(`Help: ${categoryEnum ? categoryEnum.title : category}`)
					.setDescription(`Commands in category: \`${category.toLowerCase()}\``);

				// Loop through the commands in the category and add them to the embed
				categories[category].forEach((command) => {
					// Start building the description
					let description = `${command.description}\n`;
					// Add the invokes and usages to the description
					command.invoke.forEach((invoke) => {
						description = `${description}\`${prefix}${invoke} ${command.usage}\`\n`;
					});
					// Add the command to the embed
					embed.addField(`${command.name}`,
						description ,
						false);
				});

				// Reply to the users message
				return message.channel.send(embed);
			} else {
				// The category is invalid, inform the user
				return message.channel.send(message.client.djsCommandControl.getEmbed()
					.setTitle("Help Error")
					.setDescription("Sorry, but either that category does not exist, or you do not have permission to user any of the command in that category"));
			}
		}
	},

	category: "",
	// The array of permissions that can view the command, this is OR, ignored if length 0
	permissions: []
};

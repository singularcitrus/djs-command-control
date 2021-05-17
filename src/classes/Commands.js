const fs = require("fs");
const path = require("path");
const { RateLimiter } = require("discord.js-rate-limiter");

const RegisterFunc = require("../helper/RegisterFunc");

const defaultOptions = {
	defaultCategory: {
		name: "general",
		title: "General"
	}
};

module.exports = class Commands {

	/**
	 * @param {Client} client The default discord.js client
	 * @param {string} path The path relative to the root of the project
	 * @param {
	 * 	{
	 * 		prefix: string,
	 * 		prefixOnMention?: boolean,
	 * 		customizablePrefix?: {
	 * 		    callback: function,
	 * 		    options: {}
	 * 		},
	 *  	defaultCategory?: {
	 *  		name?: string,
	 *  		title?: string
	 *  	},
	 *  	help?: {
	 *  	 	include?: boolean,
	 *			category?: string,
	 *  	},
	 *  	rateLimiter?: {
	 *  		enabled: boolean,
	 *  		amount?: number,
	 *  		interval?: number,
	 *  	}
	 * 	}
	 * }options Creation options
	 */
	constructor(client, path, options) {
		const { prefix, prefixOnMention, customizablePrefix, defaultCategory, help, rateLimiter } = options;
		const { include, category } = help;
		const { enabled, amount, interval } = rateLimiter;
		const { callback, options: prefixOptions } = customizablePrefix;

		this.client = client;
		this.prefix = prefix;
		this.prefixOnMention = !!prefixOnMention;
		this.customizablePrefix = {
			callback: callback ? callback : () => {},
			options: prefixOptions ? prefixOptions : {},
		};

		// Make a discord.js rateLimiter object if rateLimiter should be enabled
		this.rateLimiter = enabled ? new RateLimiter(amount ? amount : 1, interval ? interval : 5000) : null;

		// Add functions into the client object
		RegisterFunc(client);

		// Calculate the default category
		const defCategory = defaultCategory ? defaultCategory : defaultOptions.defaultCategory;
		// Default category name if not specified
		defCategory.name =
			defaultCategory.name && typeof defaultCategory.name === "string"
				? defaultCategory.name
				: defaultOptions.defaultCategory.name;
		// Default category title if not specified
		defCategory.title =
			defaultCategory.title && typeof defaultOptions.title === "string"
				? defaultCategory.title
				: defaultOptions.defaultCategory.title;
		// Set the the first category
		this.categories = [defCategory];

		// Load all commands in the commands array
		this.commands = loadCommands(path);

		// If we should include a help command
		if (include) {
			// Load the default help command
			/**
			 * @type{
			 *     {
			 *       name: string,
			 *       invoke: []string,
			 *       description: string,
			 *       usage: string,
			 *       execute: function():Promise<void>,
			 *       category: string,
			 *       permissions: []string,
			 *     }
			 * }
			 */
			const helpCommand = require("../includes/Help");
			// Set help commands default category
			helpCommand.category = category ? category : defaultCategory.name;
			// Add the help command to the list
			this.commands.push(helpCommand);
		}
	}

	/**
	 * Adds another category to the list
	 *
	 * @param {string} name The name that will be referenced in commands
	 * @param {string} title The title to display in the help message
	 */
	addCategory(name, title) {
		this.categories.push({ name, title });
		return this;
	}

	async messageEvent(message) {
		if (!message.guild) return;

		// Dont do anything if the message author is a bot
		if (message.author.bot) return;

		let usePrefix = this.prefix;

		if (this.customizablePrefix) {
			const functionReturn = this.customizablePrefix.callback(this.customizablePrefix.options);
			usePrefix = functionReturn ? functionReturn : this.prefix;
		}

		// Dont do anything if the message does not start with the prefix or a mention
		if (!message.content.startsWith(usePrefix)
			&& !message.content.startsWith(`<@${this.client.user.id}>`)
			&& !message.content.startsWith(`<@!${this.client.user.id}>`))
			return;

		if (this.rateLimiter && this.rateLimiter.take(message.author.id)) {
			return message.channel.send("You're doing that do often, please try again later!");
		}

		if (this.prefixOnMention &&
				(message.content.trim() === `<@${this.client.user.id}> `
				|| message.content.trim() === `<@!${this.client.user.id}>`))
			message.channel.send(`The current prefix is \`${usePrefix}\``);

		// Filter all commands based on the permissions specified and the user's permissions
		const viableCommands = await message.client.djsCommandControl.FilterCommands.byPermission(this.commands, message);

		// Check the message for every command's invoke
		viableCommands.forEach((command) =>{
			command.invoke.forEach((invoke) => {
				if (message.content.split(" ")[0] === `${usePrefix}${invoke}`
					|| message.content.startsWith(`<@${this.client.user.id}> ${invoke}`)
					|| message.content.startsWith(`<@!${this.client.user.id}> ${invoke}`)) {
					message.react("👍");
					command.execute(message,
						{
							prefix: usePrefix,
							commands: this.commands,
						});
				}
			});
		});
	}
};

/**
 * Recursively load all files in directories and subdirectories
 * https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js
 *
 * @param {string} dirPath
 * @param {string[]} arrayOfFiles
 * @returns {string[]}
 */
function getAllFiles(dirPath, arrayOfFiles) {
	const files = fs.readdirSync(dirPath);

	arrayOfFiles = arrayOfFiles || [];

	files.forEach(function (file) {
		if (fs.statSync(dirPath + "/" + file).isDirectory()) {
			arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
		} else {
			arrayOfFiles.push(path.join(dirPath, "/", file));
		}
	});

	return arrayOfFiles;
}

/**
 * Loads all the commands
 * @recursive
 * @param {string} loadPath The path to load
 * @returns {{name: string, invoke: *[], string, description: string, usage: string, execute: (function(): Promise<void>), category: string, permissions: *[]}[]} Array of commands
 */
function loadCommands(loadPath) {
	/**
	 * @type{[
	 *     {
	 *       name: string,
	 *       invoke: []string,
	 *       description: string,
	 *       usage: string,
	 *       execute: function():Promise<void>,
	 *       category: string,
	 *       permissions: []string,
	 *     }
	 * ]}
	 */
	const commands = [];

	// Read all files in commands folder
	let foundFiles = getAllFiles(`${loadPath}/../${loadPath}`, []);
	// Filter only javascript files in commands folder
	foundFiles.filter((file) => file.endsWith(".js"));

	foundFiles.forEach((file) => {
		// Test if the command has the correct exports
		const command = require(`${file}`);

		// If all this is true it is a valid commands
		if (command.name && command.invoke && command.execute) {
			// Add command to the list, but only use required exports
			commands.push({
				name: command.name,
				invoke: command.invoke,
				description: command.description,
				usage: command.usage,
				execute: command.execute,
				category: command.category ? command.category : "",
				permissions: command.permissions ? command.permissions : [],
				omitHelp: command.omitHelp ? command.omitHelp : false,
			});
		}
	});

	return commands;
}

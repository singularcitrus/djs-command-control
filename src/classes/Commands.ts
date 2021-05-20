import fs from "fs";
import path from "path";
import { RateLimiter } from "discord.js-rate-limiter";
import RegisterFunc from "../helper/RegisterFunc";
import { Client, Message } from "discord.js-light";
import {
  Category,
  CommandObj,
  CommandOptions,
  CustomizablePrefix,
  ModifiedClient,
  RateLimiterOptions,
} from "../types";
import Command from "./Command";
import Help from "../includes/Help";

const defaultOptions = {
  defaultCategory: {
    name: "general",
    title: "General",
  },
};

export default class {
  client: Client;
  prefixOnMention: boolean;
  prefix: string;
  customizablePrefix: CustomizablePrefix | null = null;
  rateLimiter: RateLimiter | null = null;
  categories: Category[];
  commands: CommandObj[];

  /**
   * @param {Client} client The default discord.js client
   * @param {string} path The path relative to the root of the project
   * @param {
   * 	{
   * 		prefix: string,
   * 		prefixOnMention?: boolean,
   * 		customizablePrefix?: CustomizablePrefix,
   *  	defaultCategory?: Category,
   *  	help?: HelpOptions,
   *  	rateLimiter?: RateLimiterOptions
   * 	}
   * }options Creation options
   */
  constructor(client: Client, path: string, options: CommandOptions) {
    const {
      prefix,
      prefixOnMention,
      customizablePrefix,
      defaultCategory,
      help,
      rateLimiter,
    } = options;

    this.client = client;
    this.prefix = prefix;
    this.prefixOnMention = prefixOnMention;

    if (customizablePrefix) {
      const { callback, options: prefixOptions } = customizablePrefix;
      this.customizablePrefix = {
        callback: callback ? callback : () => {},
        options: prefixOptions ? prefixOptions : {},
      };
    }

    if (rateLimiter) {
      const { enabled, amount, interval } = rateLimiter;
      // Make a discord.js rateLimiter object if rateLimiter should be enabled
      this.rateLimiter = enabled
        ? new RateLimiter(amount ? amount : 1, interval ? interval : 5000)
        : null;
    }

    // Add functions into the client object
    RegisterFunc(client as ModifiedClient);

    // Calculate the default category
    const defCategory: Category = defaultCategory
      ? defaultCategory
      : defaultOptions.defaultCategory;

    if (defaultCategory) {
      // Default category name if not specified
      defCategory.name = defaultCategory.name
        ? defaultCategory.name
        : defaultOptions.defaultCategory.name;
      // Default category title if not specified
      defCategory.title = defaultCategory.title
        ? defaultCategory.title
        : defaultOptions.defaultCategory.title;
    }

    // Set the the first category
    this.categories = [defCategory];

    // Load all commands in the commands array
    this.commands = loadCommands(path);

    if (help) {
      const { include, category } = help;
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
        const helpCommand = Help;
        // Set help commands default category
        helpCommand.category = category ? category : defCategory.name;
        // Add the help command to the list
        this.commands.push(helpCommand);
      }
    }
  }

  /**
   * Adds another category to the list
   *
   * @param {string} name The name that will be referenced in commands
   * @param {string} title The title to display in the help message
   */
  addCategory(name: string, title: string) {
    this.categories.push({ name, title });
    return this;
  }

  async messageEvent(message: Message) {
    const client: ModifiedClient = message.client as ModifiedClient;
    if (!message.guild) return;

    // Dont do anything if the message author is a bot
    if (message.author.bot) return;

    let usePrefix = this.prefix;

    if (this.customizablePrefix) {
      const functionReturn = this.customizablePrefix.callback(
        message,
        this.customizablePrefix.options
      );
      usePrefix = functionReturn ? functionReturn : this.prefix;
    }

    // Dont do anything if the message does not start with the prefix or a mention
    if (
      !message.content.startsWith(usePrefix) &&
      !message.content.startsWith(`<@${this.client.user?.id}>`) &&
      !message.content.startsWith(`<@!${this.client.user?.id}>`)
    )
      return;

    if (this.rateLimiter && this.rateLimiter.take(message.author.id)) {
      return message.channel.send(
        "You're doing that do often, please try again later!"
      );
    }

    if (
      this.prefixOnMention &&
      (message.content.trim() === `<@${this.client.user?.id}> ` ||
        message.content.trim() === `<@!${this.client.user?.id}>`)
    )
      await message.channel.send(`The current prefix is \`${usePrefix}\``);

    // Filter all commands based on the permissions specified and the user's permissions
    const viableCommands =
      await client.djsCommandControl.FilterCommands.byPermission(
        this.commands,
        message
      );

    // Check the message for every command's invoke
    viableCommands.forEach((command: CommandObj) => {
      command.invoke.forEach((invoke) => {
        if (
          message.content.split(" ")[0] === `${usePrefix}${invoke}` ||
          message.content.startsWith(`<@${client.user?.id}> ${invoke}`) ||
          message.content.startsWith(`<@!${client.user?.id}> ${invoke}`)
        ) {
          message.react("👍");
          command.execute(message, {
            prefix: usePrefix,
            commands: this.commands,
            commandCategories: this.categories,
          });
        }
      });
    });
  }
}

/**
 * Recursively load all files in directories and subdirectories
 * https://coderrocketfuel.com/article/recursively-list-all-the-files-in-a-directory-using-node-js
 *
 * @param {string} dirPath
 * @param {string[]} arrayOfFiles
 * @returns {string[]}
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[]) {
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
function loadCommands(loadPath: string) {
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
  const commands: CommandObj[] = [];

  // Read all files in commands folder
  let foundFiles = getAllFiles(`${process.cwd()}/${loadPath}`, []);
  // Filter only javascript files in commands folder
  foundFiles.filter((file) => file.endsWith(".js"));

  foundFiles.forEach((file) => {
    // Test if the command has the correct exports
    let command: CommandObj | Command = require(`${file}`);

    if (command instanceof Command) {
      command = command.command;
    }

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

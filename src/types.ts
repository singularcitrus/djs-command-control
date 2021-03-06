import { Client, Message } from "discord.js-light";

export interface CommandOptions {
  prefix: string;
  prefixOnMention: boolean;
  customizablePrefix?: CustomizablePrefix;
  defaultCategory?: Category;
  help?: HelpOptions;
  rateLimiter?: RateLimiterOptions;
}

export interface CustomizablePrefix {
  callback: Function;
  options?: any;
}

export interface Category {
  name: string;
  title: string;
}

export interface HelpOptions {
  include?: boolean;
  omitFromHelp?: boolean;
  category?: string;
}

export interface RateLimiterOptions {
  enabled?: boolean;
  amount?: number;
  interval?: number;
}

export interface CommandObj {
  name: string;
  invoke: string[];
  description: string;
  usage: string;
  execute: Function;
  category: string;
  permissions?: string[];
  omitHelp?: boolean;
}

export interface ModifiedClient extends Client {
  djsCommandControl: DjsCommandControlClient;
}

export interface DjsCommandControlClient {
  getEmbed: Function;
  FilterCommands: FilterCommands;
  [key: string]: any;
}

interface FilterCommands {
  byPermission: (commands: CommandObj[], message: Message) => Promise<any>;
  [key: string]: any;
}

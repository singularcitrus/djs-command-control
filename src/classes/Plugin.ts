import { CommandObj, DjsCommandControlClient } from "../types";
import Command from "./Command";
import Commands from "./Commands";

export default class {
  readonly name: string;
  private _commands: CommandObj[] = [];
  private _initialize: (
    djsCommandControl: DjsCommandControlClient | null,
    ctx: Commands
  ) => DjsCommandControlClient | false = (arg0 = null) => false;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * The function to call when initializing the plugin
   *
   * @param value
   */
  set initialize(
    value: (
      djsCommandControl: DjsCommandControlClient | null,
      ctx: Commands
    ) => DjsCommandControlClient | false
  ) {
    this._initialize = value;
  }
  get initialize(): (
    djsCommandControl: DjsCommandControlClient | null,
    ctx: Commands
  ) => DjsCommandControlClient | false {
    return this._initialize;
  }

  /**
   * Get bundled commands from the plugin
   */
  get commands(): CommandObj[] {
    return this._commands;
  }

  /**
   * Adds a command to bundle with the plugin
   *
   * @param {Command} command The command to bundle
   */
  addBundledCommand(command: Command) {
    if (command instanceof Command) {
      this._commands.push(command.command);
    } else {
      throw new Error("TypeError: command not an instance of Command");
    }
  }
}

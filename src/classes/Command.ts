import { Message } from "discord.js-light";
import { CommandObj } from "../types";

export default class {
  private _name: string = "no-name";
  private _invokes: string[] = [];
  private _description: string = "No Name Command";
  private _usage: string = "";
  private _execute: (
    message?: Message | object,
    options?: any
  ) => Promise<void> = async (message = {}, options = null) => {
    return;
  };
  private _category: string = "";
  private _permissions: string[] = [];
  private _omitHelp: boolean = false;

  constructor() {}

  // Setters
  set name(value: string) {
    this._name = value;
  }
  set description(value: string) {
    this._description = value;
  }
  set invokes(value: string[]) {
    this._invokes = value;
  }
  set usage(value: string) {
    this._usage = value;
  }
  set permissions(value: string[]) {
    this._permissions = value;
  }
  set category(value: string) {
    this._category = value;
  }
  set execute(
    value: (message?: Message | object, options?: any) => Promise<void>
  ) {
    this._execute = value;
  }
  set omitHelp(value: boolean) {
    this._omitHelp = value;
  }

  get command() {
    const commandObj: CommandObj = {
      category: this._category,
      description: this._description,
      execute: this._execute,
      invoke: this._invokes,
      name: this._name,
      usage: this._usage,
      permissions: this._permissions,
      omitHelp: this._omitHelp,
    };
    return commandObj;
  }
}

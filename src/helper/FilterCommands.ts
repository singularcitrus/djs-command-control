import { CommandObj } from "../types";
import { Message } from "discord.js-light";

export default {
  /**
   *
   * @param commands
   * @param { Message } message
   * @returns {Promise<*>}
   */
  byPermission: async (
    commands: CommandObj[],
    message: Message
  ): Promise<any> =>
    // Filter all commands based on the permissions specified and the user's permissions
    commands.filter((command) => {
      let viable = false;
      if (command.permissions && command.permissions.length > 0) {
        command.permissions.forEach((permission: string) => {
          // @ts-ignore
          if (message.member && message.member.hasPermission(permission)) {
            viable = true;
          }
        });
      } else {
        viable = true;
      }
      return viable;
    }),
};

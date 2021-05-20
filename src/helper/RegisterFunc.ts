import { MessageEmbed } from "discord.js-light";
import FilterCommands from "./FilterCommands";
import { ModifiedClient } from "../types";

export default (client: ModifiedClient) => {
  client.djsCommandControl = {
    getEmbed: () =>
      new MessageEmbed()
        .setColor("#ffa800")
        .setFooter(client.user?.username, client.user?.avatarURL() || ""),
    FilterCommands,
  };
};

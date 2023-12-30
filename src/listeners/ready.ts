import { Client } from "discord.js";
import { Commands } from "../Commands";

export default (client: Client): void => {
  client.on("ready", async () => {
    if (!client.user || !client.application) {
      return;
    }
    // @ts-ignore
    // TODO REMOVE THIS, this is temp for testing
    await client.guilds.cache.get('1065125977648279573').commands.set(Commands);

    // Global command registration, takes up to an hour to register.
    await client.application.commands.set(Commands);

    console.log(`${client.user.username} is online`);
  });
};

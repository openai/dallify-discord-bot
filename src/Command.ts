import { ChatInputCommandInteraction, ChatInputApplicationCommandData, Client } from "discord.js";

export interface Command extends ChatInputApplicationCommandData {
    run: (client: Client, interaction: ChatInputCommandInteraction) => void;
}

import { Client, ButtonInteraction } from "discord.js";

// Add more to the context as your actions need them
export interface CustomIdContext {
  count: number; // number of images in the generation
}
export interface Action {
  displayText: string;
  isAction: (customId: string) => boolean;
  customId: (context: CustomIdContext) => string;
  run: (client: Client, interaction: ButtonInteraction) => void;
}

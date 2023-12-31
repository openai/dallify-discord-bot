import { Client, ButtonInteraction } from "discord.js";
import {Quality, Style} from "./utils/constants";

// Add more to the context as your actions need them
export interface CustomIdContext {
  count: number; // number of images in the generation
  quality: Quality; // quality of generation (standard/hd)
  style: Style; // style of generation (vivid/natural)
  width: number;
  height: number;
}
export interface Action {
  displayText: string;
  isAction: (customId: string) => boolean;
  customId: (context: CustomIdContext) => string;
  run: (client: Client, interaction: ButtonInteraction) => void;
}

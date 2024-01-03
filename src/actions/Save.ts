import {
  AttachmentBuilder,
  Client,
  ButtonInteraction,
  ApplicationCommandOptionType,
  Embed,
  EmbedImageData,
} from "discord.js";
import { Action, CustomIdContext } from "../Action";
import { fetchImagesFromComposite } from "../utils/discord";

const MAX_PROMPT_CHAR_IN_FILENAME = 200;

function createFileName(prompt: string, num: number): string {
  let trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length > MAX_PROMPT_CHAR_IN_FILENAME) {
    trimmedPrompt = trimmedPrompt.substring(0, MAX_PROMPT_CHAR_IN_FILENAME);
  }
  const filename = trimmedPrompt.replace(/[/\\?%*:|"<>\n]/g, "-");
  return `DALL-E_${filename}_${num}.png`;
}

export const Save: Action = {
  displayText: "💌 Save",
  isAction: (customId: string) => {
    return customId.startsWith("save:");
  },
  customId: (context: CustomIdContext) => {
      return `save:${context.count},${context.quality},${context.style},${context.width},${context.height}`;
  },
  run: async (client: Client, interaction: ButtonInteraction) => {
    if (interaction.message.embeds.length == 0) {
      return;
    }
    const customId = interaction.customId;
    const matchResults = customId.match(/save:(\d)/);
    if (!matchResults || matchResults.length != 2) {
      return;
    }
    const matchParams = customId.replace("save:", "").split(",");

    const count = parseInt(matchParams[0]);
    const embed = interaction.message.embeds[0];
    const prompt = embed.description ?? "";
    const width = parseInt(matchParams[3]);
    const height = parseInt(matchParams[4]);

    const images = await fetchImagesFromComposite(embed.image, count, width, height).catch(
      console.error
    );
    if (images == null) {
      interaction
        .reply({
          ephemeral: true,
          content: "Failed to process images for Save.",
        })
        .catch(console.error);
      return;
    }

    await interaction.user
      .send(
        `Hello! You wanted me to send you the image(s) I made!\nThe prompt was: ${prompt}`
      )
      .then((message) =>
        interaction
          .reply({
            ephemeral: true,
            content: "Sending images. Check your DMs!",
          })
          .catch(console.error)
      )
      .catch((error) =>
        interaction
          .reply({
            ephemeral: true,
            content: "You have DMs disabled. I cannot send you the images!",
          })
          .catch(console.error)
      );

    await interaction.user
      .send({
        files: images.map(
          (img, index) =>
            new AttachmentBuilder(img, {
              name: createFileName(prompt, index + 1),
            })
        ),
      })
      .catch(console.error);
  },
};

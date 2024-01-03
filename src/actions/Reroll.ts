import { Client, ButtonInteraction } from "discord.js";
import { Action, CustomIdContext } from "../Action";
import {
  imagesFromBase64Response,
  configuration
} from "../utils/openai";
import { createResponse, processOpenAIError } from "../utils/discord";
import { defaultActions } from "../Actions";
import {Quality, Size, Style} from "../utils/constants";

export const Reroll: Action = {
  displayText: "🎲 Reroll",
  isAction: (customId: string) => {
    return customId.startsWith("reroll:");
  },
  customId: (context: CustomIdContext) => {
    return `reroll:${context.count},${context.quality},${context.style},${context.width},${context.height}`;
  },
  run: async (client: Client, interaction: ButtonInteraction) => {
    if (interaction.message.embeds.length == 0) {
      return;
    }
    const customId = interaction.customId;
    const matchResults = customId.match(/reroll:(\d)/);
    if (!matchResults || matchResults.length != 2) {
      return;
    }
    // Remove reroll: from the customId and split on commas
    const matchParams = customId.replace("reroll:", "").split(",");

    // Assert that we have the count[0], quality[1], and style[2] and width[3] and height[4]
    if (matchParams.length != 5) {
      return;
    }

    const embed = interaction.message.embeds[0];
    const prompt = embed.description;
    if (prompt == null) {
      await interaction.reply("Prompt must exist.");
      return;
    }
    const count = parseInt(matchParams[0]);
    const uuid = interaction.user.id;
    const quality = matchParams[1] as Quality;
    const style = matchParams[2] as Style;
    const width = parseInt(matchParams[3]);
    const height = parseInt(matchParams[4]);
    const size = `${width}x${height}` as Size;


    await interaction
      .reply({ content: `Rerolling for <@${uuid}>... 🎲` })
      .catch(console.error);

    try {
      const imagePromises = Array.from({ length: count }, () =>
          configuration.images.generate({
            prompt: prompt,
            n: 1, // Generate only one image per call (dall-e-3 restriction)
            size: size,
            response_format: "b64_json",
            model: "dall-e-3",
            quality: quality,
            style: style
          }).then(completion => imagesFromBase64Response(completion.data))
      );

      // Wait for all promises to resolve
      const imageArrays = await Promise.all(imagePromises);
      const images = imageArrays.flat();

      const context: CustomIdContext = {
        count: count,
        quality: quality,
        style: style,
        width: width,
        height: height
      }
      const response = await createResponse(
        prompt,
        images,
        defaultActions(count),
        context,
      );
      interaction
        .editReply({ ...response, content: `Rerolled for <@${uuid}>! 🎲` })
        .catch(console.error);
    } catch (e) {
      const response = processOpenAIError(e as any, prompt);
      interaction.editReply({ ...response }).catch(console.error);
    }
  },
};

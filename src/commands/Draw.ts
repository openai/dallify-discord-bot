import {
  ChatInputCommandInteraction,
  Client,
  ApplicationCommandType,
  ApplicationCommandOptionType,
} from "discord.js";
import { Command } from "../Command";
import {MAX_IMAGES, DEFAULT_IMAGES, DEFAULT_STYLE, DEFAULT_QUALITY, Style, Quality} from "../utils/constants";
import { createResponse, processOpenAIError } from "../utils/discord";
import {
  imagesFromBase64Response, configuration,
  OPENAI_API_SIZE_ARG,
} from "../utils/openai";
import { defaultActions } from "../Actions";
import {CustomIdContext} from "../Action";

export const Draw: Command = {
  name: "draw",
  description: "Generates images with DALL-E",
  type: ApplicationCommandType.ChatInput,
  options: [
    {
      type: ApplicationCommandOptionType.String,
      name: "prompt",
      description: "Describe the image you want to generate.",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Integer,
      name: "n",
      description: `The number of images you\'d like created. Max ${MAX_IMAGES}.`,
      required: false,
      minValue: 1,
      maxValue: MAX_IMAGES,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "quality",
      description: "The quality of the images. (standard/hd)",
      required: false,
        choices: [
            {
            name: "standard",
            value: "standard",
            },
            {
            name: "hd",
            value: "hd",
            }
        ]
    },
    {
      type: ApplicationCommandOptionType.String,
      name: "style",
      description: "The style of the images. (vivid/natural)",
      required: false,
          choices: [
              {
              name: "vivid",
              value: "vivid",
              },
              {
              name: "natural",
              value: "natural",
              }
          ]

    }
  ],
  run: async (client: Client, interaction: ChatInputCommandInteraction) => {
    const uuid = interaction.user.id;
    const prompt = interaction.options.getString("prompt");
    const count = interaction.options.getInteger("n") ?? DEFAULT_IMAGES;
    const style = (interaction.options.getString("style") ?? DEFAULT_STYLE) as Style;
    const quality = (interaction.options.getString("quality") ?? DEFAULT_QUALITY) as Quality;

    if (prompt == null) {
      await interaction.reply("Prompt must exist.");
      return;
    }

    await interaction.deferReply();

    try {
      // Run the API calls in parallel and then collect afterwards
      const imagePromises = Array.from({ length: count }, () =>
          configuration.images.generate({
            prompt: prompt,
            n: 1, // Generate only one image per call (dall-e-3 restriction)
            size: OPENAI_API_SIZE_ARG,
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
        style: style
      }

      const response = await createResponse(
        prompt,
        images,
        defaultActions(count),
        context
      );
      interaction
        .followUp({ ...response, content: `<@${uuid}>` })
        .catch(console.error);
    } catch (e) {
      // Print the stack trace
      console.error(e);
      const response = processOpenAIError(e as any, prompt);
      interaction.followUp({ ...response }).catch(console.error);
    }
  },
};

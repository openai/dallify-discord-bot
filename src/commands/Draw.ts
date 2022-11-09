import { ChatInputCommandInteraction, Client, ApplicationCommandType, ApplicationCommandOptionType } from "discord.js";
import { Command } from "../Command";
import { MAX_IMAGES, DEFAULT_IMAGES } from "../utils/constants";
import { createResponse, processOpenAIError } from "../utils/discord";
import { OPENAI_API_SIZE_ARG, imagesFromBase64Response, openai } from "../utils/openai";
import { defaultActions } from "../Actions";

export const Draw: Command = {
    name: "draw",
    description: "Generates images with DALL-E",
    type: ApplicationCommandType.ChatInput,
    options: [{
        type: ApplicationCommandOptionType.String,
        name: "prompt",
        description: "Describe the image you want to generate.",
        required: true,
    },
    {
        type: ApplicationCommandOptionType.Integer,
        name: "n",
        description: `The number of images you\'d like created. Max ${MAX_IMAGES}.`,
        minValue: 1,
        maxValue: MAX_IMAGES,
    }],
    run: async (client: Client, interaction: ChatInputCommandInteraction) => {
        const uuid = interaction.user.id;
        const prompt = interaction.options.getString('prompt');
        const count = interaction.options.getInteger('n') ?? DEFAULT_IMAGES;

        if (prompt == null) {
            await interaction.reply(
                "Prompt must exist."
            );
            return;
        }

        await interaction.deferReply();

        try {
            const completion = await openai.createImage({
                prompt: prompt,
                n: count,
                size: OPENAI_API_SIZE_ARG,
                response_format: "b64_json",
            });
            const images = imagesFromBase64Response(completion.data);
            const response = await createResponse(prompt, images, defaultActions(count))
            interaction.followUp({...response, content: `<@${uuid}>`}).catch(console.error);
        } catch(e) {
            const response = processOpenAIError(e as any, prompt)
            interaction.followUp({...response}).catch(console.error);
        }
    }
};

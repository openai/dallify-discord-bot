import { Client, ButtonInteraction } from "discord.js";
import { Action, CustomIdContext } from "../Action";
import { OPENAI_API_SIZE_ARG, imagesFromBase64Response, openai } from "../utils/openai";
import { createResponse, processOpenAIError } from "../utils/discord";
import { defaultActions } from "../Actions";

export const Reroll: Action = {
    displayText: "🎲 Reroll",
    isAction: (customId: string) => {
        return customId.startsWith("reroll:");
    },
    customId: (context: CustomIdContext) => {
        return `reroll:${context.count}`
    },
    run: async (client: Client, interaction: ButtonInteraction) => {
        if (interaction.message.embeds.length == 0) {
            return;
        }
        const customId = interaction.customId;
        const matchResults = customId.match(/reroll:(\d)/)
        if (!matchResults || matchResults.length != 2) {
            return;
        }

        const embed = interaction.message.embeds[0];
        const prompt = embed.description;
        if (prompt == null) {
            await interaction.reply(
                "Prompt must exist."
            );
            return;
        }
        const count = parseInt(matchResults[1]);
        const uuid = interaction.user.id;

        await interaction.reply({ content: `Rerolling for <@${uuid}>... 🎲`}).catch(console.error);

        try {
            const completion = await openai.createImage({
                prompt: prompt,
                n: count,
                size: OPENAI_API_SIZE_ARG,
                response_format: "b64_json",
            });
            const images = imagesFromBase64Response(completion.data);
            const response = await createResponse(prompt, images, defaultActions(count))
            interaction.editReply({...response, content: `Rerolled for <@${uuid}>! 🎲`}).catch(console.error);
        } catch(e) {
            const response = processOpenAIError(e as any, prompt)
            interaction.editReply({...response}).catch(console.error);
        }
    }
};

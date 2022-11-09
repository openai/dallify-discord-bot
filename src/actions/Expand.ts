// @ts-nocheck
import {
  Client,
  ButtonInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageComponentInteraction,
  IntegrationApplication,
} from "discord.js";
import { Action, CustomIdContext } from "../Action";
import {
  OPENAI_API_SIZE_ARG,
  openai,
  Buffer,
  imagesFromBase64Response,
} from "../utils/openai";
import { createResponse, processOpenAIError } from "../utils/discord";
import {
  fetchImagesFromComposite,
  actionsFromRow,
  rowFromActions,
} from "../utils/discord";
import { Save } from "./Save";
import { expandImage } from "../utils/image";
import { EXPAND_ACTION_NUM_IMAGES, LOG_ERRORS } from "../utils/constants";

export const Expand: Action = {
  displayText: "🔭 Expand",
  isAction: (customId: string) => {
    return customId.startsWith("expand:");
  },
  customId: (context: CustomIdContext) => {
    return `expand:${context.count}`;
  },
  run: async (client: Client, interaction: ButtonInteraction) => {
    if (interaction.message.embeds.length == 0) {
      interaction.deferUpdate();
      return;
    }
    if (interaction.message.components.length != 1) {
      // either missing buttons or already showing expand buttons (or other buttons)
      interaction.deferUpdate();
      return;
    }
    const customId = interaction.customId;
    const matchResults = customId.match(/expand:(\d)/);
    if (!matchResults || matchResults.length != 2) {
      interaction.deferUpdate();
      return;
    }

    const count = parseInt(matchResults[1]);
    if (count == 0) {
      interaction.deferUpdate();
      return;
    }
    if (count == 1) {
      await performExpandAction(interaction, 1, 1).catch((e) => {
        if (LOG_ERRORS) {
          console.log(e);
        }
      });
      return;
    }

    const existingActions = actionsFromRow(interaction.message.components[0]);
    const mainRow = rowFromActions(existingActions, { count: count });

    var row = new ActionRowBuilder<ButtonBuilder>();
    var newRows = [mainRow, row];

    for (var i = 0; i <= count; i++) {
      if (row.components.length == 5) {
        row = new ActionRowBuilder<ButtonBuilder>();
        newRows.push(row);
      }
      if (i == 0) {
        const button = new ButtonBuilder()
          .setCustomId(`expand_picker:close`)
          .setLabel(`❌`)
          .setStyle(ButtonStyle.Secondary);
        row.addComponents(button);
      } else {
        const button = new ButtonBuilder()
          .setCustomId(`expand_picker:${i}`)
          .setLabel(`🔭 ${i}`)
          .setStyle(ButtonStyle.Secondary);
        row.addComponents(button);
      }
    }

    await interaction.update({ components: newRows });

    const collector = interaction.message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 6000,
    });
    collector.on("collect", (i) => {
      if (
        i.user.id === interaction.user.id &&
        i.customId.startsWith("expand_picker:")
      ) {
        collector.stop();
        const matchResults = i.customId.match(/expand_picker:(\d)/);
        if (matchResults && matchResults.length == 2) {
          const step = parseInt(matchResults[1]);
          if (step) {
            performExpandAction(i, step, count).catch(console.log);
            return;
          }
        }
        i.deferUpdate();
      }
      // else don't defer reply because it is not our button and should be handled by whatever owns it
    });

    collector.on("end", (collected) => {
      // put old buttons back
      interaction.editReply({ components: [mainRow] });
    });
  },
};

async function performExpandAction(
  interaction: MessageComponentInteraction,
  step: number,
  count: number
) {
  if (step == 0 || interaction.message.embeds.length == 0) {
    return;
  }
  const embed = interaction.message.embeds[0];
  const images = await fetchImagesFromComposite(embed.image, count).catch(
    console.error
  );
  const index = step - 1;

  if (images == null || images.length <= index) {
    interaction
      .reply({
        ephemeral: true,
        content: "Failed to process images for Expand.",
      })
      .catch(console.error);
    return;
  }

  await interaction.deferReply();
  const prompt = embed.description ?? "";
  const uuid = interaction.user.id;
  const originalImage = images[index];
  const expandedImage = await expandImage(originalImage);
  const finalImage = expandedImage.toPngImageBuffer();

  try {
    const completion = await openai.createImageEdit(
      finalImage,
      finalImage,
      prompt,
      EXPAND_ACTION_NUM_IMAGES,
      OPENAI_API_SIZE_ARG,
      "b64_json"
    );

    const images = imagesFromBase64Response(completion.data);
    // No reroll, if user wants to reroll they can go to the original
    const response = await createResponse(prompt, images, [Save, Expand]);
    interaction
      .followUp({ ...response, content: `Expanded for <@${uuid}>! 🔭` })
      .catch(console.error);
  } catch (e) {
    const response = processOpenAIError(e as any, prompt);
    interaction.followUp({ ...response }).catch(console.error);
  }
}

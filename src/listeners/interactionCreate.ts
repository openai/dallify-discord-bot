import {
  CommandInteraction,
  Client,
  Interaction,
  GuildMember,
  PermissionsBitField,
  GuildTextBasedChannel,
  ChatInputCommandInteraction,
  ButtonInteraction,
  BaseInteraction,
} from "discord.js";
import { Commands } from "../Commands";
import { ALLOWED_SERVER_IDS, LOG_ERRORS } from "../utils/constants";
import { Actions } from "../Actions";

export default (client: Client): void => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    try {
      if (interaction.isCommand() || interaction.isContextMenuCommand()) {
        await handleSlashCommand(client, interaction);
      } else if (interaction.isButton()) {
        await handleButtonAction(client, interaction);
      }
    } catch (error) {
      if (LOG_ERRORS) {
        console.log(error);
      }
    }
  });
};

function checkPermissions(interaction: BaseInteraction): string | null {
  if (!interaction.inGuild()) {
    // no DM's, change if needed
    if (LOG_ERRORS) {
      console.log("Permissions error: No guild.");
    }
    return "**Error:** You don't have permission to do that.";
  }

  if (
    interaction.guildId &&
    !ALLOWED_SERVER_IDS.includes(interaction.guildId)
  ) {
    if (LOG_ERRORS) {
      console.log(
        `Permissions error: Guild ${interaction.guildId} not allowed.`
      );
    }
    return "**Error:** You don't have permission to do that.";
  }

  if (
    !interaction.appPermissions ||
    !interaction.appPermissions.has(PermissionsBitField.Flags.ViewChannel)
  ) {
    // Even though commands don't need ViewChannel, you can't selectively allow
    // commands in certain channels, so we implement permissions by using ViewChannel.
    if (LOG_ERRORS) {
      console.log(`Permissions error: Bot has no view perms in channel.`);
    }
    return "**Error:** You don't have permission to do that.";
  }

  if (
    !interaction.memberPermissions ||
    !interaction.memberPermissions.has(PermissionsBitField.Flags.SendMessages)
  ) {
    // Match bot perms to whether user has message perm
    if (LOG_ERRORS) {
      console.log(`Permissions error: User has no send perms in channel.`);
    }
    return "**Error:** You don't have permission to do that.";
  }

  return null;
}

const handleSlashCommand = async (
  client: Client,
  interaction: CommandInteraction
): Promise<void> => {
  const permissionCheckResult = checkPermissions(interaction);
  if (permissionCheckResult) {
    await interaction
      .reply({ content: permissionCheckResult, ephemeral: true })
      .catch(console.error);
    return;
  }

  const slashCommand = Commands.find((c) => c.name === interaction.commandName);
  if (!slashCommand) {
    await interaction.reply({ content: "Missing command." });
    return;
  }

  if (!(interaction instanceof ChatInputCommandInteraction)) {
    interaction.reply({ content: "You do not have permission to use this." });
    return;
  }

  slashCommand.run(client, interaction);
};

const handleButtonAction = async (
  client: Client,
  interaction: ButtonInteraction
): Promise<void> => {
  const permissionCheckResult = checkPermissions(interaction);
  if (permissionCheckResult) {
    await interaction
      .reply({ content: permissionCheckResult, ephemeral: true })
      .catch(console.error);
    return;
  }

  const action = Actions.find((c) => c.isAction(interaction.customId));
  if (!action) {
    // unhandled here, maybe it's handled somewhere else?
    return;
  }

  action.run(client, interaction);
};

import * as config from "./config.json";
export const DISCORD_BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN ?? config.DISCORD_BOT_TOKEN;
export const DISCORD_BOT_CLIENT_ID =
  process.env.DISCORD_BOT_CLIENT_ID ?? config.DISCORD_BOT_CLIENT_ID;

export const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY ?? config.OPENAI_API_KEY;

export const OPENAI_ORGANIZATION = process.env.OPENAI_ORGANIZATION ?? config.OPENAI_ORGANIZATION;
export const ALLOWED_SERVER_IDS: string[] = process.env.ALLOWED_SERVER_IDS ? process.env.ALLOWED_SERVER_IDS.split(",") : config.ALLOWED_SERVER_IDS ?? []; // only servers with these ids can use the bot

/* To set these constants without hardcoding, create a json file at:
src/utils/config.json
and set its contents to the below, with your values
{
    "DISCORD_BOT_TOKEN": "my-discord-bot-token",
    "DISCORD_BOT_CLIENT_ID": "my-discord-bot-app-id",
    "OPENAI_API_KEY": "sk-my-openai-api-key",
    "OPENAI_ORGANIZATION": "my-openai-organization-id",
    "ALLOWED_SERVER_IDS": [
        "my-server-id-1",
        "my-server-id-2"
    ]
}
*/
if (!DISCORD_BOT_CLIENT_ID) {
  throw "DISCORD_BOT_CLIENT_ID must be set in env or config";
}
if (!DISCORD_BOT_TOKEN) {
  throw "DISCORD_BOT_TOKEN must be set in env or config";
}
if (!OPENAI_API_KEY) {
  throw "OPENAI_API_KEY must be set in env or config";
}
export const MAX_IMAGES = 4; // the API supports 1 to 10 images per request
export const DEFAULT_IMAGES = 2; // This is used when no number is given
export type Size = "1024x1024" | "1792x1024" | "1024x1792";
export const DEFAULT_IMAGE_SIZE: number = 1024; // Valid options are 1024 (1024x1024), 1792 (1024x1792), -1792 (1792x1024)
export const EXPAND_ACTION_PADDING = 120; // How many pixels the Expand action adds on each side.
export const EXPAND_ACTION_NUM_IMAGES = 2; // how many images to show for an expand action
export const LOG_ERRORS = true;

// The style of the generated images. Must be one of vivid or natural. Vivid causes the model to lean towards generating hyper-real and dramatic images.
// Natural causes the model to produce more natural, less hyper-real looking images.
export type Style = "vivid" | "natural" | undefined | null;
export const DEFAULT_STYLE: Style = "vivid";
export type Quality = "standard" | "hd";
export const DEFAULT_QUALITY: Quality = "standard"; // The quality of the image that will be generated. hd creates images with finer details and greater consistency across the image.


if (DEFAULT_IMAGES > MAX_IMAGES) {
  throw `DEFAULT_IMAGES must not be greater than MAX_IMAGES`;
}

// The API only supports these
if (![1024, 1792, -1792].includes(DEFAULT_IMAGE_SIZE)) {
  throw `Invalid IMAGE_SIZE ${DEFAULT_IMAGE_SIZE}`;
}

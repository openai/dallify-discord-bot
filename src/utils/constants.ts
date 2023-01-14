import * as config from "./config.json";
export const DISCORD_BOT_TOKEN =
  process.env.DISCORD_BOT_TOKEN ?? config.DISCORD_BOT_TOKEN;
export const DISCORD_BOT_CLIENT_ID =
  process.env.DISCORD_BOT_CLIENT_ID ?? config.DISCORD_BOT_CLIENT_ID;

export const OPENAI_API_KEY =
  process.env.OPENAI_API_KEY ?? config.OPENAI_API_KEY;
export const ALLOWED_SERVER_IDS: string[] = process.env.ALLOWED_SERVER_IDS ? process.env.ALLOWED_SERVER_IDS.split(",") : config.ALLOWED_SERVER_IDS ?? []; // only servers with these ids can use the bot

/* To set these constants without hardcoding, create a json file at:
src/utils/config.json
and set its contents to the below, with your values
{
    "DISCORD_BOT_TOKEN": "my-discord-bot-token",
    "DISCORD_BOT_CLIENT_ID": "my-discord-bot-app-id",
    "OPENAI_API_KEY": "sk-my-openai-api-key",
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
export const IMAGE_SIZE: number = 256;
export const EXPAND_ACTION_PADDING = 120; // How many pixels the Expand action adds on each side
export const EXPAND_ACTION_NUM_IMAGES = 2; // how many images to show for an expand action
export const LOG_ERRORS = true;

if (DEFAULT_IMAGES > MAX_IMAGES) {
  throw `DEFAULT_IMAGES must not be greater than MAX_IMAGES`;
}

// The API only supports these
if (![256, 512, 1024].includes(IMAGE_SIZE)) {
  throw `Invalid IMAGE_SIZE ${IMAGE_SIZE}`;
}

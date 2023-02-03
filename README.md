# Please read!


**For any problems running this specific bot:** [Discord Project Post](https://discord.com/channels/974519864045756446/1039968564699992106)

**For general OpenAI API problems or questions:** [Discord API Discussions](https://discord.com/channels/974519864045756446/1037561178286739466)

**For bugs in the template code:** create an Issue

**For feature requests:** this repo is not accepting feature requests, you can discuss potential features in [Discord Project Post](https://discord.com/channels/974519864045756446/1039968564699992106)

**For PRs:** only bug fix PRs wil be accepted. If you are implementing a new feature, please fork this repo.

Thank you!

---
Example code for running a Discord Bot that uses OpenAI's DALL-E api to generate AI images.

This bot uses OpenAI's NodeJS SDK, and v14 of discord.js, and is written in Typescript.


# Features include:

- draw command to generate images (1 to 9) using the generations endpoint
- save button to send images to user's DMs
- reroll button to rerun that generation
- expand button to zoom out of the image by using the edits (inpaint) endpoint

# Discord Bot setup:

https://discordjs.guide/preparations/setting-up-a-bot-application.html

Your bot needs the following bot permissions:

- Send Messages
- Use Slash Commands
- Attach Files

Use the invite link in `src/Bot.ts`, which includes the above permissions.

# Secrets setup:

1. Go to `src/utils/constants.ts` and follow the comments to create `src/utils/config.json`
2. Copy your bot's client id and token into `config.json`
3. Copy your server's id into `config.json` (https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-)
4. Copy your OpenAI API key into `config.json` (https://beta.openai.com/account/api-keys)

# Node server setup:

1. install brew if you don't have it (https://docs.brew.sh/Installation)
2. `brew install npm` if you don't have it
3. `npm install` in repo root
4. `npm run start` in repo root

<img width="406" alt="Screen Shot 2022-11-04 at 8 35 39 PM" src="https://user-images.githubusercontent.com/1757898/200099159-d7c01e4d-8f27-4f02-ab76-62e229115edb.png">

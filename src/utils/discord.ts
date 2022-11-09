
import { AttachmentBuilder, EmbedBuilder, BaseMessageOptions, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedImageData, ActionRow, MessageActionRowComponent } from "discord.js";
import { phrases } from '../phrases/phrases.json';
import {createLogo, createTiledComposite} from './image';
import { Action, CustomIdContext } from "../Action";
import { extractImagesFromComposite } from "./image";
import { Actions } from "../Actions";
import { LOG_ERRORS } from "./constants";
import axios from 'axios';

export async function createResponse(prompt: string, imageBuffers: Buffer[], buttonActions: Action[]): Promise<BaseMessageOptions> {
    const logo = await createLogo();
    const composite = await createTiledComposite(imageBuffers);
    const files = [new AttachmentBuilder(logo, { name:'logo.png'}), new AttachmentBuilder(composite, { name:'DALL-E.png'})];
    const randomPhrase = phrases[Math.floor(Math.random()*phrases.length)];

    const embed = new EmbedBuilder()
    .setImage("attachment://DALL-E.png")
    .setColor("#2ee66b")
    .setTitle(randomPhrase)
    .setDescription(prompt) // this is always the prompt, other objects read from this directly
    .setFooter({text: 'Generated with DALL-E API', iconURL: 'attachment://logo.png'});

    const row = rowFromActions(buttonActions, { count: imageBuffers.length});
    if (row) {
        return { embeds: [embed],  files: files, components: [row]};
    } else {
        return { embeds: [embed],  files: files, components: []};
    }
}

export function actionsFromRow(row: ActionRow<MessageActionRowComponent>): Action[] {
    var actions = [];
    for(const component of row.components) {
        const customId = component.customId
        if (customId) {
            const action = Actions.find(c => c.isAction(customId));
            if (action) {
                actions.push(action);
            }
        }
    }
    return actions;
}

export function rowFromActions(actions: Action[], context: CustomIdContext): ActionRowBuilder<ButtonBuilder> | null {
    if (actions.length == 0) {
        return null
    }
    var row = new ActionRowBuilder<ButtonBuilder>()
    for(const action of actions) {
        const button = new ButtonBuilder()
        .setCustomId(action.customId(context))
        .setLabel(action.displayText)
        .setStyle(ButtonStyle.Secondary);
        row = row.addComponents(button);
    }
    return row;
}

export function processOpenAIError(error: any, prompt: string): BaseMessageOptions {
    var result = {};
    const response = error.response;
    if (response) {
        if (response.status == 429) {
            result = {content: `**Something went wrong!** I am slightly overworked.😮‍💨 Please wait a few minutes and I\'ll be good to go!\n Your prompt was: ${prompt}`};
        } else if (response.status >= 500 && response.status < 600) {
            result = {content: `**Something went wrong!** The server is experiencing issues. Please try again later.\n Your prompt was: ${prompt}`};
        } else if (response.data && response.data.error) {
            // custom error keys from the openai api
            result = {content: `**Something went wrong!** ${response.data.error.message}  (${response.data.error.type}) \n Your prompt was: ${prompt}`};
        } else {
            result = {content: `**Something went wrong!** ${response.statusText}  (${response.status}) \n Your prompt was: ${prompt}`};
        }
    } else {
        result = {content: `**Something went wrong!** ${error} \n Your prompt was: ${prompt}`};
    }

    return result;
}

export async function fetchImagesFromComposite(compositeImageData: EmbedImageData | null, count: number): Promise<Buffer[] | null> {
    if (!compositeImageData || count == 0) {
        return null;
    }
    const width = compositeImageData.width;
    const height = compositeImageData.height;
    if (!width || !height) {
        return null;
    }

    try {
        const { data, status } = await axios.get(compositeImageData.url, { responseType: 'arraybuffer' });
        let compositeBuffer = Buffer.from(data);
        const images = await extractImagesFromComposite(
            compositeBuffer, 
            width, 
            height, 
            count
        );
        return images;
    } catch(e) {
        if (LOG_ERRORS) { console.log(`Save encountered an error ${e}`) }
        return null;
    }
}
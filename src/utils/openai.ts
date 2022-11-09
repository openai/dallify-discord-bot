import { IMAGE_SIZE, OPENAI_API_KEY } from './constants';
import { CreateImageRequestSizeEnum, Configuration, OpenAIApi, ImagesResponse } from 'openai';

// Allow Buffer to be used for arguments that require File.
declare module 'buffer' {
    // Return any so it can be used in our SDK calls that require File.
    // The codegen we use makes the type File but any type that works with FormData
    // works.
    interface Buffer {
        toPngImageBuffer: () => any; 
    }
}

// To make Buffers work in FormData without passing in options argument, 
// we need to tell it the file type by giving it a filepath with the extension.
// Import Buffer from this file, then call toPngImageBuffer() on your Buffers 
// before passing them in.
Buffer.prototype.toPngImageBuffer = function() {
    this.path = "image.png"
    return this;
}

export {Buffer} from 'buffer';

// Size enum used for requests
function sizeEnum(): CreateImageRequestSizeEnum {
    if (IMAGE_SIZE == 256) {
        return CreateImageRequestSizeEnum._256x256;
    }
    if (IMAGE_SIZE == 512) {
        return CreateImageRequestSizeEnum._512x512;
    }
    if (IMAGE_SIZE == 1024) {
        return CreateImageRequestSizeEnum._1024x1024;
    }
    throw "Invalid IMAGE_SIZE";
}

export const OPENAI_API_SIZE_ARG = sizeEnum();

const configuration = new Configuration({
    apiKey: OPENAI_API_KEY,
});

// Use this to make calls to our API
export const openai = new OpenAIApi(configuration);

export function imagesFromBase64Response(response: ImagesResponse): Buffer[] {
    const data = response.data;
    const resultData: string[] = data.map(d => d.b64_json) as string[];
    return resultData.map(j => Buffer.from(j, 'base64'));
}
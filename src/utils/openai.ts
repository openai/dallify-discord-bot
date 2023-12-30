import { IMAGE_SIZE, OPENAI_API_KEY } from "./constants";
import OpenAI from "openai";
import {Image, ImagesResponse} from "openai/resources";

// Allow Buffer to be used for arguments that require File.
declare module "buffer" {
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
Buffer.prototype.toPngImageBuffer = function () {
  this.path = "image.png";
  return this;
};

export { Buffer } from "buffer";

type OpenAIApiSize = "1024x1024" | "1024x1792" | "1792x1024" | "256x256" | "512x512";

// Size enum used for requests
function sizeEnum(): OpenAIApiSize {
  if (IMAGE_SIZE == 1024) {
    return "1024x1024";
  }
  if (IMAGE_SIZE == 1792) {
    return "1024x1792";
  }
  if (IMAGE_SIZE == -1792) {
    return "1792x1024";
  }
  throw "Invalid IMAGE_SIZE";
}

export const OPENAI_API_SIZE_ARG: OpenAIApiSize = sizeEnum();

export const configuration = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export function imagesFromBase64Response(response: Image[]): Buffer[] {
  const resultData: string[] = response.map((d) => d.b64_json) as string[];
  return resultData.map((j) => Buffer.from(j, "base64"));
}

import { Color, SharpOptions, OverlayOptions } from "sharp";
import sharp from "sharp";
import {DEFAULT_IMAGE_SIZE, EXPAND_ACTION_PADDING} from "./constants";

const LOGO_SIZE = 10;

function createLogoConfig(colors: Color): SharpOptions {
  return {
    create: {
      width: LOGO_SIZE,
      height: LOGO_SIZE,
      channels: 4,
      background: colors,
    },
  };
}

export async function createLogo(): Promise<Buffer> {
  const logoParts = [
    {
      input: await sharp(createLogoConfig({ r: 255, g: 255, b: 102, alpha: 1 }))
        .png()
        .toBuffer(),
      left: 0,
      top: 0,
    },
    {
      input: await sharp(createLogoConfig({ r: 66, g: 255, b: 255, alpha: 1 }))
        .png()
        .toBuffer(),
      left: LOGO_SIZE,
      top: 0,
    },
    {
      input: await sharp(createLogoConfig({ r: 81, g: 218, b: 76, alpha: 1 }))
        .png()
        .toBuffer(),
      left: LOGO_SIZE * 2,
      top: 0,
    },
    {
      input: await sharp(createLogoConfig({ r: 255, g: 110, b: 60, alpha: 1 }))
        .png()
        .toBuffer(),
      left: LOGO_SIZE * 3,
      top: 0,
    },
    {
      input: await sharp(createLogoConfig({ r: 60, g: 70, b: 255, alpha: 1 }))
        .png()
        .toBuffer(),
      left: LOGO_SIZE * 4,
      top: 0,
    },
  ];

  return await sharp({
    create: {
      width: LOGO_SIZE * 5,
      height: LOGO_SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite(logoParts)
    .png()
    .toBuffer();
}

export async function createTiledComposite(
    imageBuffers: Buffer[],
    imageWidth: number = DEFAULT_IMAGE_SIZE,
    imageHeight: number = DEFAULT_IMAGE_SIZE
): Promise<Buffer> {
  let canvasWidth = imageWidth;
  let canvasHeight = imageHeight;

  if (imageBuffers.length === 2) {
    canvasWidth = imageWidth * 2;  // Double the width for two images side by side
    canvasHeight = imageHeight;    // Height remains the same
  } else if (imageBuffers.length === 3 || imageBuffers.length === 4) {
    canvasWidth = imageWidth * 2;  // Double the width for a 2x2 grid
    canvasHeight = imageHeight * 2; // Double the height for a 2x2 grid
  }

  const images: OverlayOptions[] = imageBuffers.map((buffer, i) => {
    let left = (i % 2) * imageWidth; // 0 for quadrant 1 and 3, imageWidth for quadrant 2 and 4
    let top = i < 2 ? 0 : imageHeight; // 0 for quadrants 1 and 2, imageHeight for quadrants 3 and 4

    return {
      input: buffer,
      left: left,
      top: top,
    };
  });

  // If there are 3 images, the last quadrant should be empty, so no need to put any image there.

  return await sharp({
    create: {
      width: canvasWidth,
      height: canvasHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
      .composite(images)
      .png()
      .toBuffer();
}


// This is no longer in use for dall-e-3.
export async function expandImage(buffer: Buffer): Promise<Buffer> {
  const result = await sharp(buffer)
    .extend({
      top: EXPAND_ACTION_PADDING,
      bottom: EXPAND_ACTION_PADDING,
      left: EXPAND_ACTION_PADDING,
      right: EXPAND_ACTION_PADDING,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(DEFAULT_IMAGE_SIZE)
    .png()
    .toBuffer();
  return result;
}

// We need the numberOfImages because a composite may have empty spaces when the number of images
// doesn't fit neatly into the composite dimensions.
export async function extractImagesFromComposite(
  composite: Buffer,
  compositeWidth: number,
  compositeHeight: number,
  numberOfImages: number,
  imageWidth: number = DEFAULT_IMAGE_SIZE,
  imageHeight: number = DEFAULT_IMAGE_SIZE
): Promise<Buffer[]> {
  const images = [];
  var i = 0;
  for (let y = 0; y <= compositeHeight - imageHeight; y += imageHeight) {
    for (let x = 0; x <= compositeWidth - imageWidth; x += imageWidth) {
      const image = await sharp(composite)
        .extract({ left: x, top: y, width: imageWidth, height: imageHeight })
        .png()
        .toBuffer();

      images.push(image);

      i += 1;
      if (i == numberOfImages) {
        return images;
      }
    }
  }
  return images;
}

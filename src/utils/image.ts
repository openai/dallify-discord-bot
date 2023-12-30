import { Color, SharpOptions, OverlayOptions } from "sharp";
import sharp from "sharp";
import { IMAGE_SIZE, EXPAND_ACTION_PADDING } from "./constants";

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
  imageBuffers: Buffer[]
): Promise<Buffer> {
  const finalCompositeSize = Math.ceil(Math.sqrt(imageBuffers.length));
  const images: OverlayOptions[] = [];
  imageBuffers.forEach(function (b, i) {
    images.push({
      input: b,
      left: (i % finalCompositeSize) * IMAGE_SIZE,
      top: Math.floor(i / finalCompositeSize) * IMAGE_SIZE,
    });
  });
  return await sharp({
    create: {
      width: IMAGE_SIZE * finalCompositeSize,
      height: Math.ceil(imageBuffers.length / finalCompositeSize) * IMAGE_SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite(images)
    .png()
    .toBuffer();
}

export async function expandImage(buffer: Buffer): Promise<Buffer> {
  const result = await sharp(buffer)
    .extend({
      top: EXPAND_ACTION_PADDING,
      bottom: EXPAND_ACTION_PADDING,
      left: EXPAND_ACTION_PADDING,
      right: EXPAND_ACTION_PADDING,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .resize(IMAGE_SIZE)
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
  numberOfImages: number
): Promise<Buffer[]> {
  const images = [];
  var i = 0;
  for (let y = 0; y <= compositeHeight - IMAGE_SIZE; y += IMAGE_SIZE) {
    for (let x = 0; x <= compositeWidth - IMAGE_SIZE; x += IMAGE_SIZE) {
      const image = await sharp(composite)
        .extract({ left: x, top: y, width: IMAGE_SIZE, height: IMAGE_SIZE })
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

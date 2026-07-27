import { resolveAssetPath } from './resolveAssetPath';

export interface PrintRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Radians: rotates design so its up-axis matches the UV panel up direction. */
  orientationRad: number;
}

export interface UvDesignTransform {
  /** Extra degrees applied after auto UV alignment */
  rotationDeg?: number;
  flipX?: boolean;
  flipY?: boolean;
  /** Detect panel orientation from the white UV island (default true) */
  autoAlign?: boolean;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });
}

function fallbackRegion(width: number, height: number): PrintRegion {
  return {
    x: Math.round(width * 0.28),
    y: Math.round(height * 0.18),
    width: Math.round(width * 0.38),
    height: Math.round(height * 0.42),
    orientationRad: 0
  };
}

/**
 * Finds the near-white print panel and estimates its upright orientation
 * from the panel apex (typical for a cap front shield UV island).
 */
export function findNearWhitePrintRegion(
  image: HTMLImageElement,
  threshold = 225
): PrintRegion {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    return fallbackRegion(canvas.width, canvas.height);
  }

  ctx.drawImage(image, 0, 0);
  const { data, width, height } = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height
  );

  const points: Array<[number, number]> = [];
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const a = data[index + 3];
      if (a < 200) continue;
      if (r >= threshold && g >= threshold && b >= threshold) {
        points.push([x, y]);
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (!points.length) {
    return fallbackRegion(width, height);
  }

  const padX = Math.round((maxX - minX) * 0.06);
  const padY = Math.round((maxY - minY) * 0.06);
  const x = Math.max(0, minX + padX);
  const y = Math.max(0, minY + padY);
  const regionWidth = Math.max(8, maxX - minX - padX * 2);
  const regionHeight = Math.max(8, maxY - minY - padY * 2);

  let sumX = 0;
  let sumY = 0;
  for (const [px, py] of points) {
    sumX += px;
    sumY += py;
  }
  const cx = sumX / points.length;
  const cy = sumY / points.length;

  // Apex = farthest white pixel from centroid (triangle tip / crown direction).
  let apexX = cx;
  let apexY = cy;
  let maxDist = -1;
  for (const [px, py] of points) {
    const dist = (px - cx) ** 2 + (py - cy) ** 2;
    if (dist > maxDist) {
      maxDist = dist;
      apexX = px;
      apexY = py;
    }
  }

  const tx = apexX - cx;
  const ty = apexY - cy;
  // Align design image "up" (-Y in canvas space) with UV up (centroid -> apex).
  const orientationRad = Math.atan2(ty, tx) + Math.PI / 2;

  return {
    x,
    y,
    width: Math.min(regionWidth, width - x),
    height: Math.min(regionHeight, height - y),
    orientationRad
  };
}

/**
 * Composites a Fabric design onto the product's original albedo UV texture
 * with orientation correction so artwork appears upright on the 3D model.
 */
export async function composeDesignOntoBaseAlbedo(options: {
  baseAlbedoPath: string;
  designUrl: string;
  transform?: UvDesignTransform;
}): Promise<string> {
  const baseUrl = resolveAssetPath(options.baseAlbedoPath);
  const [baseImage, designImage] = await Promise.all([
    loadImage(baseUrl),
    loadImage(options.designUrl)
  ]);

  const canvas = document.createElement('canvas');
  canvas.width = baseImage.naturalWidth || baseImage.width;
  canvas.height = baseImage.naturalHeight || baseImage.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not create composition canvas');
  }

  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

  const region = findNearWhitePrintRegion(baseImage);
  const transform = options.transform ?? {};
  const autoAlign = transform.autoAlign !== false;
  const extraRotationRad = ((transform.rotationDeg ?? 0) * Math.PI) / 180;
  const orientationRad = autoAlign ? region.orientationRad : 0;
  const totalRotation = orientationRad + extraRotationRad;

  const fit = Math.min(region.width, region.height) * 0.72;
  const designRatio = designImage.width / Math.max(designImage.height, 1);
  let drawWidth = fit;
  let drawHeight = fit;
  if (designRatio >= 1) {
    drawHeight = fit / designRatio;
  } else {
    drawWidth = fit * designRatio;
  }

  const cx = region.x + region.width / 2;
  const cy = region.y + region.height / 2;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(totalRotation);
  if (transform.flipX) ctx.scale(-1, 1);
  if (transform.flipY) ctx.scale(1, -1);

  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(
      -drawWidth / 2,
      -drawHeight / 2,
      drawWidth,
      drawHeight,
      10
    );
  } else {
    ctx.rect(-drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  }
  ctx.clip();
  ctx.drawImage(designImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
  ctx.restore();

  return canvas.toDataURL('image/png');
}

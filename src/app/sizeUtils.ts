export const PRODUCT_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export type ProductSize = (typeof PRODUCT_SIZES)[number];

/** Visual scale relative to Medium (1.0). */
export const PRODUCT_SIZE_SCALE: Record<ProductSize, number> = {
  S: 0.88,
  M: 1,
  L: 1.08,
  XL: 1.16,
  XXL: 1.24
};

export function normalizeProductSize(
  size: string | null | undefined
): ProductSize {
  const upper = (size || 'M').toUpperCase();
  return (PRODUCT_SIZES as readonly string[]).includes(upper)
    ? (upper as ProductSize)
    : 'M';
}

export function getSizeScaleVector(size: string | null | undefined): string {
  const scale = PRODUCT_SIZE_SCALE[normalizeProductSize(size)];
  return `${scale} ${scale} ${scale}`;
}

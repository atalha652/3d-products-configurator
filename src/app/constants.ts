/**
 * 3D Mockup Editor - Constants
 *
 * All constants for the 3D mockup editor including render defaults and product definitions.
 */

import type { Product } from './ProductSelector/ProductSelector';
import { resolveAssetPath } from './resolveAssetPath';

// ============================================================================
// Render Defaults
// ============================================================================

/** Default maximum number of placeholder slots in mockup scenes */
export const DEFAULT_MAX_PLACEHOLDERS = 10;

/** Default debounce interval for auto-refresh (ms) */
export const DEFAULT_RENDER_DEBOUNCE_MS = 400;

/** Default export dimensions for design pages */
export const DEFAULT_EXPORT_WIDTH = 1048;
export const DEFAULT_EXPORT_HEIGHT = 1048;

// ============================================================================
// Product Configuration
// ============================================================================

/**
 * Product configurations for 3D mockup editor.
 * Each product has assets in public/{assetsFolderName}/.
 */
export const PRODUCTS: Record<string, Product> = {
  cap: {
    label: 'Baseball Cap',
    assetsFolderName: 'cap',
    baseColorTextureIndex: 0,
    cameraOrbit: '160deg 90deg',
    compositeDesignOntoBase: true,
    baseAlbedoPath: '/cap/textures/Material_baseColor.png',
    // Cap front-panel UV is angled/mirrored vs the Fabric canvas.
    uvDesignTransform: {
      autoAlign: true,
      flipX: true,
      rotationDeg: 0
    }
  },
  apparel: {
    label: 'Apparel',
    assetsFolderName: 't-shirt',
    baseColorTextureIndex: 1,
    cameraOrbit: '0deg 90deg'
  },
  hoodie: {
    label: 'Hoodie',
    assetsFolderName: 'hooded_jacket',
    baseColorTextureIndex: 0,
    cameraOrbit: '0deg 75deg',
    compositeDesignOntoBase: true,
    baseAlbedoPath: '/hooded_jacket/textures/JacketMat_baseColor.jpeg',
    uvDesignTransform: {
      autoAlign: false,
      flipX: false,
      rotationDeg: 0
    }
  },
  tacticalJacket: {
    label: 'Tactical Jacket',
    assetsFolderName: 'low_poly_tactical_jacket',
    baseColorTextureIndex: 0,
    cameraOrbit: '0deg 75deg',
    compositeDesignOntoBase: true,
    baseAlbedoPath:
      '/low_poly_tactical_jacket/textures/Material_26_diffuse.png',
    uvDesignTransform: {
      autoAlign: false,
      flipX: false,
      rotationDeg: 0
    }
  }
};

// ============================================================================
// Scene URL Configuration
// ============================================================================

// ============================================================================
// Scene URL Helpers
// ============================================================================

/**
 * Get the URL for a product's design scene.
 */
export function getDesignSceneUrl(productKey: string): string {
  const product = PRODUCTS[productKey];
  if (!product) {
    throw new Error(`Unknown product key: ${productKey}`);
  }
  return resolveAssetPath(`/${product.assetsFolderName}/design.scene`);
}

/**
 * Get the URL for a product's texture mockup scene.
 */
export function getMockupSceneUrl(productKey: string): string {
  const product = PRODUCTS[productKey];
  if (!product) {
    throw new Error(`Unknown product key: ${productKey}`);
  }
  return resolveAssetPath(
    `/${product.assetsFolderName}/textures/Material_baseColor.scene`
  );
}

/**
 * Get the URL for a product's 3D model (local).
 */
export function getModelUrl(productKey: string): string {
  const product = PRODUCTS[productKey];
  if (!product) {
    throw new Error(`Unknown product key: ${productKey}`);
  }
  return `/${product.assetsFolderName}/scene.gltf`;
}

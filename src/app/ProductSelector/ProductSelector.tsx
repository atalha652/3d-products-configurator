/**
 * CE.SDK Mockup Editor - Product Selector (Topbar)
 *
 * Renders a segmented control for selecting product types.
 */

/**
 * Product configuration for 3D mockup editor.
 */
export interface Product {
  /** Display label for the product */
  label: string;
  /** Folder name containing product assets */
  assetsFolderName: string;
  /** Material index for base color texture */
  baseColorTextureIndex: number;
  /** Camera orbit position for 3D view */
  cameraOrbit: string;
  /**
   * When true, design artwork is composited onto the product's original
   * albedo UV map instead of replacing the whole material texture.
   */
  compositeDesignOntoBase?: boolean;
  /** Optional absolute public path to the base albedo texture */
  baseAlbedoPath?: string;
  /** UV placement correction when compositing artwork onto the albedo map */
  uvDesignTransform?: {
    rotationDeg?: number;
    flipX?: boolean;
    flipY?: boolean;
    autoAlign?: boolean;
  };
}

import classNames from 'classnames';
import styles from './ProductSelector.module.css';

// ============================================================================
// Types
// ============================================================================

interface ProductSelectorProps {
  products: Record<string, Product>;
  currentProduct: string;
  onProductChange: (productKey: string) => Promise<void>;
  disabled?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function ProductSelector({
  products,
  currentProduct,
  onProductChange,
  disabled = false
}: ProductSelectorProps) {
  return (
    <div className={styles.container}>
      <div className={styles.segmentedControl}>
        {Object.entries(products).map(([key, product]) => (
          <button
            key={key}
            className={classNames(styles.button, {
              [styles.active]: key === currentProduct
            })}
            disabled={disabled}
            onClick={() => {
              if (key !== currentProduct) {
                onProductChange(key);
              }
            }}
          >
            {product.label}
          </button>
        ))}
      </div>
    </div>
  );
}

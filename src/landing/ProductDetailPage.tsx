import { useEffect, useRef, useState } from 'react';
import {
  HiOutlineShoppingBag,
  HiOutlineBolt,
  HiOutlineCube,
  HiOutlineArrowRight,
  HiOutlineCheck
} from 'react-icons/hi2';
import '@google/model-viewer';
import { ProductItem } from './catalog';
import { PRODUCTS, getModelUrl } from '../app/constants';
import { resolveAssetPath } from '../app/resolveAssetPath';
import type { ModelViewerElement } from '../app/types';
import styles from './ProductDetailPage.module.css';

interface ProductDetailPageProps {
  product: ProductItem;
  onBack: () => void;
  onOpen3DStudio: (productKey: string) => void;
}

export function ProductDetailPage({
  product,
  onBack,
  onOpen3DStudio
}: ProductDetailPageProps) {
  const configuratorKey = product.configuratorKey;
  const has3DPreview =
    Boolean(configuratorKey) && Boolean(configuratorKey && PRODUCTS[configuratorKey]);

  const [viewMode, setViewMode] = useState<'3d' | 'photo'>(
    has3DPreview ? '3d' : 'photo'
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [cartAdded, setCartAdded] = useState(false);
  const modelViewerRef = useRef<ModelViewerElement>(null);

  const gallery =
    product.galleryImages && product.galleryImages.length > 0
      ? product.galleryImages
      : [product.imageUrl];

  const product3D = has3DPreview && configuratorKey ? PRODUCTS[configuratorKey] : null;
  const modelUrl =
    has3DPreview && configuratorKey
      ? resolveAssetPath(getModelUrl(configuratorKey))
      : null;

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer || !product3D) return;
    modelViewer.cameraOrbit = product3D.cameraOrbit;
    modelViewer.jumpCameraToGoal?.();
  }, [product3D]);

  const handleAddToCart = () => {
    setCartAdded(true);
    setTimeout(() => setCartAdded(false), 2000);
  };

  return (
    <div className={styles.container}>
      {/* Header Topbar */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back to Shop
        </button>

        <div className={styles.brandLogo} onClick={onBack}>
          Homedine
        </div>

        <div style={{ width: '120px' }} />
      </header>

      {/* Product Grid */}
      <div className={styles.pdpGrid}>
        {/* Left Column: 3D Preview / Image Gallery */}
        <div className={styles.galleryWrapper}>
          <div className={styles.mainImageFrame}>
            {viewMode === '3d' && modelUrl && product3D ? (
              <model-viewer
                ref={modelViewerRef as React.RefObject<HTMLElement>}
                src={modelUrl}
                camera-controls
                camera-orbit={product3D.cameraOrbit}
                shadow-intensity="1"
                className={styles.product3DViewer}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <img
                src={gallery[selectedImageIndex] || product.imageUrl}
                alt={product.name}
                className={styles.mainImage}
              />
            )}

            {product.badge && (
              <span className={styles.badgeOverlay}>{product.badge}</span>
            )}
          </div>

          {/* Thumbnail Gallery */}
          <div className={styles.thumbnailsRow}>
            {has3DPreview && (
              <button
                type="button"
                className={`${styles.thumbItem} ${styles.thumb3D} ${
                  viewMode === '3d' ? styles.thumbItemActive : ''
                }`}
                onClick={() => setViewMode('3d')}
                title="3D View"
              >
                3D
              </button>
            )}

            {gallery.map((imgUrl, idx) => (
              <button
                type="button"
                key={idx}
                className={`${styles.thumbItem} ${
                  viewMode === 'photo' && selectedImageIndex === idx
                    ? styles.thumbItemActive
                    : ''
                }`}
                onClick={() => {
                  setViewMode('photo');
                  setSelectedImageIndex(idx);
                }}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} view ${idx + 1}`}
                  className={styles.thumbImage}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Product Details & 3D Customizer CTA */}
        <div className={styles.detailsWrapper}>
          <span className={styles.categoryTag}>{product.category}</span>
          <h1 className={styles.productTitle}>{product.name}</h1>

          <div className={styles.ratingRow}>
            <span className={styles.stars}>★ {product.rating}</span>
            <span className={styles.reviewCount}>
              ({product.reviewCount} customer reviews)
            </span>
          </div>

          <div className={styles.priceRow}>
            <span className={styles.price}>${product.price.toFixed(2)}</span>
            {product.originalPrice && (
              <span className={styles.originalPrice}>
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Color Selection */}
          <div className={styles.colorSection}>
            <span className={styles.sectionLabel}>Select Color:</span>
            <div className={styles.colorList}>
              {product.colorSwatches.map((color, idx) => (
                <div
                  key={idx}
                  className={`${styles.colorDot} ${
                    selectedColorIndex === idx ? styles.colorDotActive : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColorIndex(idx)}
                  title={`Color ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Size Selection (for Apparel) */}
          {product.category === 'apparel' && (
            <div className={styles.sizeSection}>
              <span className={styles.sectionLabel}>Select Size:</span>
              <div className={styles.sizeList}>
                {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                  <button
                    key={size}
                    className={`${styles.sizeBtn} ${
                      selectedSize === size ? styles.sizeBtnActive : ''
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className={styles.description}>{product.description}</p>

          {/* Features Bullets */}
          {product.features && (
            <ul className={styles.featuresList}>
              {product.features.map((feat, idx) => (
                <li key={idx}>{feat}</li>
              ))}
            </ul>
          )}

          {/* Action CTAs */}
          <div className={styles.actionsBox}>
            <button
              className={styles.customize3DBtn}
              onClick={() =>
                onOpen3DStudio(product.configuratorKey || 'apparel')
              }
            >
              <HiOutlineCube className={styles.btnIcon} aria-hidden />
              <span>Customize in 3D Studio</span>
              <HiOutlineArrowRight className={styles.btnIcon} aria-hidden />
            </button>

            <div className={styles.secondaryActions}>
              <button className={styles.cartBtn} onClick={handleAddToCart}>
                {cartAdded ? (
                  <>
                    <HiOutlineCheck className={styles.btnIcon} aria-hidden />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <HiOutlineShoppingBag className={styles.btnIcon} aria-hidden />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button className={styles.buyBtn} onClick={handleAddToCart}>
                <HiOutlineBolt className={styles.btnIcon} aria-hidden />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

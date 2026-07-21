import { useState } from 'react';
import { ProductItem } from './catalog';
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
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('M');
  const [cartAdded, setCartAdded] = useState(false);

  const gallery = product.galleryImages && product.galleryImages.length > 0
    ? product.galleryImages
    : [product.imageUrl];

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
        {/* Left Column: Image Gallery */}
        <div className={styles.galleryWrapper}>
          <div className={styles.mainImageFrame}>
            <img
              src={gallery[selectedImageIndex] || product.imageUrl}
              alt={product.name}
              className={styles.mainImage}
            />

            {product.badge && (
              <span className={styles.badgeOverlay}>{product.badge}</span>
            )}
          </div>

          {/* Thumbnail Gallery (Front, Back, Side views) */}
          <div className={styles.thumbnailsRow}>
            {gallery.map((imgUrl, idx) => (
              <div
                key={idx}
                className={`${styles.thumbItem} ${selectedImageIndex === idx ? styles.thumbItemActive : ''}`}
                onClick={() => setSelectedImageIndex(idx)}
              >
                <img
                  src={imgUrl}
                  alt={`${product.name} view ${idx + 1}`}
                  className={styles.thumbImage}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Product Details & 3D Customizer CTA */}
        <div className={styles.detailsWrapper}>
          <span className={styles.categoryTag}>{product.category}</span>
          <h1 className={styles.productTitle}>{product.name}</h1>

          <div className={styles.ratingRow}>
            <span className={styles.stars}>★ {product.rating}</span>
            <span className={styles.reviewCount}>({product.reviewCount} customer reviews)</span>
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
                  className={`${styles.colorDot} ${selectedColorIndex === idx ? styles.colorDotActive : ''}`}
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
                    className={`${styles.sizeBtn} ${selectedSize === size ? styles.sizeBtnActive : ''}`}
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
            {/* Primary 3D Customizer Studio CTA */}
            <button
              className={styles.customize3DBtn}
              onClick={() => onOpen3DStudio(product.configuratorKey || 'apparel')}
            >
              <span>✨ Customize in 3D Studio</span>
              <span>→</span>
            </button>

            <div className={styles.secondaryActions}>
              <button className={styles.cartBtn} onClick={handleAddToCart}>
                {cartAdded ? '✓ Added to Cart' : '🛒 Add to Cart'}
              </button>

              <button className={styles.buyBtn} onClick={handleAddToCart}>
                ⚡ Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

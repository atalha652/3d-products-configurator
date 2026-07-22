import { useEffect, useRef, useState, type FormEvent } from 'react';
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
import { Modal } from './Modal';
import modalStyles from './Modal.module.css';
import styles from './ProductDetailPage.module.css';

type ActiveModal = 'cart' | 'checkout' | 'orderSuccess' | null;

interface CheckoutFormState {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
}

const INITIAL_CHECKOUT: CheckoutFormState = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: ''
};

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
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [checkout, setCheckout] = useState<CheckoutFormState>(INITIAL_CHECKOUT);
  const [cartCount, setCartCount] = useState(0);
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

  const closeModal = () => setActiveModal(null);

  const handleAddToCart = () => {
    setCartCount((count) => count + 1);
    setActiveModal('cart');
  };

  const handleBuyNow = () => {
    setCheckout(INITIAL_CHECKOUT);
    setActiveModal('checkout');
  };

  const handleCheckoutChange = (
    field: keyof CheckoutFormState,
    value: string
  ) => {
    setCheckout((prev) => ({ ...prev, [field]: value }));
  };

  const handlePlaceOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveModal('orderSuccess');
  };

  return (
    <div className={styles.container}>
      {/* Header Topbar */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={onBack}>
          ← Back to Shop
        </button>

        <div className={styles.brandLogo} onClick={onBack}>
          Studio Tee
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.circleIconBtn}
            onClick={() => {
              if (cartCount > 0) setActiveModal('cart');
            }}
            title="Shopping Cart"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </button>

          <button
            type="button"
            className={styles.circleIconBtn}
            title="User Profile"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
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
                {...(product.id === 'apparel-tshirt' ? { 'disable-zoom': true } : {})}
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
                <HiOutlineShoppingBag className={styles.btnIcon} aria-hidden />
                <span>Add to Cart</span>
              </button>

              <button className={styles.buyBtn} onClick={handleBuyNow}>
                <HiOutlineBolt className={styles.btnIcon} aria-hidden />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add to Cart success */}
      <Modal
        isOpen={activeModal === 'cart'}
        onClose={closeModal}
        title="Cart Updated"
        footer={
          <button
            type="button"
            className={modalStyles.primaryBtn}
            onClick={closeModal}
          >
            Continue Shopping
          </button>
        }
      >
        <div className={modalStyles.successState}>
          <div className={modalStyles.successIconWrap}>
            <HiOutlineCheck className={modalStyles.successIcon} aria-hidden />
          </div>
          <p className={modalStyles.successMessage}>
            Added to cart successfully
          </p>
          <p className={modalStyles.successHint}>
            {product.name}
            {product.category === 'apparel' ? ` · Size ${selectedSize}` : ''} · $
            {product.price.toFixed(2)}
          </p>
        </div>
      </Modal>

      {/* Buy Now checkout */}
      <Modal
        isOpen={activeModal === 'checkout'}
        onClose={closeModal}
        title="Checkout"
        footer={
          <>
            <button
              type="submit"
              form="buy-now-checkout-form"
              className={modalStyles.primaryBtn}
            >
              Place Order
            </button>
            <button
              type="button"
              className={modalStyles.secondaryBtn}
              onClick={closeModal}
            >
              Cancel
            </button>
          </>
        }
      >
        <p className={modalStyles.orderSummary}>
          Ordering <strong>{product.name}</strong>
          {product.category === 'apparel' ? (
            <>
              {' '}
              · Size <strong>{selectedSize}</strong>
            </>
          ) : null}{' '}
          · <strong>${product.price.toFixed(2)}</strong>
        </p>

        <form
          id="buy-now-checkout-form"
          className={modalStyles.form}
          onSubmit={handlePlaceOrder}
        >
          <div className={modalStyles.field}>
            <label className={modalStyles.label} htmlFor="checkout-fullName">
              Full name
            </label>
            <input
              id="checkout-fullName"
              className={modalStyles.input}
              type="text"
              required
              autoComplete="name"
              placeholder="Your full name"
              value={checkout.fullName}
              onChange={(e) => handleCheckoutChange('fullName', e.target.value)}
            />
          </div>

          <div className={modalStyles.field}>
            <label className={modalStyles.label} htmlFor="checkout-email">
              Email
            </label>
            <input
              id="checkout-email"
              className={modalStyles.input}
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={checkout.email}
              onChange={(e) => handleCheckoutChange('email', e.target.value)}
            />
          </div>

          <div className={modalStyles.field}>
            <label className={modalStyles.label} htmlFor="checkout-phone">
              Phone
            </label>
            <input
              id="checkout-phone"
              className={modalStyles.input}
              type="tel"
              required
              autoComplete="tel"
              placeholder="+1 555 000 0000"
              value={checkout.phone}
              onChange={(e) => handleCheckoutChange('phone', e.target.value)}
            />
          </div>

          <div className={modalStyles.field}>
            <label className={modalStyles.label} htmlFor="checkout-address">
              Shipping address
            </label>
            <textarea
              id="checkout-address"
              className={modalStyles.textarea}
              required
              autoComplete="street-address"
              placeholder="Street address, apartment, suite"
              value={checkout.address}
              onChange={(e) => handleCheckoutChange('address', e.target.value)}
            />
          </div>

          <div className={modalStyles.row}>
            <div className={modalStyles.field}>
              <label className={modalStyles.label} htmlFor="checkout-city">
                City
              </label>
              <input
                id="checkout-city"
                className={modalStyles.input}
                type="text"
                required
                autoComplete="address-level2"
                placeholder="City"
                value={checkout.city}
                onChange={(e) => handleCheckoutChange('city', e.target.value)}
              />
            </div>

            <div className={modalStyles.field}>
              <label className={modalStyles.label} htmlFor="checkout-postal">
                Postal code
              </label>
              <input
                id="checkout-postal"
                className={modalStyles.input}
                type="text"
                required
                autoComplete="postal-code"
                placeholder="ZIP / Postal"
                value={checkout.postalCode}
                onChange={(e) =>
                  handleCheckoutChange('postalCode', e.target.value)
                }
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Order placed success */}
      <Modal
        isOpen={activeModal === 'orderSuccess'}
        onClose={closeModal}
        title="Order Confirmed"
        footer={
          <button
            type="button"
            className={modalStyles.primaryBtn}
            onClick={closeModal}
          >
            Done
          </button>
        }
      >
        <div className={modalStyles.successState}>
          <div className={modalStyles.successIconWrap}>
            <HiOutlineCheck className={modalStyles.successIcon} aria-hidden />
          </div>
          <p className={modalStyles.successMessage}>
            Your order has been placed successfully
          </p>
          <p className={modalStyles.successHint}>
            We’ll send a confirmation to {checkout.email || 'your email'} shortly.
          </p>
        </div>
      </Modal>
    </div>
  );
}

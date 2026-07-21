import { useState } from 'react';
import { CATALOG_PRODUCTS, ProductItem } from './catalog';
import styles from './LandingPage.module.css';

interface LandingPageProps {
  onSelectProductItem: (product: ProductItem) => void;
  onLaunchStudio: () => void;
}

export function LandingPage({ onSelectProductItem, onLaunchStudio }: LandingPageProps) {
  const [activeCategory, setActiveCategory] = useState<'apparel' | 'furniture'>('apparel');
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = CATALOG_PRODUCTS.filter(
    (item) => item.category === activeCategory
  );

  const handleProductAction = (product: ProductItem) => {
    if (product.isDisabled) return;
    onSelectProductItem(product);
  };

  // Dynamic Hero Content based on active category
  const heroContent = activeCategory === 'apparel'
    ? {
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600&auto=format&fit=crop',
        heading: <>3D Customizer <span className={styles.heroItalic}>for</span><br />Premium Apparel</>,
        subtext: 'Interactive WebGL 3D streetwear and apparel customization studio with real-time textures and dynamic lighting.',
        tag: 'Streetwear & Apparel 3D Studio',
        stat: '100%'
      }
    : {
        image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1600&auto=format&fit=crop',
        heading: <>3D Customizer <span className={styles.heroItalic}>for</span><br />Modern Furniture</>,
        subtext: 'Explore modular living room furniture, luxury armchairs, and workspace desks with real-time 3D inspection.',
        tag: 'Natural. Sustainable. Eco-conscious 3D.',
        stat: '96%'
      };

  return (
    <div className={styles.container}>
      {/* Header / Navbar */}
      <nav className={styles.navbar}>
        <ul className={styles.leftNav}>
          <li className={`${styles.navLink} ${styles.navLinkActive}`}>Shop</li>
          <li
            className={`${styles.navLink} ${activeCategory === 'apparel' ? styles.navLinkActive : ''}`}
            onClick={() => setActiveCategory('apparel')}
          >
            Apparel
          </li>
          <li
            className={`${styles.navLink} ${activeCategory === 'furniture' ? styles.navLinkActive : ''}`}
            onClick={() => setActiveCategory('furniture')}
          >
            Furniture
          </li>
        </ul>

        <div className={styles.brandLogo} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Homedine
        </div>

        <div className={styles.rightNav}>
          <div className={styles.searchBox}>
            <svg width="15" height="15" fill="none" stroke="#9ca3af" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search Product..."
              className={styles.searchInput}
            />
          </div>

          <button className={styles.circleIconBtn} onClick={onLaunchStudio} title="Shopping Cart">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
          </button>

          <button className={styles.circleIconBtn} title="User Profile">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Dynamic Hero Banner matching category */}
      <section className={styles.heroBanner}>
        <img
          key={activeCategory}
          src={heroContent.image}
          alt={`${activeCategory} Configurator Banner`}
          className={styles.heroBg}
        />

        <div className={styles.heroOverlayLeft}>
          <h1 className={styles.heroMainHeading}>
            {heroContent.heading}
          </h1>

          <p className={styles.heroSubtext}>
            {heroContent.subtext}
          </p>
        </div>

        <div className={styles.heroOverlayRight}>
          <div className={styles.heroOverlayTag}>
            {heroContent.tag}
          </div>
          <div className={styles.heroOverlayStat}>
            {heroContent.stat}
          </div>
        </div>
      </section>

      {/* Sub-header / Catalog Controls */}
      <div className={styles.catalogSubHeader}>
        <div className={styles.catalogSubTitle}>
          {activeCategory === 'apparel' ? 'Streetwear & Customized Apparel' : 'Eco Essentials Planet-Friendly'}
        </div>

        <div className={styles.catalogHeaderRow}>
          <h2 className={styles.catalogMainTitle}>
            Bestselling <span className={styles.titleSerif}>✧ {activeCategory === 'apparel' ? 'Apparel' : 'Furniture'}</span>
          </h2>

          <div className={styles.catalogControls}>
            <div className={styles.categoryPills}>
              <button
                className={`${styles.pillBtn} ${activeCategory === 'apparel' ? styles.pillBtnActive : ''}`}
                onClick={() => setActiveCategory('apparel')}
              >
                Apparel
              </button>

              <button
                className={`${styles.pillBtn} ${activeCategory === 'furniture' ? styles.pillBtnActive : ''}`}
                onClick={() => setActiveCategory('furniture')}
              >
                Furniture
              </button>
            </div>

            <a className={styles.moreProductsLink} onClick={onLaunchStudio}>
              <span>More products</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4-Column Product Grid */}
      <div className={styles.productGrid}>
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`${styles.card} ${product.isDisabled ? styles.disabledCard : ''}`}
          >
            <div
              className={styles.cardImageContainer}
              onClick={() => handleProductAction(product)}
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className={styles.cardImage}
              />

              {product.badge && (
                <span
                  className={`${styles.cardBadgePill} ${product.isDisabled ? styles.disabledBadgePill : ''}`}
                >
                  {product.badge}
                </span>
              )}
            </div>

            <div className={styles.cardContent}>
              {/* Color Swatch Dots */}
              <div className={styles.colorSwatches}>
                {product.colorSwatches.map((color, idx) => (
                  <span
                    key={idx}
                    className={styles.swatchDot}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <h3
                className={styles.cardTitle}
                onClick={() => handleProductAction(product)}
              >
                {product.name}
              </h3>

              <div className={styles.cardBottomRow}>
                <span className={styles.cardPrice}>${product.price.toFixed(2)}</span>

                <button
                  className={`${styles.actionPillBtn} ${product.isDisabled ? styles.disabledPillBtn : ''}`}
                  disabled={product.isDisabled}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!product.isDisabled) {
                      setCartCount((prev) => prev + 1);
                      handleProductAction(product);
                    }
                  }}
                >
                  <span>{product.isDisabled ? 'Disabled' : '+ Cart'}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Secondary Full-Width Interior Showcase */}
      <section className={styles.interiorShowcase}>
        <img
          src={
            activeCategory === 'apparel'
              ? 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600&auto=format&fit=crop'
              : 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=1600&auto=format&fit=crop'
          }
          alt="Showcase Banner"
        />
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div>© 2026 Homedine Store. All rights reserved.</div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <a onClick={() => setActiveCategory('apparel')} style={{ cursor: 'pointer', color: '#9ca3af' }}>Apparel</a>
          <a onClick={() => setActiveCategory('furniture')} style={{ cursor: 'pointer', color: '#9ca3af' }}>Furniture</a>
        </div>
      </footer>
    </div>
  );
}

/**
 * 3D Apparel Configurator - Fabric.js design editor + model-viewer preview
 */

import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { resolveAssetPath } from './resolveAssetPath';
import { Mockup3DPreview } from './Mockup3DPreview/Mockup3DPreview';
import {
  FabricDesignEditor,
  type FabricEditorApi
} from './FabricDesignEditor/FabricDesignEditor';
import { PRODUCTS, getModelUrl } from './constants';
import { normalizeHexColor } from './colorUtils';
import { normalizeProductSize } from './sizeUtils';
import { CATALOG_PRODUCTS } from '../landing/catalog';
import styles from './App.module.css';

const DEFAULT_PRODUCT_KEY = 'apparel';

const SHOP_ROUTE_BY_PRODUCT: Record<string, string> = {
  apparel: '/shop/apparel-tshirt',
  cap: '/shop/apparel-cap',
  hoodie: '/shop/apparel-hoodie',
  tacticalJacket: '/shop/apparel-tactical-jacket'
};

const DEFAULT_COLOR_SWATCHES: Record<string, string[]> = {
  apparel: ['#ffffff', '#18181b', '#3f3f46', '#a1a1aa'],
  cap: ['#ffffff', '#09090b', '#27272a', '#71717a'],
  hoodie: ['#ffffff', '#18181b', '#52525b', '#d4d4d8'],
  tacticalJacket: ['#ffffff', '#1f2937', '#365314', '#78716c']
};

export default function App() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const editorApiRef = useRef<FabricEditorApi | null>(null);
  const designSceneJsonRef = useRef<string | null>(null);
  const textureUrlRef = useRef<string | null>(null);

  const { id } = useParams<{ id: string }>();
  const currentProductKey = id && PRODUCTS[id] ? id : DEFAULT_PRODUCT_KEY;

  const colorSwatches = useMemo(() => {
    const catalogItem = CATALOG_PRODUCTS.find(
      (item) => item.configuratorKey === currentProductKey
    );
    return (
      catalogItem?.colorSwatches ??
      DEFAULT_COLOR_SWATCHES[currentProductKey] ??
      ['#ffffff', '#18181b', '#3f3f46', '#a1a1aa']
    );
  }, [currentProductKey]);

  const productColor =
    normalizeHexColor(searchParams.get('color')) ??
    normalizeHexColor(colorSwatches[0]);
  const productSize = normalizeProductSize(searchParams.get('size'));

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mockupImageUrl, setMockupImageUrl] = useState<string | null>(null);

  const handleBackToShop = useCallback(() => {
    const baseRoute =
      SHOP_ROUTE_BY_PRODUCT[currentProductKey] ?? '/shop/apparel-tshirt';
    const params = new URLSearchParams();
    if (productColor) params.set('color', productColor);
    if (productSize) params.set('size', productSize);
    const query = params.toString();
    navigate(`${baseRoute}${query ? `?${query}` : ''}`);
  }, [navigate, currentProductKey, productColor, productSize]);

  const handleProductColorChange = useCallback(
    (color: string) => {
      const normalized = normalizeHexColor(color);
      if (!normalized) return;
      const params = new URLSearchParams(searchParams);
      params.set('color', normalized);
      if (productSize) params.set('size', productSize);
      setSearchParams(params, { replace: true });
    },
    [searchParams, setSearchParams, productSize]
  );

  const handleTextureUrl = useCallback((url: string) => {
    if (textureUrlRef.current && textureUrlRef.current !== url) {
      URL.revokeObjectURL(textureUrlRef.current);
    }
    textureUrlRef.current = url;
    setMockupImageUrl(url);
  }, []);

  const handleEditorReady = useCallback((api: FabricEditorApi) => {
    editorApiRef.current = api;
    setIsPageReady(true);
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const enteringFullscreen = !prev;
      if (enteringFullscreen && editorApiRef.current) {
        designSceneJsonRef.current = editorApiRef.current.toJSON();
        editorApiRef.current = null;
      }
      return enteringFullscreen;
    });
  }, []);

  const product = PRODUCTS[currentProductKey];

  return (
    <div className={styles.app}>
      {!isFullscreen && (
        <header className={styles.appHeader}>
          <button
            type="button"
            className={styles.backBtn}
            onClick={handleBackToShop}
          >
            ← Back to Product
          </button>
        </header>
      )}

      {!isPageReady && (
        <div className={styles.pageSkeleton} aria-busy="true" aria-label="Loading canvas">
          <div className={styles.skeletonPreview}>
            <div className={styles.skeletonShimmer} />
            <div className={styles.skeletonPreviewBody}>
              <div className={styles.skeletonModel} />
            </div>
            <div className={styles.skeletonPreviewControls}>
              <div className={styles.skeletonChip} />
            </div>
          </div>

          <div className={styles.skeletonEditor}>
            <div className={styles.skeletonShimmer} />
            <div className={styles.skeletonToolbar}>
              <div className={styles.skeletonChip} />
              <div className={styles.skeletonChip} />
              <div className={styles.skeletonChip} />
              <div className={styles.skeletonChipWide} />
            </div>
            <div className={styles.skeletonCanvas}>
              <div className={styles.skeletonPage} />
            </div>
            <div className={styles.skeletonSidebar}>
              <div className={styles.skeletonBlock} />
              <div className={styles.skeletonBlock} />
              <div className={styles.skeletonBlockShort} />
            </div>
          </div>
        </div>
      )}

      <div
        className={`${styles.mainLayout} ${isFullscreen ? styles.fullscreenLayout : ''}`}
      >
        <Mockup3DPreview
          mockupImageUrl={mockupImageUrl}
          modelUrl={resolveAssetPath(getModelUrl(currentProductKey))}
          cameraOrbit={product.cameraOrbit}
          baseColorTextureIndex={product.baseColorTextureIndex}
          productColor={productColor}
          productSize={productSize}
          compositeDesignOntoBase={Boolean(product.compositeDesignOntoBase)}
          baseAlbedoPath={product.baseAlbedoPath ?? null}
          uvDesignTransform={product.uvDesignTransform}
          isLoading={isLoading}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />

        {!isFullscreen && (
          <div className={styles.editorWrapper}>
            <FabricDesignEditor
              className={styles.editor}
              initialSceneJson={designSceneJsonRef.current}
              productColor="#ffffff"
              embedProductColorInTexture={!product.compositeDesignOntoBase}
              onReady={handleEditorReady}
              onTextureUrl={handleTextureUrl}
              onLoadingChange={setIsLoading}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * 3D Apparel Configurator - Fabric.js design editor + model-viewer preview
 */

import { useCallback, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { resolveAssetPath } from './resolveAssetPath';
import { Mockup3DPreview } from './Mockup3DPreview/Mockup3DPreview';
import {
  FabricDesignEditor,
  type FabricEditorApi
} from './FabricDesignEditor/FabricDesignEditor';
import { PRODUCTS, getModelUrl } from './constants';
import styles from './App.module.css';

const DEFAULT_PRODUCT_KEY = 'apparel';

const SHOP_ROUTE_BY_PRODUCT: Record<string, string> = {
  apparel: '/shop/apparel-tshirt'
};

export default function App() {
  const navigate = useNavigate();
  const editorApiRef = useRef<FabricEditorApi | null>(null);
  const designSceneJsonRef = useRef<string | null>(null);
  const textureUrlRef = useRef<string | null>(null);

  const { id } = useParams<{ id: string }>();
  const currentProductKey = id && PRODUCTS[id] ? id : DEFAULT_PRODUCT_KEY;

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mockupImageUrl, setMockupImageUrl] = useState<string | null>(null);

  const handleBackToShop = useCallback(() => {
    navigate(SHOP_ROUTE_BY_PRODUCT[currentProductKey] ?? '/shop/apparel-tshirt');
  }, [navigate, currentProductKey]);

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
          isLoading={isLoading}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleToggleFullscreen}
        />

        {!isFullscreen && (
          <div className={styles.editorWrapper}>
            <FabricDesignEditor
              className={styles.editor}
              initialSceneJson={designSceneJsonRef.current}
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

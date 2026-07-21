/**
 * CE.SDK 3D Mockup Editor - Main Application Component
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import CreativeEditor from '@cesdk/cesdk-js/react';
import type CreativeEditorSDK from '@cesdk/cesdk-js';
import type { Configuration } from '@cesdk/cesdk-js';

import { init3dProductPreviewEditor, disposeMockupRenderer } from '../imgly';
import { resolveAssetPath } from './resolveAssetPath';
import { useMockupRenderer } from './hooks/useMockupRenderer';
import { Topbar } from './Topbar/Topbar';
import { Mockup3DPreview } from './Mockup3DPreview/Mockup3DPreview';
import { PRODUCTS, getDesignSceneUrl, getModelUrl } from './constants';
import { LandingPage } from '../landing/LandingPage';
import styles from './App.module.css';

// Default product to load on startup
const DEFAULT_PRODUCT_KEY = 'apparel';

interface AppProps {
  config: Configuration;
}

export default function App({ config }: AppProps) {
  const designEngineRef = useRef<CreativeEditorSDK | null>(null);
  const designSceneStringRef = useRef<string | null>(null);

  // View state: 'landing' (E-commerce store) vs 'editor' (3D Studio)
  const [activeView, setActiveView] = useState<'landing' | 'editor'>('landing');

  const [currentProductKey, setCurrentProductKey] =
    useState(DEFAULT_PRODUCT_KEY);
  const [isProductSwitching, setIsProductSwitching] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Mockup rendering - engine is lazily initialized inside renderMockup
  const {
    mockupImageUrl,
    isLoading,
    setEngineReady,
    renderMockupForProduct,
    resetMockupScene
  } = useMockupRenderer({ designEngineRef, config });

  // Use refs to keep callbacks stable for handleEditorInit
  const renderMockupForProductRef = useRef(renderMockupForProduct);
  renderMockupForProductRef.current = renderMockupForProduct;

  const setEngineReadyRef = useRef(setEngineReady);
  setEngineReadyRef.current = setEngineReady;

  // ============================================================================
  // Product Switching
  // ============================================================================

  const handleProductChange = useCallback(
    async (productKey: string) => {
      const designEngine = designEngineRef.current;
      if (!designEngine) {
        setCurrentProductKey(productKey);
        return;
      }

      if (productKey === currentProductKey) return;

      setIsProductSwitching(true);
      setCurrentProductKey(productKey);
      resetMockupScene();
      designSceneStringRef.current = null;

      try {
        const sceneUrl = getDesignSceneUrl(productKey);
        await designEngine.engine.scene.loadFromURL(sceneUrl);

        // Zoom to fit the first page
        await designEngine.actions.run('zoom.toPage', {
          page: 'first',
          autoFit: true
        });

        await renderMockupForProduct(productKey, undefined);
      } finally {
        setIsProductSwitching(false);
      }
    },
    [currentProductKey, renderMockupForProduct, resetMockupScene]
  );

  // Handler when a user selects a product from Landing Page
  const handleSelectProductFromLanding = useCallback(
    async (productKey: string) => {
      setActiveView('editor');
      if (PRODUCTS[productKey] && productKey !== currentProductKey) {
        await handleProductChange(productKey);
      }
    },
    [currentProductKey, handleProductChange]
  );

  // ============================================================================
  // Fullscreen Handler
  // ============================================================================

  const isFullscreenRef = useRef(isFullscreen);
  isFullscreenRef.current = isFullscreen;

  const handleToggleFullscreen = useCallback(async () => {
    const enteringFullscreen = !isFullscreenRef.current;
    if (enteringFullscreen) {
      const cesdk = designEngineRef.current;
      if (cesdk) {
        try {
          designSceneStringRef.current =
            await cesdk.engine.scene.saveToString();
        } catch {
          designSceneStringRef.current = null;
        }
      }
      designEngineRef.current = null;
    }
    setIsFullscreen(enteringFullscreen);
  }, []);

  // ============================================================================
  // Editor Initialization
  // ============================================================================

  // Stable callback that doesn't change - uses refs for latest values
  const handleEditorInit = useCallback(
    async (cesdk: CreativeEditorSDK) => {
      designEngineRef.current = cesdk;

      await init3dProductPreviewEditor(cesdk);

      const savedDesignScene = designSceneStringRef.current;
      if (savedDesignScene) {
        try {
          await cesdk.engine.scene.loadFromString(savedDesignScene);
        } catch {
          await cesdk.loadFromURL(getDesignSceneUrl(DEFAULT_PRODUCT_KEY));
        }
      } else {
        await cesdk.loadFromURL(getDesignSceneUrl(DEFAULT_PRODUCT_KEY));
      }

      // Zoom to fit the first page
      await cesdk.actions.run('zoom.toPage', { page: 'first', autoFit: true });

      // Signal that engine is ready for history subscriptions
      setEngineReadyRef.current();

      // Render initial mockup (engine initializes lazily on first render)
      await renderMockupForProductRef.current(DEFAULT_PRODUCT_KEY);
    },
    [] // Empty deps - uses refs for latest callbacks
  );

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      disposeMockupRenderer();
    };
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  const product = PRODUCTS[currentProductKey] || PRODUCTS[DEFAULT_PRODUCT_KEY];

  return (
    <div className={styles.app}>
      {/* Landing Page View */}
      {activeView === 'landing' && (
        <LandingPage
          onSelectProduct={handleSelectProductFromLanding}
          onLaunchStudio={() => setActiveView('editor')}
        />
      )}

      {/* 3D Configurator Studio View */}
      <div
        style={{
          display: activeView === 'editor' ? 'flex' : 'none',
          flexDirection: 'column',
          width: '100%',
          height: '100vh',
          overflow: 'hidden'
        }}
      >
        <Topbar
          currentProductKey={currentProductKey}
          onProductChange={handleProductChange}
          disabled={isProductSwitching}
          onBackToStore={() => setActiveView('landing')}
        />

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
              <CreativeEditor
                className={styles.editor}
                config={config}
                init={handleEditorInit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

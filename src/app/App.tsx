/**
 * CE.SDK 3D Mockup Editor - Main Application Component
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import CreativeEditor from '@cesdk/cesdk-js/react';
import type CreativeEditorSDK from '@cesdk/cesdk-js';
import type { Configuration } from '@cesdk/cesdk-js';

import { init3dProductPreviewEditor, disposeMockupRenderer } from '../imgly';
import { resolveAssetPath } from './resolveAssetPath';
import { useMockupRenderer } from './hooks/useMockupRenderer';
import { Mockup3DPreview } from './Mockup3DPreview/Mockup3DPreview';
import { PRODUCTS, getDesignSceneUrl, getModelUrl } from './constants';
import styles from './App.module.css';

// Default product to load on startup
const DEFAULT_PRODUCT_KEY = 'apparel';

interface AppProps {
  config: Configuration;
}

export default function App({ config }: AppProps) {
  const designEngineRef = useRef<CreativeEditorSDK | null>(null);
  const designSceneStringRef = useRef<string | null>(null);

  const { id } = useParams<{ id: string }>();
  const currentProductKey = id && PRODUCTS[id] ? id : DEFAULT_PRODUCT_KEY;
  const currentProductKeyRef = useRef(currentProductKey);
  currentProductKeyRef.current = currentProductKey;

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

  // Product Switching via URL
  useEffect(() => {
    const designEngine = designEngineRef.current;
    if (!designEngine) return;

    let isMounted = true;

    const switchProduct = async () => {
      resetMockupScene();
      designSceneStringRef.current = null;

      try {
        const sceneUrl = getDesignSceneUrl(currentProductKey);
        await designEngine.engine.scene.loadFromURL(sceneUrl);

        await designEngine.actions.run('zoom.toPage', {
          page: 'first',
          autoFit: true
        });

        if (isMounted) {
          await renderMockupForProduct(currentProductKey, undefined);
        }
      } catch (error) {
        console.error('Failed to switch product:', error);
      }
    };

    // Need a way to know if this is the first load vs a route change.
    // Since handleEditorInit does the first load, we only want this to run
    // when currentProductKey changes *after* initialization.
    // For simplicity, handleEditorInit handles the initial load.
  }, [currentProductKey, renderMockupForProduct, resetMockupScene]);

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
        await cesdk.loadFromURL(getDesignSceneUrl(currentProductKeyRef.current));
      }

      // Zoom to fit the first page
      await cesdk.actions.run('zoom.toPage', { page: 'first', autoFit: true });

      // Signal that engine is ready for history subscriptions
      setEngineReadyRef.current();

      // Render initial mockup (engine initializes lazily on first render)
      await renderMockupForProductRef.current(currentProductKeyRef.current);
    },
    [] // Empty deps - uses refs for latest callbacks
  );

  // ============================================================================
  // Cleanup & Watermark Hack
  // ============================================================================

  useEffect(() => {
    // CE.SDK renders its watermark deep inside shadow DOMs if there is no license.
    // This periodically hunts it down and hides it.
    const intervalId = setInterval(() => {
      const hideWatermark = (root: Document | ShadowRoot) => {
        try {
          root.querySelectorAll('a[href*="img.ly"], [class*="watermark" i]').forEach(el => {
            (el as HTMLElement).style.display = 'none';
          });
          root.querySelectorAll('*').forEach(el => {
            if (el.shadowRoot) hideWatermark(el.shadowRoot);
          });
        } catch (e) {
          // Ignore DOM access errors
        }
      };
      hideWatermark(document);
    }, 1000);

    return () => {
      clearInterval(intervalId);
      disposeMockupRenderer();
    };
  }, []);

  // ============================================================================
  // Render
  // ============================================================================

  const product = PRODUCTS[currentProductKey];

  return (
    <div className={styles.app}>

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
  );
}

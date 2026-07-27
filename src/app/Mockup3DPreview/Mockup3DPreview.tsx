/**
 * 3D Preview Panel
 *
 * Renders the 3D product mockup using Google's model-viewer component.
 * Applies the design texture and product color to the 3D model material.
 */

import { useCallback, useEffect, useRef } from 'react';
import classNames from 'classnames';
import '@google/model-viewer';

import type { ModelViewerElement, RgbaColor } from '../types';
import { hexToRgba, normalizeHexColor } from '../colorUtils';
import { getSizeScaleVector, normalizeProductSize } from '../sizeUtils';
import { composeDesignOntoBaseAlbedo } from '../composeProductTexture';
import { Icon } from '../Icon/Icon';
import styles from './Mockup3DPreview.module.css';

interface Mockup3DPreviewProps {
  mockupImageUrl: string | null;
  modelUrl: string;
  cameraOrbit: string;
  baseColorTextureIndex: number;
  productColor?: string | null;
  productSize?: string | null;
  compositeDesignOntoBase?: boolean;
  baseAlbedoPath?: string | null;
  uvDesignTransform?: {
    rotationDeg?: number;
    flipX?: boolean;
    flipY?: boolean;
    autoAlign?: boolean;
  };
  isLoading: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function Mockup3DPreview({
  mockupImageUrl,
  modelUrl,
  cameraOrbit,
  baseColorTextureIndex,
  productColor = null,
  productSize = 'M',
  compositeDesignOntoBase = false,
  baseAlbedoPath = null,
  uvDesignTransform,
  isLoading,
  isFullscreen,
  onToggleFullscreen
}: Mockup3DPreviewProps) {
  const modelViewerRef = useRef<ModelViewerElement>(null);
  const currentTextureUrlRef = useRef<string | null>(null);
  const composedBlobUrlRef = useRef<string | null>(null);
  const normalizedSize = normalizeProductSize(productSize);

  const applyProductColor = useCallback(() => {
    const modelViewer = modelViewerRef.current;
    const materials = modelViewer?.model?.materials;
    if (!materials?.length) return;

    // Apparel: page color is baked into the print texture only — keep the
    // garment body at its default (untinted) so the full shirt does not change.
    if (!compositeDesignOntoBase && materials.length > 1) {
      const white: RgbaColor = [1, 1, 1, 1];
      materials.forEach((material) => {
        if (material.setBaseColorFactor) {
          material.setBaseColorFactor(white);
          return;
        }
        material.pbrMetallicRoughness?.setBaseColorFactor?.(white);
      });
      return;
    }

    const normalized = normalizeHexColor(productColor);
    const colorFactor: RgbaColor = normalized
      ? hexToRgba(normalized) ?? [1, 1, 1, 1]
      : [1, 1, 1, 1];

    // Cap / single-material UV products: tint the shared albedo material.
    materials.forEach((material) => {
      if (material.setBaseColorFactor) {
        material.setBaseColorFactor(colorFactor);
        return;
      }
      material.pbrMetallicRoughness?.setBaseColorFactor?.(colorFactor);
    });
  }, [compositeDesignOntoBase, productColor]);

  const applyProductSize = useCallback(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;
    modelViewer.scale = getSizeScaleVector(normalizedSize);
  }, [normalizedSize]);

  const applyTexture = useCallback(async () => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer || !mockupImageUrl) return;
    if (!modelViewer.model) return;

    try {
      let textureSource = mockupImageUrl;

      if (compositeDesignOntoBase && baseAlbedoPath) {
        textureSource = await composeDesignOntoBaseAlbedo({
          baseAlbedoPath,
          designUrl: mockupImageUrl,
          transform: uvDesignTransform
        });
      }

      const texture = await modelViewer.createTexture(textureSource);
      const material = modelViewer.model.materials[baseColorTextureIndex];
      if (material?.pbrMetallicRoughness?.baseColorTexture) {
        material.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
        currentTextureUrlRef.current = mockupImageUrl;
      }

      if (composedBlobUrlRef.current) {
        URL.revokeObjectURL(composedBlobUrlRef.current);
        composedBlobUrlRef.current = null;
      }

      applyProductColor();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to apply texture:', error);
    }
  }, [
    mockupImageUrl,
    baseColorTextureIndex,
    applyProductColor,
    compositeDesignOntoBase,
    baseAlbedoPath,
    uvDesignTransform
  ]);

  useEffect(() => {
    if (!mockupImageUrl) return;
    void applyTexture();
  }, [mockupImageUrl, applyTexture]);

  useEffect(() => {
    applyProductColor();
  }, [applyProductColor]);

  useEffect(() => {
    applyProductSize();
  }, [applyProductSize]);

  const handleModelLoad = useCallback(() => {
    applyProductColor();
    applyProductSize();
    if (mockupImageUrl) {
      void applyTexture();
    }
  }, [mockupImageUrl, applyTexture, applyProductColor, applyProductSize]);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer) return;
    modelViewer.cameraOrbit = cameraOrbit;
    modelViewer.jumpCameraToGoal?.();
  }, [cameraOrbit]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        onToggleFullscreen();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onToggleFullscreen]);

  useEffect(() => {
    const modelViewer = modelViewerRef.current;
    if (!modelViewer?.shadowRoot) return;

    const styleId = 'mockup-focus-fix';
    if (modelViewer.shadowRoot.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .userInput:focus,
      .userInput:focus-visible {
        outline: none !important;
      }
    `;
    modelViewer.shadowRoot.appendChild(style);
  }, []);

  useEffect(() => {
    return () => {
      if (composedBlobUrlRef.current) {
        URL.revokeObjectURL(composedBlobUrlRef.current);
      }
    };
  }, []);

  return (
    <div
      className={classNames(styles.preview, {
        [styles.fullscreen]: isFullscreen
      })}
    >
      {isLoading && (
        <div className={styles.loadingIndicator}>
          <div className={styles.spinner} />
        </div>
      )}

      <model-viewer
        ref={modelViewerRef as React.RefObject<HTMLElement>}
        className={styles.modelViewer}
        src={modelUrl}
        camera-controls
        camera-orbit={cameraOrbit}
        scale={getSizeScaleVector(normalizedSize)}
        shadow-intensity="1"
        style={{ width: '100%', height: '100%' }}
        onLoad={handleModelLoad}
      />

      <div className={styles.previewFooter}>
        <div className={styles.sizeBadge} aria-label={`Selected size ${normalizedSize}`}>
          Size {normalizedSize}
        </div>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.controlButton}
          title={isFullscreen ? 'Exit fullscreen' : 'View fullscreen'}
          onClick={onToggleFullscreen}
        >
          <Icon name={isFullscreen ? 'fullscreen-leave' : 'fullscreen'} />
        </button>
      </div>
    </div>
  );
}

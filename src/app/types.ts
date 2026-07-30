/**
 * 3D Mockup Editor - Type Definitions
 */

export type RgbaColor = [number, number, number, number];

/**
 * Extended HTMLElement interface for Google's model-viewer web component.
 */
export interface ModelViewerElement extends HTMLElement {
  model?: {
    materials: Array<{
      pbrMetallicRoughness: {
        baseColorTexture: {
          setTexture: (texture: unknown) => void;
        };
        setBaseColorFactor?: (color: RgbaColor) => void;
        baseColorFactor?: RgbaColor;
      };
      setBaseColorFactor?: (color: RgbaColor) => void;
    }>;
  };
  createTexture: (url: string) => Promise<unknown>;
  cameraOrbit: string;
  cameraControls: boolean;
  src: string;
  scale?: string;
  jumpCameraToGoal?: () => void;
}

// Extend JSX.IntrinsicElements for model-viewer web component
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          'camera-controls'?: boolean;
          'disable-zoom'?: boolean;
          'camera-orbit'?: string;
          'shadow-intensity'?: string;
          'auto-rotate'?: boolean;
          'interaction-prompt'?: string;
          'touch-action'?: string;
          'rotation-per-second'?: string;
          poster?: string;
          exposure?: string;
          alt?: string;
          scale?: string;
        },
        HTMLElement
      >;
    }
  }
}

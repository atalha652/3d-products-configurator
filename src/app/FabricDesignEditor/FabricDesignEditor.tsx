/**
 * Fabric.js 2D design editor for apparel print artwork.
 * Exports PNG textures for the 3D model-viewer preview.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Canvas,
  Circle,
  FabricImage,
  IText,
  loadSVGFromString,
  Rect,
  Triangle,
  util,
  type FabricObject
} from 'fabric';
import {
  DEFAULT_EXPORT_HEIGHT,
  DEFAULT_EXPORT_WIDTH,
  DEFAULT_RENDER_DEBOUNCE_MS
} from '../constants';
import {
  ICON_ASSETS,
  IMAGE_ASSETS,
  STICKER_ASSETS,
  type SvgAsset
} from './assets';
import {
  FiArrowDown,
  FiArrowUp,
  FiAlignCenter,
  FiAlignLeft,
  FiAlignRight,
  FiBold,
  FiChevronDown,
  FiCircle,
  FiDownload,
  FiFileText,
  FiGrid,
  FiImage,
  FiItalic,
  FiLayers,
  FiRotateCcw,
  FiRotateCw,
  FiSmile,
  FiTrash2,
  FiType,
  FiUnderline,
  FiUpload,
  FiZoomIn,
  FiZoomOut
} from 'react-icons/fi';
import styles from './FabricDesignEditor.module.css';

export interface FabricEditorApi {
  toJSON: () => string;
  exportPngBlob: () => Promise<Blob>;
}

interface FabricDesignEditorProps {
  className?: string;
  initialSceneJson?: string | null;
  onReady?: (api: FabricEditorApi) => void;
  onTextureUrl?: (url: string) => void;
  onLoadingChange?: (loading: boolean) => void;
}

const HISTORY_LIMIT = 40;
const FONT_FAMILIES = [
  'Arial',
  'Georgia',
  'Impact',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana'
];

type DockCategory =
  | 'elements'
  | 'uploads'
  | 'images'
  | 'text'
  | 'shapes'
  | 'stickers';

const DOCK_ITEMS: Array<{
  id: DockCategory;
  label: string;
  icon: typeof FiGrid;
}> = [
  { id: 'elements', label: 'Elements', icon: FiGrid },
  { id: 'uploads', label: 'Uploads', icon: FiUpload },
  { id: 'images', label: 'Images', icon: FiImage },
  { id: 'text', label: 'Text', icon: FiType },
  { id: 'shapes', label: 'Shapes', icon: FiCircle },
  { id: 'stickers', label: 'Stickers', icon: FiSmile }
];

export function FabricDesignEditor({
  className,
  initialSceneJson,
  onReady,
  onTextureUrl,
  onLoadingChange
}: FabricDesignEditorProps) {
  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<Canvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const suppressHistoryRef = useRef(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const fitScaleRef = useRef(1);
  const zoomFactorRef = useRef(1);
  const autoZoomRef = useRef(true);

  const [fillColor, setFillColor] = useState('#111827');
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const [selectedIsText, setSelectedIsText] = useState(false);
  const [textFontFamily, setTextFontFamily] = useState('Arial');
  const [textFontSize, setTextFontSize] = useState(48);
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);
  const [textAlign, setTextAlign] = useState('left');
  const [dockCategory, setDockCategory] = useState<DockCategory | null>(null);
  const [zoomLabel, setZoomLabel] = useState('Auto');

  const handleDockClick = (id: DockCategory) => {
    setDockCategory((current) => (current === id ? null : id));
  };

  const updateHistoryButtons = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0);
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1);
  }, []);

  const fitCanvasToFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const frame = frameRef.current;
    if (!canvas || !frame) return;

    const padding = 32;
    const availableWidth = Math.max(frame.clientWidth - padding, 240);
    const availableHeight = Math.max(frame.clientHeight - padding, 240);
    const fitScale = Math.min(
      availableWidth / DEFAULT_EXPORT_WIDTH,
      availableHeight / DEFAULT_EXPORT_HEIGHT,
      1
    );
    fitScaleRef.current = fitScale;
    const scale = fitScale * (autoZoomRef.current ? 1 : zoomFactorRef.current);

    canvas.setDimensions(
      {
        width: Math.round(DEFAULT_EXPORT_WIDTH * scale),
        height: Math.round(DEFAULT_EXPORT_HEIGHT * scale)
      },
      { cssOnly: true }
    );
  }, []);

  const exportTexture = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    onLoadingChange?.(true);
    try {
      const dataUrl = canvas.toDataURL({
        format: 'png',
        multiplier: 1,
        enableRetinaScaling: false
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      onTextureUrl?.(url);
    } finally {
      onLoadingChange?.(false);
    }
  }, [onLoadingChange, onTextureUrl]);

  const scheduleExport = useCallback(() => {
    clearTimeout(debounceRef.current);
    onLoadingChange?.(true);
    debounceRef.current = setTimeout(() => {
      void exportTexture();
    }, DEFAULT_RENDER_DEBOUNCE_MS);
  }, [exportTexture, onLoadingChange]);

  const pushHistory = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || suppressHistoryRef.current) return;

    const json = JSON.stringify(canvas.toJSON());
    const next = historyRef.current.slice(0, historyIndexRef.current + 1);
    if (next[next.length - 1] === json) return;

    next.push(json);
    if (next.length > HISTORY_LIMIT) {
      next.shift();
    }
    historyRef.current = next;
    historyIndexRef.current = next.length - 1;
    updateHistoryButtons();
  }, [updateHistoryButtons]);

  const restoreHistory = useCallback(
    async (index: number) => {
      const canvas = canvasRef.current;
      const snapshot = historyRef.current[index];
      if (!canvas || !snapshot || index < 0 || index >= historyRef.current.length) {
        return;
      }

      suppressHistoryRef.current = true;
      try {
        await canvas.loadFromJSON(JSON.parse(snapshot));
        canvas.backgroundColor = '#ffffff';
        canvas.requestRenderAll();
        historyIndexRef.current = index;
        updateHistoryButtons();
        scheduleExport();
      } finally {
        suppressHistoryRef.current = false;
      }
    },
    [scheduleExport, updateHistoryButtons]
  );

  const seedStarterDesign = useCallback((canvas: Canvas) => {
    const title = new IText('YOUR DESIGN', {
      left: DEFAULT_EXPORT_WIDTH / 2,
      top: DEFAULT_EXPORT_HEIGHT / 2 - 40,
      originX: 'center',
      originY: 'center',
      fontSize: 64,
      fontWeight: '700',
      fontFamily: 'Arial',
      fill: '#111827'
    });

    const subtitle = new IText('Edit me · Add text & images', {
      left: DEFAULT_EXPORT_WIDTH / 2,
      top: DEFAULT_EXPORT_HEIGHT / 2 + 30,
      originX: 'center',
      originY: 'center',
      fontSize: 28,
      fontFamily: 'Arial',
      fill: '#6b7280'
    });

    canvas.add(title, subtitle);
    canvas.requestRenderAll();
  }, []);

  useEffect(() => {
    if (!canvasElRef.current || canvasRef.current) return;

    const canvas = new Canvas(canvasElRef.current, {
      width: DEFAULT_EXPORT_WIDTH,
      height: DEFAULT_EXPORT_HEIGHT,
      backgroundColor: '#ffffff',
      preserveObjectStacking: true,
      selection: true
    });
    canvasRef.current = canvas;
    suppressHistoryRef.current = true;

    const handleSelection = () => {
      const active = canvas.getActiveObject();
      setHasSelection(Boolean(active));

      if (active instanceof IText) {
        setSelectedIsText(true);
        setTextFontFamily(active.fontFamily || 'Arial');
        setTextFontSize(Math.round(active.fontSize || 48));
        setTextBold(
          active.fontWeight === 'bold' ||
            Number(active.fontWeight || 400) >= 600
        );
        setTextItalic(active.fontStyle === 'italic');
        setTextUnderline(Boolean(active.underline));
        setTextAlign(active.textAlign || 'left');
        if (typeof active.fill === 'string') {
          setFillColor(active.fill);
        }
      } else {
        setSelectedIsText(false);
        if (active && typeof active.fill === 'string') {
          setFillColor(active.fill);
        }
      }
    };

    const handleMutation = () => {
      if (suppressHistoryRef.current) return;
      pushHistory();
      scheduleExport();
      handleSelection();
    };

    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', handleSelection);
    canvas.on('object:added', handleMutation);
    canvas.on('object:removed', handleMutation);
    canvas.on('object:modified', handleMutation);
    canvas.on('text:changed', handleMutation);

    const api: FabricEditorApi = {
      toJSON: () => JSON.stringify(canvas.toJSON()),
      exportPngBlob: async () => {
        const dataUrl = canvas.toDataURL({
          format: 'png',
          multiplier: 1,
          enableRetinaScaling: false
        });
        const response = await fetch(dataUrl);
        return response.blob();
      }
    };

    const boot = async () => {
      if (initialSceneJson) {
        try {
          await canvas.loadFromJSON(JSON.parse(initialSceneJson));
          canvas.backgroundColor = '#ffffff';
          canvas.requestRenderAll();
        } catch {
          seedStarterDesign(canvas);
        }
      } else {
        seedStarterDesign(canvas);
      }

      historyRef.current = [JSON.stringify(canvas.toJSON())];
      historyIndexRef.current = 0;
      suppressHistoryRef.current = false;
      updateHistoryButtons();
      fitCanvasToFrame();
      onReady?.(api);
      await exportTexture();
    };

    void boot();

    const resizeObserver = new ResizeObserver(() => {
      fitCanvasToFrame();
    });
    if (frameRef.current) {
      resizeObserver.observe(frameRef.current);
    }

    return () => {
      clearTimeout(debounceRef.current);
      resizeObserver.disconnect();
      canvas.off('selection:created', handleSelection);
      canvas.off('selection:updated', handleSelection);
      canvas.off('selection:cleared', handleSelection);
      canvas.off('object:added', handleMutation);
      canvas.off('object:removed', handleMutation);
      canvas.off('object:modified', handleMutation);
      canvas.off('text:changed', handleMutation);
      canvas.dispose();
      canvasRef.current = null;
    };
    // Mount once per editor lifetime (including fullscreen remount).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCentered = useCallback((object: FabricObject) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    object.set({
      left: DEFAULT_EXPORT_WIDTH / 2,
      top: DEFAULT_EXPORT_HEIGHT / 2,
      originX: 'center',
      originY: 'center'
    });
    canvas.add(object);
    canvas.setActiveObject(object);
    canvas.requestRenderAll();
  }, []);

  const handleAddText = () => {
    addCentered(
      new IText('New Text', {
        fontSize: 48,
        fontFamily: 'Arial',
        fill: fillColor,
        fontWeight: '600'
      })
    );
  };

  const handleAddTextPreset = (
    text: string,
    fontSize: number,
    fontWeight: string
  ) => {
    addCentered(
      new IText(text, {
        fontSize,
        fontFamily: 'Arial',
        fill: fillColor,
        fontWeight
      })
    );
  };

  const handleAddRect = () => {
    addCentered(
      new Rect({
        width: 220,
        height: 140,
        fill: fillColor,
        rx: 8,
        ry: 8
      })
    );
  };

  const handleAddCircle = () => {
    addCentered(
      new Circle({
        radius: 80,
        fill: fillColor
      })
    );
  };

  const handleAddTriangle = () => {
    addCentered(
      new Triangle({
        width: 180,
        height: 160,
        fill: fillColor
      })
    );
  };

  const handleUploadImage = async (file: File) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const image = await FabricImage.fromURL(dataUrl);
    const maxSide = 420;
    const scale = Math.min(
      1,
      maxSide / Math.max(image.width || 1, image.height || 1)
    );
    image.scale(scale);
    addCentered(image);
  };

  const handleAddSvgAsset = async (asset: SvgAsset) => {
    const result = await loadSVGFromString(asset.svg);
    const objects = result.objects.filter(
      (object): object is FabricObject => object !== null
    );
    if (!objects.length) return;

    const object = util.groupSVGElements(objects, result.options);
    const maxSide = IMAGE_ASSETS.some((item) => item.id === asset.id)
      ? 360
      : 180;
    const scale = Math.min(
      1,
      maxSide / Math.max(object.width || 1, object.height || 1)
    );
    object.scale(scale);
    addCentered(object);
  };

  const handleAddSticker = (value: string) => {
    addCentered(
      new IText(value, {
        fontSize: 120,
        fontFamily: '"Segoe UI Emoji", "Apple Color Emoji", sans-serif'
      })
    );
  };

  const handleDelete = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const active = canvas.getActiveObjects();
    if (!active.length) return;
    active.forEach((object) => canvas.remove(object));
    canvas.discardActiveObject();
    canvas.requestRenderAll();
  };

  const handleApplyFill = (color: string) => {
    setFillColor(color);
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    active.set('fill', color);
    canvas.requestRenderAll();
    pushHistory();
    scheduleExport();
  };

  const applyTextStyle = (
    properties: Partial<{
      fontFamily: string;
      fontSize: number;
      fontWeight: string;
      fontStyle: string;
      underline: boolean;
      textAlign: string;
    }>
  ) => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !(active instanceof IText)) return;

    active.set(properties);
    canvas.requestRenderAll();
    pushHistory();
    scheduleExport();
  };

  const handleFontFamily = (fontFamily: string) => {
    setTextFontFamily(fontFamily);
    applyTextStyle({ fontFamily });
  };

  const handleFontSize = (fontSize: number) => {
    const safeSize = Math.min(200, Math.max(8, fontSize || 8));
    setTextFontSize(safeSize);
    applyTextStyle({ fontSize: safeSize });
  };

  const handleToggleBold = () => {
    const next = !textBold;
    setTextBold(next);
    applyTextStyle({ fontWeight: next ? 'bold' : 'normal' });
  };

  const handleToggleItalic = () => {
    const next = !textItalic;
    setTextItalic(next);
    applyTextStyle({ fontStyle: next ? 'italic' : 'normal' });
  };

  const handleToggleUnderline = () => {
    const next = !textUnderline;
    setTextUnderline(next);
    applyTextStyle({ underline: next });
  };

  const handleTextAlign = (alignment: string) => {
    setTextAlign(alignment);
    applyTextStyle({ textAlign: alignment });
  };

  const handleBringForward = () => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    canvas.bringObjectForward(active);
    canvas.requestRenderAll();
    pushHistory();
    scheduleExport();
  };

  const handleSendBackward = () => {
    const canvas = canvasRef.current;
    const active = canvas?.getActiveObject();
    if (!canvas || !active) return;
    canvas.sendObjectBackwards(active);
    canvas.requestRenderAll();
    pushHistory();
    scheduleExport();
  };

  const handleExportDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 1,
      enableRetinaScaling: false
    });
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'apparel-design.png';
    link.click();
  };

  const handleExportPdf = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: 'png',
      multiplier: 1,
      enableRetinaScaling: false
    });
    const { jsPDF } = await import('jspdf');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [DEFAULT_EXPORT_WIDTH, DEFAULT_EXPORT_HEIGHT],
      hotfixes: ['px_scaling']
    });
    pdf.addImage(
      dataUrl,
      'PNG',
      0,
      0,
      DEFAULT_EXPORT_WIDTH,
      DEFAULT_EXPORT_HEIGHT
    );
    pdf.save('apparel-design.pdf');
  };

  const handleZoom = (direction: -1 | 1) => {
    autoZoomRef.current = false;
    zoomFactorRef.current = Math.min(
      1.8,
      Math.max(0.4, zoomFactorRef.current + direction * 0.15)
    );
    setZoomLabel(`${Math.round(zoomFactorRef.current * 100)}%`);
    fitCanvasToFrame();
  };

  const handleAutoZoom = () => {
    autoZoomRef.current = true;
    zoomFactorRef.current = 1;
    setZoomLabel('Auto');
    fitCanvasToFrame();
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    suppressHistoryRef.current = true;
    canvas.clear();
    canvas.backgroundColor = '#ffffff';
    seedStarterDesign(canvas);
    suppressHistoryRef.current = false;
    pushHistory();
    scheduleExport();
  };

  return (
    <div className={`${styles.editor} ${className ?? ''}`}>
      <header className={styles.topbar}>
        <div className={styles.historyControls}>
          <button
            type="button"
            className={styles.topbarButton}
            onClick={() => void restoreHistory(historyIndexRef.current - 1)}
            disabled={!canUndo}
          >
            <FiRotateCcw aria-hidden="true" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => void restoreHistory(historyIndexRef.current + 1)}
            disabled={!canRedo}
            title="Redo"
            aria-label="Redo"
          >
            <FiRotateCw aria-hidden="true" />
          </button>
        </div>

        <div className={styles.zoomControls}>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => handleZoom(-1)}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <FiZoomOut aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.zoomSelect}
            onClick={handleAutoZoom}
            title="Fit canvas"
          >
            <span>{zoomLabel}</span>
            <FiChevronDown aria-hidden="true" />
          </button>
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => handleZoom(1)}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <FiZoomIn aria-hidden="true" />
          </button>
        </div>

        <div className={styles.exportControls}>
          <button
            type="button"
            className={styles.exportButton}
            onClick={handleExportDownload}
          >
            <FiDownload aria-hidden="true" />
            Export Image
          </button>
          <button
            type="button"
            className={styles.exportButton}
            onClick={() => void handleExportPdf()}
          >
            <FiFileText aria-hidden="true" />
            Export PDF
          </button>
        </div>
      </header>

      <div
        className={`${styles.editorBody} ${
          dockCategory ? styles.editorBodyPanelOpen : ''
        }`}
      >
        <nav className={styles.dock} aria-label="Design tools">
          {DOCK_ITEMS.map(({ id, label, icon: DockIcon }) => (
            <button
              key={id}
              type="button"
              className={`${styles.dockButton} ${
                dockCategory === id ? styles.dockButtonActive : ''
              }`}
              onClick={() => handleDockClick(id)}
              aria-pressed={dockCategory === id}
              aria-expanded={dockCategory === id}
            >
              <DockIcon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        {dockCategory && (
          <aside className={styles.assetPanel}>
            <div className={styles.assetPanelHeader}>
              <div>
                <span className={styles.eyebrow}>Add to canvas</span>
                <h3>{dockCategory}</h3>
              </div>
              <button
                type="button"
                className={styles.closePanelBtn}
                onClick={() => setDockCategory(null)}
                title="Close panel"
                aria-label="Close panel"
              >
                ×
              </button>
            </div>

            <div className={styles.assetPanelContent}>
              {dockCategory === 'uploads' && (
                <button
                  type="button"
                  className={styles.uploadDropzone}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FiUpload aria-hidden="true" />
                  <strong>Upload an image</strong>
                  <span>PNG, JPG, WebP or SVG</span>
                </button>
              )}

              {(dockCategory === 'elements' ||
                dockCategory === 'images') && (
                <>
                  <h4>
                    {dockCategory === 'elements'
                      ? 'Popular graphics'
                      : 'Image collection'}
                  </h4>
                  <div className={styles.assetGrid}>
                    {(dockCategory === 'elements'
                      ? ICON_ASSETS
                      : IMAGE_ASSETS
                    ).map((asset) => (
                      <button
                        key={asset.id}
                        type="button"
                        className={styles.assetCard}
                        title={`Add ${asset.label}`}
                        onClick={() => void handleAddSvgAsset(asset)}
                      >
                        <span
                          className={`${styles.assetPreview} ${
                            dockCategory === 'elements'
                              ? styles.iconPreview
                              : ''
                          }`}
                          dangerouslySetInnerHTML={{ __html: asset.svg }}
                        />
                        <span>{asset.label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {dockCategory === 'text' && (
                <>
                  <button
                    type="button"
                    className={`${styles.textPreset} ${styles.headingPreset}`}
                    onClick={() =>
                      handleAddTextPreset('Add a heading', 72, '700')
                    }
                  >
                    Add a heading
                  </button>
                  <button
                    type="button"
                    className={`${styles.textPreset} ${styles.subheadingPreset}`}
                    onClick={() =>
                      handleAddTextPreset('Add a subheading', 48, '600')
                    }
                  >
                    Add a subheading
                  </button>
                  <button
                    type="button"
                    className={styles.textPreset}
                    onClick={() =>
                      handleAddTextPreset('Add body text', 30, '400')
                    }
                  >
                    Add body text
                  </button>
                </>
              )}

              {(dockCategory === 'shapes' ||
                dockCategory === 'elements') && (
                <>
                  <h4>Basic shapes</h4>
                  <div className={styles.shapeGrid}>
                    <button
                      type="button"
                      className={styles.shapeCard}
                      onClick={handleAddRect}
                    >
                      <span className={styles.rectangleShape} />
                      Rectangle
                    </button>
                    <button
                      type="button"
                      className={styles.shapeCard}
                      onClick={handleAddCircle}
                    >
                      <span className={styles.circleShape} />
                      Circle
                    </button>
                    <button
                      type="button"
                      className={styles.shapeCard}
                      onClick={handleAddTriangle}
                    >
                      <span className={styles.triangleShape} />
                      Triangle
                    </button>
                  </div>
                </>
              )}

              {dockCategory === 'stickers' && (
                <div className={styles.assetGrid}>
                  {STICKER_ASSETS.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      className={styles.assetCard}
                      title={`Add ${asset.label}`}
                      onClick={() => handleAddSticker(asset.value)}
                    >
                      <span className={styles.stickerPreview}>
                        {asset.value}
                      </span>
                      <span>{asset.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </aside>
        )}

        <main className={styles.stage}>
          {hasSelection && (
            <div className={styles.selectionToolbar}>
              {selectedIsText && (
                <>
                  <select
                    className={styles.fontSelect}
                    value={textFontFamily}
                    onChange={(event) =>
                      handleFontFamily(event.target.value)
                    }
                    title="Font family"
                    aria-label="Font family"
                  >
                    {FONT_FAMILIES.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </select>
                  <input
                    className={styles.fontSizeInput}
                    type="number"
                    min="8"
                    max="200"
                    value={textFontSize}
                    onChange={(event) =>
                      handleFontSize(Number(event.target.value))
                    }
                    title="Font size"
                    aria-label="Font size"
                  />
                  <button
                    type="button"
                    className={textBold ? styles.formatButtonActive : ''}
                    onClick={handleToggleBold}
                    title="Bold"
                    aria-pressed={textBold}
                  >
                    <FiBold aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={textItalic ? styles.formatButtonActive : ''}
                    onClick={handleToggleItalic}
                    title="Italic"
                    aria-pressed={textItalic}
                  >
                    <FiItalic aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={textUnderline ? styles.formatButtonActive : ''}
                    onClick={handleToggleUnderline}
                    title="Underline"
                    aria-pressed={textUnderline}
                  >
                    <FiUnderline aria-hidden="true" />
                  </button>
                  <span className={styles.selectionDivider} />
                  <button
                    type="button"
                    className={
                      textAlign === 'left' ? styles.formatButtonActive : ''
                    }
                    onClick={() => handleTextAlign('left')}
                    title="Align left"
                    aria-pressed={textAlign === 'left'}
                  >
                    <FiAlignLeft aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={
                      textAlign === 'center' ? styles.formatButtonActive : ''
                    }
                    onClick={() => handleTextAlign('center')}
                    title="Align center"
                    aria-pressed={textAlign === 'center'}
                  >
                    <FiAlignCenter aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={
                      textAlign === 'right' ? styles.formatButtonActive : ''
                    }
                    onClick={() => handleTextAlign('right')}
                    title="Align right"
                    aria-pressed={textAlign === 'right'}
                  >
                    <FiAlignRight aria-hidden="true" />
                  </button>
                  <span className={styles.selectionDivider} />
                </>
              )}
              <label className={styles.colorControl} title="Object color">
                <span>Color</span>
                <input
                  type="color"
                  value={fillColor}
                  onChange={(event) => handleApplyFill(event.target.value)}
                />
              </label>
              <span className={styles.selectionDivider} />
              <button
                type="button"
                onClick={handleBringForward}
                title="Bring forward"
              >
                <FiArrowUp aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={handleSendBackward}
                title="Send backward"
              >
                <FiArrowDown aria-hidden="true" />
              </button>
              <button type="button" onClick={handleDelete} title="Delete">
                <FiTrash2 aria-hidden="true" />
              </button>
            </div>
          )}

          <div className={styles.canvasViewport} ref={frameRef}>
            <div className={styles.pageWrap}>
              <span className={styles.pageLabel}>Page 1</span>
              <canvas ref={canvasElRef} />
            </div>
          </div>

          <div className={styles.stageFooter}>
            <span>
              <FiLayers aria-hidden="true" /> 1048 × 1048 px
            </span>
            <button type="button" onClick={handleClear}>
              Reset design
            </button>
          </div>
        </main>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleUploadImage(file);
          }
          event.target.value = '';
        }}
      />
    </div>
  );
}

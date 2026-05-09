import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { 
  Type, 
  Trash2, 
  Printer, 
  Download, 
  Layers, 
  ChevronRight, 
  ChevronLeft,
  Maximize2,
  Minimize2,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Settings2,
  Upload,
  Save,
  Check,
  QrCode,
  Palette,
  Image as ImageIcon,
  RefreshCw,
  Link as LinkIcon,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import localforage from 'localforage';
import { bagService } from '../services/bagService';

interface TagDesignerProps {
  onSave: (tagData: any) => void;
  initialData?: any;
}

const DEFAULT_TEMPLATES = [
  {
    id: 'floral-gold',
    name: 'Royal Floral Gold',
    front: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=800&auto=format&fit=crop',
    back: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?q=80&w=800&auto=format&fit=crop'
  }
];

type PrintLayout = '1' | '4' | '6' | '8';
type DuplexMode = 'long-edge' | 'short-edge';
type SheetSide = 'front' | 'back';

interface PrintLayoutSpec {
  count: number;
  cols: number;
  rows: number;
  tagW: number;
  tagH: number;
  spacingX: number;
  spacingY: number;
  isLandscape: boolean;
}

interface PagePlacement {
  x: number;
  y: number;
  sourceIndex: number;
}

const getPrintLayoutSpec = (layout: PrintLayout): PrintLayoutSpec => {
  if (layout === '1') {
    return { count: 1, cols: 1, rows: 1, tagW: 70, tagH: 100, spacingX: 0, spacingY: 0, isLandscape: false };
  }

  if (layout === '4') {
    return { count: 4, cols: 2, rows: 2, tagW: 70, tagH: 100, spacingX: 20, spacingY: 20, isLandscape: false };
  }

  if (layout === '6') {
    return { count: 6, cols: 2, rows: 3, tagW: 70, tagH: 100, spacingX: 10, spacingY: 10, isLandscape: false };
  }

  return { count: 8, cols: 4, rows: 2, tagW: 72, tagH: 103, spacingX: 1.5, spacingY: 2.5, isLandscape: true };
};

const getA4PageSize = (isLandscape: boolean) => ({
  width: isLandscape ? 297 : 210,
  height: isLandscape ? 210 : 297
});

const getPlacementStart = (spec: PrintLayoutSpec, pageWidth: number, pageHeight: number) => {
  const totalGridW = (spec.cols * spec.tagW) + ((spec.cols - 1) * spec.spacingX);
  const totalGridH = (spec.rows * spec.tagH) + ((spec.rows - 1) * spec.spacingY);

  return {
    startX: (pageWidth - totalGridW) / 2,
    startY: (pageHeight - totalGridH) / 2,
    totalGridW,
    totalGridH
  };
};

const getPagePlacement = (
  index: number,
  side: SheetSide,
  spec: PrintLayoutSpec,
  duplexMode: DuplexMode,
  pageWidth: number,
  pageHeight: number,
  backOffsetX: number,
  backOffsetY: number
): PagePlacement => {
  const col = index % spec.cols;
  const row = Math.floor(index / spec.cols);
  let printCol = col;
  let printRow = row;

  if (side === 'back') {
    if (duplexMode === 'long-edge') {
      printCol = spec.cols - 1 - col;
    } else {
      printRow = spec.rows - 1 - row;
    }
  }

  const { startX, startY } = getPlacementStart(spec, pageWidth, pageHeight);
  const offsetX = side === 'back' ? backOffsetX : 0;
  const offsetY = side === 'back' ? backOffsetY : 0;

  return {
    x: startX + printCol * (spec.tagW + spec.spacingX) + offsetX,
    y: startY + printRow * (spec.tagH + spec.spacingY) + offsetY,
    sourceIndex: index
  };
};

export default function TagDesigner({ onSave }: TagDesignerProps) {
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const [frontCanvas, setFrontCanvas] = useState<fabric.Canvas | null>(null);
  const [backCanvas, setBackCanvas] = useState<fabric.Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPrintDebug, setShowPrintDebug] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [previewImages, setPreviewImages] = useState<{ front: string, back: string }>({ front: '', back: '' });
  
  const [tagNumber, setTagNumber] = useState<number>(100);
  const [tagId, setTagId] = useState('100');
  
  // Persistent State Initialization
  const [activeTemplate, setActiveTemplate] = useState(() => {
    const saved = localStorage.getItem('kalyanam_active_template');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES[0];
  });

  const [backOffsetX, setBackOffsetX] = useState(() => {
    const saved = localStorage.getItem('kalyanam_back_offset_x');
    return saved ? parseFloat(saved) : 0;
  });

  const [backOffsetY, setBackOffsetY] = useState(() => {
    const saved = localStorage.getItem('kalyanam_back_offset_y');
    return saved ? parseFloat(saved) : 0;
  });

  const [printLayout, setPrintLayout] = useState<PrintLayout>(() => {
    return (localStorage.getItem('kalyanam_print_layout') as any) || '8';
  });

  const [duplexMode, setDuplexMode] = useState<DuplexMode>(() => {
    return (localStorage.getItem('kalyanam_duplex_mode') as any) || 'long-edge';
  });

  const [previewZoom, setPreviewZoom] = useState(() => {
    const saved = localStorage.getItem('kalyanam_preview_zoom');
    return saved ? parseFloat(saved) : 0.8;
  });

  const [customTemplates, setCustomTemplates] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState<{ front: boolean, back: boolean }>({ front: false, back: false });
  const [qrBaseUrl, setQrBaseUrl] = useState(window.location.origin + '/bags/');
  const isMounted = useRef(true);

  // Persistence Syncing
  useEffect(() => {
    localStorage.setItem('kalyanam_active_template', JSON.stringify(activeTemplate));
  }, [activeTemplate]);

  useEffect(() => {
    localStorage.setItem('kalyanam_back_offset_x', backOffsetX.toString());
  }, [backOffsetX]);

  useEffect(() => {
    localStorage.setItem('kalyanam_back_offset_y', backOffsetY.toString());
  }, [backOffsetY]);

  useEffect(() => {
    localStorage.setItem('kalyanam_print_layout', printLayout);
  }, [printLayout]);

  useEffect(() => {
    localStorage.setItem('kalyanam_duplex_mode', duplexMode);
  }, [duplexMode]);

  useEffect(() => {
    localStorage.setItem('kalyanam_preview_zoom', previewZoom.toString());
  }, [previewZoom]);

  // Canvas dimensions for the tag (scaled for screen, roughly 70x100mm ratio)
  const TAG_WIDTH = 350;
  const TAG_HEIGHT = 500;

  useEffect(() => {
    isMounted.current = true;
    const init = async () => {
      try {
        const nextNum = await bagService.getNextTagNumber();
        if (isMounted.current) {
          setTagNumber(nextNum);
          setTagId(nextNum.toString());
          loadTemplates();
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };
    init();
    return () => { isMounted.current = false; };
  }, []);

  const loadTemplates = async () => {
    const templates = await bagService.getTagTemplates();
    if (isMounted.current) {
      setCustomTemplates(templates);
      
      // Proactive background caching of high-quality images
      templates.forEach(async (tpl) => {
        try {
          const cacheKey = `tpl_img_${tpl.id}`;
          const cached = await localforage.getItem(cacheKey);
          if (!cached) {
            // Pre-warm cache for faster subsequent loads
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = tpl.front_url;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0);
              localforage.setItem(`${cacheKey}_front`, canvas.toDataURL('image/png', 0.9));
            };
          }
        } catch (e) {
          console.warn('Caching failed:', e);
        }
      });
    }
  };

  const isLoadingTemplate = useRef(false);

  // Keep QR code updated
  useEffect(() => {
    const updateQR = async (canvas: fabric.Canvas | null) => {
      if (!canvas) return;
      const qrObj = canvas.getObjects().find(obj => (obj as any).name === 'qr-code') as fabric.FabricImage;
      if (qrObj) {
        try {
          const url = qrBaseUrl + tagId;
          const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 512 });
          const img = await fabric.FabricImage.fromURL(qrDataUrl);
          qrObj.setElement(img.getElement());
          canvas.renderAll();
        } catch (err) {
          console.error('Failed to update QR:', err);
        }
      }
    };
    updateQR(frontCanvas);
    updateQR(backCanvas);
  }, [qrBaseUrl, tagId, frontCanvas, backCanvas]);

  // Initialize canvas
  useEffect(() => {
    if (!frontCanvasRef.current || !backCanvasRef.current) return;

    let active = true;

    const fCanvas = new fabric.Canvas(frontCanvasRef.current, {
      width: TAG_WIDTH,
      height: TAG_HEIGHT,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      enableRetinaScaling: true
    });

    const bCanvas = new fabric.Canvas(backCanvasRef.current, {
      width: TAG_WIDTH,
      height: TAG_HEIGHT,
      backgroundColor: 'transparent',
      preserveObjectStacking: true,
      enableRetinaScaling: true
    });

    const setupCanvas = async (canvas: fabric.Canvas, side: 'front' | 'back') => {
      if (!active) return;

      canvas.on('selection:created', (e) => setSelectedObject(e.selected?.[0] || null));
      canvas.on('selection:updated', (e) => setSelectedObject(e.selected?.[0] || null));
      canvas.on('selection:cleared', () => setSelectedObject(null));
      
      const saveState = () => {
        if (!active || !canvas.wrapperEl || isLoadingTemplate.current) return;
        try {
          const projectData = localStorage.getItem('kalyanam_tag_project');
          const currentProject = projectData ? JSON.parse(projectData) : {};
          currentProject[side] = canvas.toObject(['id', 'selectable', 'evented']);
          localStorage.setItem('kalyanam_tag_project', JSON.stringify(currentProject));
        } catch (e) {
          console.warn('Storage sync failed:', e);
        }
      };

      canvas.on('object:modified', saveState);
      canvas.on('object:added', saveState);
      canvas.on('object:removed', saveState);

      const imgUrl = side === 'front' ? activeTemplate.front : activeTemplate.back;
      try {
        const img = await fabric.FabricImage.fromURL(imgUrl, { 
          crossOrigin: 'anonymous'
        });
        
        if (!active || !canvas.wrapperEl) return;

        const scaleX = TAG_WIDTH / (img.width || 1);
        const scaleY = TAG_HEIGHT / (img.height || 1);
        const scale = Math.min(scaleX, scaleY);
        
        img.set({
          scaleX: scale,
          scaleY: scale,
          left: TAG_WIDTH / 2,
          top: TAG_HEIGHT / 2,
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false
        });
        
        canvas.backgroundImage = img;
        canvas.renderAll();
      } catch (err) {
        if (!active || !canvas.wrapperEl) return;
        console.error(`Error loading ${side} background:`, err);
        canvas.backgroundColor = '#ffffff';
        canvas.renderAll();
      }
    };

    setupCanvas(fCanvas, 'front');
    setupCanvas(bCanvas, 'back');

    setFrontCanvas(fCanvas);
    setBackCanvas(bCanvas);

    const restoreProject = async () => {
      if (!active) return;
      isLoadingTemplate.current = true;
      const savedProject = localStorage.getItem('kalyanam_tag_project');
      
      try {
        if (!savedProject) {
          if (active) {
            addQRToCanvas(fCanvas);
            fCanvas.add(new fabric.IText('Wedding Guest', {
              left: TAG_WIDTH / 2,
              top: 100,
              fontFamily: 'Playfair Display',
              fontSize: 28,
              fill: '#580000',
              originX: 'center',
              textAlign: 'center'
            }) as any);

            bCanvas.add(new fabric.IText(`TAG: ${tagId}`, {
              id: 'tag-id-label',
              left: TAG_WIDTH / 2,
              top: TAG_HEIGHT - 30,
              fontFamily: 'Courier New',
              fontSize: 24,
              fontWeight: 'bold',
              fill: '#000000',
              originX: 'center',
              originY: 'center',
              lockMovementX: false,
              lockMovementY: false,
              hasControls: true
            }) as any);
          }
        } else {
          const data = JSON.parse(savedProject);
          const load = (canvas: fabric.Canvas, json: any) => {
            return new Promise<void>((resolve) => {
              if (!active || !canvas.wrapperEl) return resolve();
              canvas.loadFromJSON(json).then(() => {
                if (active && canvas.wrapperEl) {
                  canvas.renderAll();
                  resolve();
                } else {
                  resolve();
                }
              }).catch(() => resolve());
            });
          };

          if (data.front) await load(fCanvas, data.front);
          if (data.back) await load(bCanvas, data.back);
        }
      } catch (e) {
        console.warn('Silent fallback for restoreProject:', e);
      } finally {
        if (active) {
          isLoadingTemplate.current = false;
        }
      }
    };

    restoreProject();

    return () => {
      active = false;
      fCanvas.dispose();
      bCanvas.dispose();
    };
  }, [activeTemplate]);



  const handleCustomUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Immediate local preview
    const localUrl = URL.createObjectURL(file);
    if (side === 'front') {
      setActiveTemplate(prev => ({ ...prev, id: 'custom', front: localUrl }));
    } else {
      setActiveTemplate(prev => ({ ...prev, id: 'custom', back: localUrl }));
    }

    setIsUploading(prev => ({ ...prev, [side]: true }));
    setErrorMessage(null);

    try {
      const url = await bagService.uploadBagImage(file);
      if (!url) {
        setIsUploading(prev => ({ ...prev, [side]: false }));
        return;
      }

      if (url.startsWith('blob:')) {
        setErrorMessage('Cloud storage is not configured or secured. Using local preview (will not persist outside this session).');
      }

      const finalUrl = url;
      if (side === 'front') {
        setActiveTemplate(prev => ({ ...prev, id: 'custom', front: finalUrl }));
      } else {
        setActiveTemplate(prev => ({ ...prev, id: 'custom', back: finalUrl }));
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      if (err.isRlsError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to upload image. Please check your connection or storage settings.');
      }
    } finally {
      setIsUploading(prev => ({ ...prev, [side]: false }));
    }
  };

  const handleSaveTemplate = async () => {
    if (!frontCanvas || !backCanvas) return;
    setIsSaving(true);
    try {
      const timestamp = new Date();
      const templateName = `Design ${timestamp.toLocaleDateString()} ${timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      // Generate High Quality Snapshots for the template preview
      // We want to save what the user SEE'S as the template image
      const frontSnapshot = frontCanvas.toDataURL({ format: 'png', multiplier: 2 });
      const backSnapshot = backCanvas.toDataURL({ format: 'png', multiplier: 2 });

      // 1. First save as a template (images)
      // We use the snapshots as the URLs for the template preview so it's "what you see is what you get"
      const template = await bagService.saveTagTemplate({
        name: templateName,
        front_url: frontSnapshot, // This might be large, but let's try
        back_url: backSnapshot
      });

      if (template) {
        // 2. Then save the specific layout (objects/configs)
        await bagService.saveTagLayout({
          template_id: template.id,
          name: templateName,
          front_config: frontCanvas.toObject(['id', '_element_type', 'selectable', 'evented']),
          back_config: backCanvas.toObject(['id', '_element_type', 'selectable', 'evented'])
        });

        // 3. Robust Cache storage for instant loading
        const cacheKey = `tpl_layout_${template.id}`;
        await localforage.setItem(cacheKey, {
          front: frontCanvas.toObject(['id', '_element_type', 'selectable', 'evented']),
          back: backCanvas.toObject(['id', '_element_type', 'selectable', 'evented'])
        });
        
        await localforage.setItem(`tpl_img_${template.id}_front`, frontSnapshot);
        await localforage.setItem(`tpl_img_${template.id}_back`, backSnapshot);

        setSaveSuccess(true);
        loadTemplates();
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err: any) {
      console.error('Failed to save template:', err);
      if (err.message.includes('Permission') || err.message.includes('RLS')) {
        setErrorMessage('PERMISSION DENIED: Supabase RLS is blocking the save. Please check your database policies.');
      } else {
        setErrorMessage('Failed to save design to cloud.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const loadSavedTemplate = async (tpl: any) => {
    isLoadingTemplate.current = true;
    try {
      // 1. Try to load from Local Cache First (Instant)
      const cacheKey = `tpl_layout_${tpl.id}`;
      let layoutData = await localforage.getItem<any>(cacheKey);
      
      // 2. Fallback to server layout data if cache missed
      if (!layoutData && tpl.layout) {
        layoutData = {
          front: tpl.layout.front_config,
          back: tpl.layout.back_config
        };
        // Populate cache for next time
        await localforage.setItem(cacheKey, layoutData);
      }

      if (layoutData) {
        localStorage.setItem('kalyanam_tag_project', JSON.stringify(layoutData));
      }

      // Check if we have cached high-res images
      const cachedFront = await localforage.getItem<string>(`tpl_img_${tpl.id}_front`);
      const cachedBack = await localforage.getItem<string>(`tpl_img_${tpl.id}_back`);

      // 3. Set the active template
      setActiveTemplate({ 
        id: tpl.id, 
        name: tpl.name, 
        front: cachedFront || tpl.front_url, 
        back: cachedBack || tpl.back_url 
      });
    } catch (e) {
      console.error('Failed to load saved template:', e);
      // Fallback
      setActiveTemplate({ id: tpl.id, name: tpl.name, front: tpl.front_url, back: tpl.back_url });
    } finally {
      isLoadingTemplate.current = false;
    }
  };

  const handleDeleteTemplate = async (e: React.MouseEvent, tpl: any) => {
    e.stopPropagation(); // Prevent triggering the select
    if (!window.confirm(`Are you sure you want to delete template "${tpl.name}"?`)) return;

    try {
      const success = await bagService.deleteTagTemplate(tpl.id);
      if (success) {
        setCustomTemplates(prev => prev.filter(t => t.id !== tpl.id));
        setSuccessMessage('Template deleted successfully!');
        if (activeTemplate.id === tpl.id) {
          // If deleted template was active, switch to default
          setActiveTemplate(DEFAULT_TEMPLATES[0]);
          loadSavedTemplate(DEFAULT_TEMPLATES[0]);
        }
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setErrorMessage('Failed to delete template.');
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error deleting template');
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  const addTagNumberToCanvas = (canvas: fabric.Canvas) => {
    const text = new fabric.IText(`TAG: ${tagId}`, {
      id: 'tag-id-label',
      left: TAG_WIDTH / 2,
      top: TAG_HEIGHT - 30,
      fontFamily: 'Courier New',
      fontSize: 24,
      fontWeight: 'bold',
      fill: '#000000',
      originX: 'center',
      originY: 'center',
      lockMovementX: false,
      lockMovementY: false,
      hasControls: true
    });
    canvas.add(text as any);
    canvas.setActiveObject(text as any);
    canvas.renderAll();
  };

  const addQRToCanvas = async (canvas: fabric.Canvas, forcedId?: string) => {
    try {
      const idToUse = forcedId || tagId;
      const url = qrBaseUrl + idToUse;
      const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 512 });
      const img = await fabric.FabricImage.fromURL(qrDataUrl);
      img.set({
        id: 'qr-code',
        _element_type: 'qr',
        left: TAG_WIDTH / 2,
        top: TAG_HEIGHT / 2 + 50,
        originX: 'center',
        originY: 'center',
        scaleX: 0.35,
        scaleY: 0.35
      });
      canvas.add(img as any);
      canvas.setActiveObject(img);
      canvas.renderAll();
    } catch (err) {
      console.error(err);
    }
  };

  const PrintSheetPreview = ({ side, layout, frontImg, backImg, overlay = false }: { side: 'front' | 'back' | 'overlay', layout: PrintLayout, frontImg: string, backImg: string, overlay?: boolean }) => {
    const spec = getPrintLayoutSpec(layout);
    const page = getA4PageSize(spec.isLandscape);
    const placements = Array.from({ length: spec.count }, (_, index) => ({
      front: getPagePlacement(index, 'front', spec, duplexMode, page.width, page.height, backOffsetX, backOffsetY),
      back: getPagePlacement(index, 'back', spec, duplexMode, page.width, page.height, backOffsetX, backOffsetY)
    }));

    const sheetClass = spec.isLandscape ? 'w-[620px] h-[440px]' : 'w-[420px] h-[594px]';
    const boxClass = layout === '1' ? 'text-[6px]' : layout === '8' ? 'text-[5px]' : 'text-[5px]';
    const toStyle = (placement: PagePlacement) => ({
      left: `${(placement.x / page.width) * 100}%`,
      top: `${(placement.y / page.height) * 100}%`,
      width: `${(spec.tagW / page.width) * 100}%`,
      height: `${(spec.tagH / page.height) * 100}%`
    });

    return (
      <div className="relative group cursor-pointer" onClick={() => setViewMode('editor')}>
        <div className={`bg-white shadow-2xl overflow-hidden relative border border-gray-200 transition-all ${sheetClass}`}>
           {/* A4 Info overlay */}
           <div className="absolute top-2 left-4 z-20">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">
                {side === 'overlay' ? 'ALIGNMENT OVERLAY (hold to light)' : `${side.toUpperCase()} SHEET`} - A4 {spec.isLandscape ? 'LANDSCAPE' : 'PORTRAIT'}
              </span>
           </div>

           <div className="absolute inset-0">
              {placements.map(({ front, back }, index) => {
                const placement = side === 'back' ? back : front;

                return (
                  <React.Fragment key={index}>
                    {overlay ? (
                      <>
                        <div className="absolute shadow-sm border border-gray-200 overflow-hidden bg-gray-50" style={toStyle(front)}>
                          <img src={frontImg} className="absolute inset-0 w-full h-full object-contain" alt="front tag" />
                        </div>
                        <div className="absolute shadow-sm border border-transparent overflow-hidden pointer-events-none" style={toStyle(back)}>
                          <img
                            src={backImg}
                            className="absolute inset-0 w-full h-full object-contain opacity-50 mix-blend-multiply"
                            alt="back tag overlay"
                          />
                        </div>
                      </>
                    ) : (
                      <div className={`absolute shadow-sm border ${showPrintDebug ? 'border-red-400/50' : 'border-gray-100'} overflow-hidden bg-gray-50`} style={toStyle(placement)}>
                        <img
                          src={side === 'front' ? frontImg : backImg}
                          className="absolute inset-0 w-full h-full object-contain"
                          alt="tag preview"
                        />
                        <div className="absolute bottom-0.5 right-1">
                          <span className={`${boxClass} text-gray-400 font-mono`}>
                            #{tagNumber + placement.sourceIndex}
                          </span>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
           </div>

           {overlay && (
             <div className="absolute inset-0 pointer-events-none">
               <div className="w-full h-[1px] bg-red-400/40 absolute top-1/2"></div>
               <div className="h-full w-[1px] bg-red-400/40 absolute left-1/2"></div>
             </div>
           )}

           {/* Precision Cut Guides */}
           <div className="absolute inset-2 border border-dashed border-gray-100 pointer-events-none opacity-50"></div>
        </div>
        <div className="mt-4 flex justify-center">
           <span className="px-4 py-1.5 bg-maroon-dark text-white rounded-full text-[9px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Click to Edit Template</span>
        </div>
      </div>
    );
  };

  const addText = () => {
    const canvas = activeSide === 'front' ? frontCanvas : backCanvas;
    if (!canvas) return;
    const text = new fabric.IText('Your Text Here', {
      left: TAG_WIDTH / 2,
      top: TAG_HEIGHT / 2 - 100,
      fontFamily: 'Playfair Display',
      fontSize: 20,
      fill: '#580000',
      originX: 'center'
    });
    canvas.add(text as any);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const deleteSelected = () => {
    const canvas = activeSide === 'front' ? frontCanvas : backCanvas;
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    setSelectedObject(null);
    canvas.renderAll();
  };

  const updateTextProp = (prop: string, value: any) => {
    if (!selectedObject || !(selectedObject instanceof fabric.IText)) return;
    selectedObject.set(prop as any, value);
    activeSide === 'front' ? frontCanvas?.renderAll() : backCanvas?.renderAll();
  };

  const regeneratePreview = () => {
    if (!frontCanvas || !backCanvas) return;
    setPreviewImages({
      front: frontCanvas.toDataURL({ format: 'png', multiplier: 2 }),
      back: backCanvas.toDataURL({ format: 'png', multiplier: 2 })
    });
    setViewMode('preview');
  };

  const handlePrintA4 = async (layout: PrintLayout) => {
    setIsGeneratingPdf(true);
    try {
      const spec = getPrintLayoutSpec(layout);
      const page = getA4PageSize(spec.isLandscape);
      const pdf = new jsPDF(spec.isLandscape ? 'l' : 'p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      if (!frontCanvas || !backCanvas) return;

      const count = spec.count;

      const getSnapshot = async (canvas: fabric.Canvas, side: 'front' | 'back', index: number) => {
        const currentId = (tagNumber + index).toString();
        
        // Find and update QR/TagText
        const objects = canvas.getObjects();
        
        const qrObj = objects.find(o => 
          (o as any).id === 'qr-code' || 
          ((o as any)._element_type === 'qr') ||
          (o.type === 'image' && (o as any).src?.includes('data:image/png'))
        ) as fabric.FabricImage;

        // Find ALL text objects that contain [TAG_NUMBER] or have tag-id-label
        const dynamicTexts = objects.filter(o => 
           o.type === 'i-text' || o.type === 'text' || o.type === 'textbox'
        ) as fabric.IText[];

        // Save original texts to restore later
        const originalTexts = new Map<fabric.IText, string>();
        
        dynamicTexts.forEach(textObj => {
          const textContent = (textObj as any).text || '';
          let updated = false;
          let newText = textContent;

          if ((textObj as any).id === 'tag-id-label' || textContent === tagId || textContent.includes('TAG:')) {
             originalTexts.set(textObj, textContent);
             if (textContent.includes(tagId)) {
                newText = textContent.replace(tagId, currentId);
             } else if (textContent.includes('TAG:')) {
                newText = `TAG: ${currentId}`;
             } else {
                newText = currentId;
             }
             updated = true;
          }
          if (textContent.includes('[TAG_NUMBER]')) {
             originalTexts.set(textObj, textContent);
             newText = textContent.replace(/\[TAG_NUMBER\]/g, currentId);
             updated = true;
          }

          if (updated) {
             textObj.set('text', newText);
          }
        });

        // Update QR
        if (qrObj) {
          const url = qrBaseUrl + currentId;
          const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 512 });
          const img = await fabric.FabricImage.fromURL(qrDataUrl);
          qrObj.setElement(img.getElement());
          (qrObj as any)._element_type = 'qr';
        }

        canvas.renderAll();
        const data = canvas.toDataURL({ format: 'png', multiplier: 3 });

        // Restore original state
        originalTexts.forEach((origText, textObj) => {
          textObj.set('text', origText);
        });
        
        if (qrObj) {
          const url = qrBaseUrl + tagId;
          const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 512 });
          const img = await fabric.FabricImage.fromURL(qrDataUrl);
          qrObj.setElement(img.getElement());
        }

        canvas.renderAll();
        return data;
      };

      const drawPage = async (side: 'front' | 'back') => {
        const canvas = side === 'front' ? frontCanvas : backCanvas;
        pdf.setFontSize(7);
        pdf.setTextColor(180);
        pdf.text(`${side.toUpperCase()} Side - A4 ${spec.isLandscape ? 'Landscape' : 'Portrait'} Layout - Flip: ${duplexMode}`, 5, 5);

        const { startX, startY, totalGridW, totalGridH } = getPlacementStart(spec, pdfWidth, pdfHeight);

        // Draw print safe bounds/crop marks if debug is enabled
        if (showPrintDebug) {
           pdf.setDrawColor(255, 0, 0);
           pdf.setLineWidth(0.1);
           pdf.rect(startX, startY, totalGridW, totalGridH);
           
           // Center crosshairs
           pdf.line(pdfWidth/2, startY - 5, pdfWidth/2, startY + totalGridH + 5);
           pdf.line(startX - 5, pdfHeight/2, startX + totalGridW + 5, pdfHeight/2);
        }

        for(let i=0; i<count; i++) {
          const placement = getPagePlacement(i, side, spec, duplexMode, page.width, page.height, backOffsetX, backOffsetY);
          const imgData = await getSnapshot(canvas!, side, i);
          pdf.addImage(imgData, 'PNG', placement.x, placement.y, spec.tagW, spec.tagH);
          
          // Cutting guides
          pdf.setDrawColor(200);
          pdf.setLineWidth(0.05);
          pdf.line(placement.x - 2, placement.y, placement.x + spec.tagW + 2, placement.y); 
          pdf.line(placement.x - 2, placement.y + spec.tagH, placement.x + spec.tagW + 2, placement.y + spec.tagH); 
          pdf.line(placement.x, placement.y - 2, placement.x, placement.y + spec.tagH + 2); 
          pdf.line(placement.x + spec.tagW, placement.y - 2, placement.x + spec.tagW, placement.y + spec.tagH + 2); 
          
          if (showPrintDebug) {
             pdf.setDrawColor(0, 0, 255);
             pdf.rect(placement.x + 2, placement.y + 2, spec.tagW - 4, spec.tagH - 4);
          }
        }
      };

      await drawPage('front');
      if (layout !== '1') {
        pdf.addPage();
        await drawPage('back');
      }
      
      pdf.save(`Wedding_Tags_${layout}_up_${tagId}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setErrorMessage('Failed to generate PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex bg-slate-50 h-full font-sans overflow-hidden border-l border-gray-100">
      <AnimatePresence>
        {errorMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-red-500 text-white rounded-full shadow-2xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest"
          >
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="hover:scale-110 transition-transform"><Trash2 size={14} className="rotate-45" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Templates Panel */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col shadow-2xl z-10 shrink-0">
        <div className="p-4 border-b border-gray-50 bg-maroon-dark text-white">
          <div className="flex items-center gap-3 mb-1">
             <Palette className="text-gold-metallic" size={18} />
             <h3 className="font-display text-lg">Tag Studio Pro</h3>
          </div>
          <p className="text-[8px] uppercase tracking-[0.2em] text-ivory/50 font-bold">Print & Production Ready</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Mode Switcher */}
          <div className="bg-gray-100 p-1 rounded-xl flex">
             <button 
              onClick={() => setViewMode('editor')}
              className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${viewMode === 'editor' ? 'bg-white shadow-sm text-maroon-dark' : 'text-gray-400'}`}
             >Design</button>
             <button 
              onClick={regeneratePreview}
              className={`flex-1 py-2 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all ${viewMode === 'preview' ? 'bg-white shadow-sm text-maroon-dark' : 'text-gray-400'}`}
             >Live Print Preview</button>
          </div>

          {viewMode === 'editor' ? (
            <>
              {/* Custom Uploads */}
              <section className="space-y-3">
                 <div className="flex items-center gap-2 mb-1">
                    <Upload size={12} className="text-maroon-deep" />
                    <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Custom PNG Template</label>
                 </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative group">
                       <input type="file" accept="image/png,image/jpeg" onChange={(e) => handleCustomUpload(e, 'front')} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isUploading.front} />
                       <div className={`bg-gray-50 border-2 border-dashed rounded-lg p-2 text-center transition-colors ${isUploading.front ? 'border-maroon-dark animate-pulse' : 'border-gray-200 group-hover:border-gold-metallic'}`}>
                          {isUploading.front ? (
                            <RefreshCw className="mx-auto text-maroon-dark animate-spin mb-1" size={16} />
                          ) : (
                            <ImageIcon className="mx-auto text-gray-300 mb-1" size={16} />
                          )}
                          <span className={`text-[7px] font-bold uppercase block ${isUploading.front ? 'text-maroon-dark' : 'text-gray-400'}`}>
                            {isUploading.front ? 'Uploading...' : 'Front PNG'}
                          </span>
                       </div>
                    </div>
                    <div className="relative group">
                       <input type="file" accept="image/png,image/jpeg" onChange={(e) => handleCustomUpload(e, 'back')} className="absolute inset-0 opacity-0 cursor-pointer z-10" disabled={isUploading.back} />
                       <div className={`bg-gray-50 border-2 border-dashed rounded-lg p-2 text-center transition-colors ${isUploading.back ? 'border-maroon-dark animate-pulse' : 'border-gray-200 group-hover:border-gold-metallic'}`}>
                          {isUploading.back ? (
                            <RefreshCw className="mx-auto text-maroon-dark animate-spin mb-1" size={16} />
                          ) : (
                            <ImageIcon className="mx-auto text-gray-300 mb-1" size={16} />
                          )}
                          <span className={`text-[7px] font-bold uppercase block ${isUploading.back ? 'text-maroon-dark' : 'text-gray-400'}`}>
                            {isUploading.back ? 'Uploading...' : 'Back PNG'}
                          </span>
                       </div>
                    </div>
                 </div>
              </section>

              {/* Saved Templates */}
              {customTemplates.length > 0 && (
                <section className="space-y-3">
                   <div className="flex items-center gap-2 mb-1">
                      <Save size={12} className="text-maroon-deep" />
                      <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Saved Design Studio</label>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      {customTemplates.map((tpl) => (
                        <button 
                          key={tpl.id}
                          onClick={() => loadSavedTemplate(tpl)}
                          className={`group relative aspect-[7/10] overflow-hidden rounded-lg border-2 transition-all ${activeTemplate.id === tpl.id ? 'border-maroon-dark shadow-md' : 'border-gray-100 hover:border-gold-metallic grayscale-[40%] hover:grayscale-0'}`}
                        >
                           <img src={tpl.front_url} className="w-full h-full object-cover" alt={tpl.name} />
                           <div className="absolute inset-x-0 bottom-0 bg-maroon-dark/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-[6px] font-bold text-white uppercase truncate block text-center">{tpl.name}</span>
                           </div>
                           {activeTemplate.id === tpl.id && (
                             <div className="absolute top-1 right-1 bg-maroon-dark text-white rounded-full p-0.5">
                                <Check size={8} />
                             </div>
                           )}
                           <button 
                             onClick={(e) => handleDeleteTemplate(e, tpl)}
                             className="absolute top-1 left-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                             title="Delete Template"
                           >
                              <Trash2 size={10} />
                           </button>
                        </button>
                      ))}
                   </div>
                </section>
              )}

              {/* Design Controls */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Type size={14} className="text-maroon-deep" />
                  <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Overlay Tools</label>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                   <div className="flex items-center gap-2">
                      <QrCode size={12} className="text-gold-metallic" />
                      <span className="text-[8px] font-bold uppercase text-gray-500">Starting Tag #</span>
                   </div>
                   <input 
                    type="number" 
                    value={tagNumber}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setTagNumber(val);
                      setTagId(val.toString());
                    }}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[10px] font-mono focus:ring-1 focus:ring-gold-metallic outline-none"
                   />
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                   <div className="flex items-center gap-2">
                      <LinkIcon size={12} className="text-gold-metallic" />
                      <span className="text-[8px] font-bold uppercase text-gray-500">QR Redirect URL</span>
                   </div>
                   <input 
                    type="text" 
                    value={qrBaseUrl}
                    onChange={(e) => setQrBaseUrl(e.target.value)}
                    placeholder="https://yoursite.com/bags/"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 text-[10px] font-mono focus:ring-1 focus:ring-gold-metallic outline-none"
                   />
                   <p className="text-[7px] text-gray-400 font-medium text-center">Tag ID will be appended to this URL</p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                   <ToolButton icon={<QrCode size={18} />} label="Add QR Link" onClick={() => (activeSide === 'front' ? addQRToCanvas(frontCanvas!) : addQRToCanvas(backCanvas!))} />
                   <ToolButton icon={<Hash size={18} />} label="Add Tag Number" onClick={() => (activeSide === 'front' ? addTagNumberToCanvas(frontCanvas!) : addTagNumberToCanvas(backCanvas!))} />
                   <ToolButton icon={<Type size={18} />} label="Add Text Layer" onClick={addText} />
                </div>
              </section>

              {/* Element properties */}
              {selectedObject && (
                <motion.section 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100 shadow-inner"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                       <Settings2 size={12} className="text-maroon-deep" />
                       <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Layer Properties</label>
                    </div>
                    <button onClick={deleteSelected} className="text-red-400 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                  
                  {selectedObject instanceof fabric.IText && (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                          <button onClick={() => updateTextProp('fontWeight', selectedObject.fontWeight === 'bold' ? 'normal' : 'bold')} className={`p-2 rounded-lg ${selectedObject.fontWeight === 'bold' ? 'bg-maroon-dark text-white' : 'hover:bg-white'}`}><Bold size={14} /></button>
                          <button onClick={() => updateTextProp('fontStyle', selectedObject.fontStyle === 'italic' ? 'normal' : 'italic')} className={`p-2 rounded-lg ${selectedObject.fontStyle === 'italic' ? 'bg-maroon-dark text-white' : 'hover:bg-white'}`}><Italic size={14} /></button>
                          <button onClick={() => updateTextProp('textAlign', 'center')} className="p-2 hover:bg-white rounded-lg"><AlignCenter size={14} /></button>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-bold uppercase text-gray-400">Palette</label>
                          <div className="flex flex-wrap gap-2">
                             {['#580000', '#D4AF37', '#333333', '#ffffff', '#710D0D', '#000000'].map(c => (
                               <button 
                                key={c} 
                                onClick={() => updateTextProp('fill', c)}
                                style={{ backgroundColor: c }}
                                className={`w-5 h-5 rounded-full border border-gray-200 transition-all ${selectedObject.fill === c ? 'scale-125 ring-2 ring-gold-metallic/30' : 'hover:scale-110'}`}
                               />
                             ))}
                          </div>
                       </div>
                    </div>
                  )}
                </motion.section>
              )}
            </>
          ) : (
            <section className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Sheet Layout</label>
                  <div className="grid grid-cols-4 gap-2">
                     {['1', '4', '6', '8'].map(l => (
                       <button 
                        key={l}
                        onClick={() => setPrintLayout(l as PrintLayout)}
                        className={`py-2 rounded border text-[10px] font-bold ${printLayout === l ? 'bg-maroon-dark text-white border-maroon-dark' : 'bg-white text-gray-400 border-gray-100'}`}
                       >{l} Up</button>
                     ))}
                  </div>
               </div>
               
               <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                  <div className="flex items-center justify-between text-blue-800">
                     <div className="flex items-center gap-2">
                        <Layers size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Duplex Flip Mode</span>
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     <button 
                       onClick={() => setDuplexMode('long-edge')}
                       className={`py-2 rounded-lg text-[9px] font-bold border transition-all ${duplexMode === 'long-edge' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'}`}
                     >
                       Long Edge Flip (Standard)
                     </button>
                     <button 
                       onClick={() => setDuplexMode('short-edge')}
                       className={`py-2 rounded-lg text-[9px] font-bold border transition-all ${duplexMode === 'short-edge' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400'}`}
                     >
                       Short Edge Flip
                     </button>
                  </div>
                  <p className="text-[8px] text-blue-500/80 leading-relaxed font-medium mt-1">
                     {duplexMode === 'long-edge' ? 'Mirrors columns on the back page.' : 'Mirrors rows on the back page.'}
                  </p>
               </div>

               <div className="bg-orange-50 p-3 rounded-xl border border-orange-100 space-y-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <Settings2 size={12} className="text-orange-500" />
                        <span className="text-[8px] font-bold uppercase text-orange-700">Back-Side Offset Correction</span>
                     </div>
                     {(backOffsetX !== 0 || backOffsetY !== 0) && (
                       <button onClick={() => { setBackOffsetX(0); setBackOffsetY(0); }} className="text-[7px] text-gray-400 hover:text-red-500 font-bold uppercase border border-gray-200 rounded px-1 transition-colors">
                         Reset
                       </button>
                     )}
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase text-orange-700">Horizontal</span>
                        <span className={`text-[9px] font-mono font-bold ${backOffsetX === 0 ? 'text-gray-400' : backOffsetX > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                          {backOffsetX > 0 ? '+' : ''}{backOffsetX.toFixed(1)} mm
                        </span>
                     </div>
                     <input
                       type="range"
                       min="-5"
                       max="5"
                       step="0.1"
                       value={backOffsetX}
                       onChange={(e) => setBackOffsetX(parseFloat(e.target.value))}
                       className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-orange-500"
                     />
                     <div className="flex justify-between text-[6px] text-gray-400 font-mono">
                       <span>-5mm (left)</span>
                       <span>0</span>
                       <span>+5mm (right)</span>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase text-orange-700">Vertical</span>
                        <span className={`text-[9px] font-mono font-bold ${backOffsetY === 0 ? 'text-gray-400' : backOffsetY > 0 ? 'text-orange-600' : 'text-blue-600'}`}>
                          {backOffsetY > 0 ? '+' : ''}{backOffsetY.toFixed(1)} mm
                        </span>
                     </div>
                     <input
                       type="range"
                       min="-5"
                       max="5"
                       step="0.1"
                       value={backOffsetY}
                       onChange={(e) => setBackOffsetY(parseFloat(e.target.value))}
                       className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-orange-500"
                     />
                     <div className="flex justify-between text-[6px] text-gray-400 font-mono">
                       <span>-5mm (up)</span>
                       <span>0</span>
                       <span>+5mm (down)</span>
                     </div>
                  </div>
                  <p className="text-[7px] text-orange-500/80 font-medium">These corrections shift the back sheet only, and the preview overlay now matches the exported PDF.</p>
               </div>
               
               <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2">
                     <Settings2 size={12} className={showPrintDebug ? 'text-red-500' : 'text-gray-400'} />
                     <span className="text-[9px] font-bold uppercase tracking-widest text-gray-600">Alignment Guides</span>
                  </div>
                  <button 
                    onClick={() => setShowPrintDebug(!showPrintDebug)}
                    className={`relative w-8 h-4 rounded-full transition-colors ${showPrintDebug ? 'bg-green-500' : 'bg-gray-300'}`}
                  >
                     <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${showPrintDebug ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </button>
               </div>
            </section>
          )}
        </div>

        <div className="p-4 border-t border-gray-50 space-y-2">
           <button 
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className={`w-full py-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 transition-all shadow-sm ${saveSuccess ? 'bg-green-500 text-white' : 'bg-gold-metallic text-white hover:bg-gold-deep'}`}
           >
              {isSaving ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : saveSuccess ? (
                <Check size={16} />
              ) : (
                <Save size={16} />
              )}
              {saveSuccess ? 'Design Saved!' : 'Save as New Template'}
           </button>

           <button 
            onClick={() => handlePrintA4(printLayout)}
            disabled={isGeneratingPdf}
            className="w-full bg-maroon-dark text-white py-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 hover:bg-maroon-deep transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
           >
              {isGeneratingPdf ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Download size={16} />
              )}
              {isGeneratingPdf ? 'Generating PDF...' : 'Export High-Res PDF'}
           </button>
        </div>
      </div>

      {/* Main Area */}

      <div className="flex-1 flex flex-col items-center overflow-auto bg-gray-50/50">
         {viewMode === 'editor' ? (
           <>
              <div className="w-full px-6 py-2 flex items-center justify-between border-b border-gray-100 bg-white shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-maroon-dark/5 rounded-md border border-maroon-dark/10">
                       <span className="text-[10px] font-bold text-maroon-dark uppercase tracking-tight">Active Side: {activeSide.toUpperCase()}</span>
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium">Click a card below to target design tools</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                      <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Tag ID Sequence</p>
                      <p className="text-[10px] font-mono text-gray-500 font-bold">{tagId}</p>
                    </div>
                    <div className="w-[1px] h-6 bg-gray-200"></div>
                    <button onClick={regeneratePreview} className="flex items-center gap-2 px-3 py-1.5 bg-gold-metallic text-white rounded-lg text-[9px] font-bold uppercase transition-transform hover:scale-105">
                       <Maximize2 size={12} />
                       Preview Sheet
                    </button>
                  </div>
              </div>

              <div className="flex-1 flex flex-col xl:flex-row items-center justify-center w-full p-8 gap-12 min-h-0 overflow-auto">
                  {/* Front Side */}
                  <div className="group relative flex flex-col items-center gap-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Front Face</h4>
                    <div 
                      onClick={() => setActiveSide('front')}
                      className={`relative bg-white transition-all cursor-pointer ${activeSide === 'front' ? 'shadow-[0_0_50px_rgba(88,0,0,0.15)] ring-4 ring-maroon-dark/10' : 'shadow-xl grayscale-[20%] opacity-60 hover:opacity-100 hover:grayscale-0'}`}
                      style={{ width: TAG_WIDTH, height: TAG_HEIGHT }}
                    >
                      <canvas ref={frontCanvasRef} />
                      <div className="absolute inset-4 border border-dashed border-maroon-dark/5 pointer-events-none z-30"></div>
                      
                      {isUploading.front && (
                        <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                           <RefreshCw className="text-maroon-dark animate-spin" size={32} />
                           <span className="text-[10px] font-bold text-maroon-dark uppercase tracking-widest">Optimizing Design...</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Back Side */}
                  <div className="group relative flex flex-col items-center gap-4">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Back Face</h4>
                    <div 
                      onClick={() => setActiveSide('back')}
                      className={`relative bg-white transition-all cursor-pointer ${activeSide === 'back' ? 'shadow-[0_0_50px_rgba(88,0,0,0.15)] ring-4 ring-maroon-dark/10' : 'shadow-xl grayscale-[20%] opacity-60 hover:opacity-100 hover:grayscale-0'}`}
                      style={{ width: TAG_WIDTH, height: TAG_HEIGHT }}
                    >
                      <canvas ref={backCanvasRef} />
                      <div className="absolute inset-4 border border-dashed border-maroon-dark/5 pointer-events-none z-30"></div>
                      
                      {isUploading.back && (
                        <div className="absolute inset-0 z-40 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2">
                           <RefreshCw className="text-maroon-dark animate-spin" size={32} />
                           <span className="text-[10px] font-bold text-maroon-dark uppercase tracking-widest">Optimizing Design...</span>
                        </div>
                      )}
                    </div>
                  </div>
              </div>
           </>
         ) : (
           <div className="flex-1 w-full flex flex-col items-center p-8 space-y-12 overflow-auto">
              <div className="w-full max-w-7xl bg-white border border-gray-100 rounded-3xl shadow-sm p-4 md:p-6 space-y-5">
                 <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                       <h3 className="font-display text-xl text-maroon-dark">Preview Zoom</h3>
                       <p className="text-xs text-gray-500">Inspect the print sheet closely before exporting the PDF.</p>
                    </div>
                    <div className="flex flex-col gap-3 md:min-w-[320px]">
                       <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => setPreviewZoom(prev => Math.max(0.5, Number((prev - 0.1).toFixed(1))))}
                            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:border-maroon-dark/30"
                          >
                            -
                          </button>
                          <button
                            onClick={() => setPreviewZoom(1)}
                            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:border-maroon-dark/30"
                          >
                            Reset
                          </button>
                          <button
                            onClick={() => setPreviewZoom(prev => Math.min(2.5, Number((prev + 0.1).toFixed(1))))}
                            className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-600 text-[10px] font-bold uppercase tracking-widest hover:border-maroon-dark/30"
                          >
                            +
                          </button>
                          <div className="min-w-[72px] text-right text-[10px] font-mono font-bold text-maroon-dark">
                            {(previewZoom * 100).toFixed(0)}%
                          </div>
                       </div>
                       <input
                         type="range"
                         min="0.5"
                         max="2.5"
                         step="0.1"
                         value={previewZoom}
                         onChange={(e) => setPreviewZoom(parseFloat(e.target.value))}
                         className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-maroon-dark"
                       />
                    </div>
                 </div>

                 <div
                   className="overflow-auto rounded-2xl bg-gray-50/80 border border-gray-100 p-6 md:p-8"
                 >
                   <div
                     className="flex flex-col xl:flex-row flex-wrap justify-center gap-12 items-start origin-top transition-transform duration-200"
                     style={{ transform: `scale(${previewZoom})`, width: 'max-content', margin: '0 auto' }}
                   >
                     <div className="space-y-4 text-center">
                    <PrintSheetPreview side="front" layout={printLayout} frontImg={previewImages.front} backImg={previewImages.back} />
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Front Page Placement</h4>
                     </div>
                     <div className="space-y-4 text-center">
                    <PrintSheetPreview side="back" layout={printLayout} frontImg={previewImages.front} backImg={previewImages.back} />
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Back Page Placement</h4>
                     </div>
                     <div className="space-y-4 text-center">
                    <PrintSheetPreview side="overlay" layout={printLayout} frontImg={previewImages.front} backImg={previewImages.back} overlay={true} />
                    <h4 className="text-[10px] font-bold text-maroon-dark uppercase tracking-[0.3em]">Alignment Overlay</h4>
                    <p className="text-[8px] text-gray-400 max-w-[300px] mx-auto">Verify that front and back tags perfectly overlap in this view. The back side is shown at 50% opacity.</p>
                     </div>
                   </div>
                 </div>
              </div>
              
              <div className="max-w-2xl bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                 <div className="flex items-center gap-4 text-maroon-dark">
                    <Check className="bg-maroon-dark text-white rounded-full p-1" size={24} />
                    <div>
                       <h3 className="font-display text-xl">Print-Ready Verification</h3>
                       <p className="text-gray-500 text-xs">A4 Sheets aligned for {printLayout}-up duplex output.</p>
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-6 pt-4 border-t border-gray-50">
                    <div>
                       <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Margins</p>
                       <p className="text-[10px] font-bold">Center-Aligned</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">DPI Scale</p>
                       <p className="text-[10px] font-bold">300 DPI (High-Res)</p>
                    </div>
                    <div>
                       <p className="text-[8px] font-bold text-gray-400 uppercase mb-1">Duplex</p>
                       <p className="text-[10px] font-bold">Symmetric Flip</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => setViewMode('editor')}
                  className="w-full py-3 bg-gray-50 text-gray-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-all"
                 >Return to Editor</button>
              </div>
           </div>
         )}
      </div>

    </div>
  );
}

// Tools and Utilities
function ToolButton({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl hover:border-gold-metallic hover:bg-gold-metallic/5 transition-all text-left group shadow-sm hover:shadow-md"
    >
      <div className="text-maroon-deep group-hover:scale-110 transition-transform bg-gray-50 p-2 rounded-lg group-hover:bg-white">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{label}</span>
    </button>
  );
}

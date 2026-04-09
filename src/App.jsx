import React, { useState, useEffect, useRef } from 'react';
import Konva from 'konva';
import { v4 as uuidv4 } from 'uuid';
import TopToolbar from './components/toolbar/TopToolbar';
import LeftSidebar from './components/sidebar/LeftSidebar';
import RightPanel from './components/panel/RightPanel';
import EditorCanvas from './components/canvas/EditorCanvas';

const API_URL = 'http://localhost:5000';
const LOCAL_DRAFT_KEY = 'webnexEditor:draft';

export const TEMPLATE_SIZES = {
  instagramPost: { id: 'instagramPost', name: 'Instagram Post (500x624)', width: 500, height: 624 },
  instagramStory: { id: 'instagramStory', name: 'Instagram Story (322x572)', width: 322, height: 572 },
  facebookCover: { id: 'facebookCover', name: 'Facebook Cover (851x315)', width: 851, height: 315 },
  facebookPost: { id: 'facebookPost', name: 'Facebook Post (760x400)', width: 760, height: 400 },
  facebookPostLandscape: { id: 'facebookPostLandscape', name: 'Facebook Post Landscape (1200x630)', width: 1200, height: 630 },
  facebookStory: { id: 'facebookStory', name: 'Facebook Story (322x572)', width: 322, height: 572 },
  xCover: { id: 'xCover', name: 'X Cover (900x300)', width: 900, height: 300 },
  youtubeThumbnail: { id: 'youtubeThumbnail', name: 'YouTube Thumbnail (700x400)', width: 700, height: 400 },
  youtubeShorts: { id: 'youtubeShorts', name: 'YouTube Shorts (322x572)', width: 322, height: 572 },
  youtubeIntro: { id: 'youtubeIntro', name: 'YouTube Intro (1080x1080)', width: 1080, height: 1080 },
  linkedinBanner: { id: 'linkedinBanner', name: 'LinkedIn Banner (1584x396)', width: 1584, height: 396 },
  pinterestPin: { id: 'pinterestPin', name: 'Pinterest Pin (416x624)', width: 416, height: 624 },
  tiktokVideo: { id: 'tiktokVideo', name: 'TikTok Video (322x572)', width: 322, height: 572 },
  logo: { id: 'logo', name: 'Logo (500x500)', width: 500, height: 500 },
  custom: { id: 'custom', name: 'Custom Screen (800x800)', width: 800, height: 800 },
};

const createGraphicElements = (variant, templateSize) => {
  const centerX = templateSize.width / 2;
  const centerY = templateSize.height / 2;

  if (variant === 'sparkleBurst') {
    return [
      {
        type: 'star',
        x: centerX - 80,
        y: centerY - 80,
        width: 160,
        height: 160,
        fill: '#fbbf24',
        opacity: 1,
        shadowBlur: 18,
        shadowOpacity: 0.28,
      },
      {
        type: 'star',
        x: centerX + 90,
        y: centerY - 110,
        width: 70,
        height: 70,
        fill: '#f59e0b',
        opacity: 0.95,
        shadowBlur: 10,
        shadowOpacity: 0.2,
      },
      {
        type: 'star',
        x: centerX + 120,
        y: centerY + 50,
        width: 48,
        height: 48,
        fill: '#fde68a',
        opacity: 0.95,
      },
    ];
  }

  if (variant === 'blobMix') {
    return [
      {
        type: 'ellipse',
        x: centerX - 170,
        y: centerY - 95,
        width: 250,
        height: 170,
        fill: '#fb7185',
        opacity: 0.92,
        rotation: -18,
        shadowBlur: 18,
        shadowOpacity: 0.22,
      },
      {
        type: 'ellipse',
        x: centerX - 20,
        y: centerY - 70,
        width: 280,
        height: 180,
        fill: '#22c55e',
        opacity: 0.82,
        rotation: 16,
        shadowBlur: 18,
        shadowOpacity: 0.18,
      },
      {
        type: 'circle',
        x: centerX + 140,
        y: centerY + 85,
        width: 150,
        height: 150,
        fill: '#38bdf8',
        opacity: 0.88,
        shadowBlur: 18,
        shadowOpacity: 0.2,
      },
    ];
  }

  if (variant === 'accentLines') {
    return [
      {
        type: 'line',
        x: centerX - 210,
        y: centerY - 40,
        width: 420,
        height: 18,
        fill: '#0f172a',
        opacity: 0.95,
      },
      {
        type: 'arrow',
        x: centerX - 120,
        y: centerY + 25,
        width: 260,
        height: 26,
        fill: '#2563eb',
        opacity: 1,
        pointerLength: 30,
        pointerWidth: 28,
        shadowBlur: 12,
        shadowOpacity: 0.22,
      },
      {
        type: 'rectangle',
        x: centerX - 50,
        y: centerY - 115,
        width: 100,
        height: 16,
        fill: '#f97316',
        opacity: 1,
        cornerRadius: 999,
      },
    ];
  }

  return [];
};

const normalizeTextElement = (element) => {
  if (!element || element.type !== 'text') return element;

  const width = Number(element.width) || 300;
  const fontSize = Math.max(8, Number(element.fontSize) || 20);
  const lineHeight = Number(element.lineHeight) || 1.2;
  const letterSpacing = Number(element.letterSpacing) || 0;

  const textNode = new Konva.Text({
    text: element.text || ' ',
    fontSize,
    fontFamily: element.fontFamily || 'Arial',
    fontStyle: `${element.isItalic ? 'italic ' : ''}${element.isBold ? 'bold' : ''}`.trim() || 'normal',
    lineHeight,
    letterSpacing,
    padding: 0,
    align: element.align || 'left',
  });

  const naturalWidth = Math.ceil(textNode.width());
  const finalWidth = element.width ? Math.min(element.width, naturalWidth) : naturalWidth;

  return {
    ...element,
    width: Math.max(5, finalWidth),
    height: Math.max(fontSize, Math.ceil(textNode.height())),
    lineHeight,
    letterSpacing,
  };
};

const escapeSvgText = (value = '') => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const getSvgTextLayout = (element) => {
  const fontSize = Math.max(8, Number(element.fontSize) || 20);
  const width = Number(element.width) || 300;
  const lineHeight = Number(element.lineHeight) || 1.2;
  const letterSpacing = Number(element.letterSpacing) || 0;

  const textNode = new Konva.Text({
    text: (element.text || '').toString() || ' ',
    width,
    fontSize,
    fontFamily: element.fontFamily || 'Arial',
    fontStyle: `${element.isItalic ? 'italic ' : ''}${element.isBold ? 'bold' : ''}`.trim() || 'normal',
    wrap: 'word',
    lineHeight,
    letterSpacing,
    padding: 0,
    align: element.align || 'left',
  });

  const lines = Array.isArray(textNode.textArr) && textNode.textArr.length > 0
    ? textNode.textArr.map((line) => line.text)
    : ((element.text || '').toString().split('\n'));

  return {
    fontSize,
    width,
    lineHeight,
    letterSpacing,
    lines,
  };
};

function App() {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [templateSize, setTemplateSize] = useState(TEMPLATE_SIZES.instagramPost);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const stageRef = useRef(null);

  const [history, setHistory] = useState([[]]);
  const [historyStep, setHistoryStep] = useState(0);

  const selectedElement = elements.find(el => el.id === selectedId);

  const persistDraft = (draftElements, draftBgColor = bgColor, draftBackgroundImage = backgroundImage, draftTemplateSize = templateSize) => {
    try {
      window.localStorage.setItem(
        LOCAL_DRAFT_KEY,
        JSON.stringify({
          elements: draftElements,
          bgColor: draftBgColor,
          backgroundImage: draftBackgroundImage,
          templateSize: draftTemplateSize,
          savedAt: Date.now(),
        }),
      );
    } catch (error) {
      console.error('Failed to persist local draft', error);
    }
  };

  const isEditableTarget = (target) => {
    if (!target) return false;
    const tagName = target.tagName?.toLowerCase();
    return tagName === 'input' || tagName === 'textarea' || tagName === 'select' || target.isContentEditable;
  };

  const updateElementsAndHistory = (newElements) => {
    const nextHistory = history.slice(0, historyStep + 1);
    nextHistory.push(newElements);
    setHistory(nextHistory);
    setHistoryStep(nextHistory.length - 1);
    setElements(newElements);
    setLastUpdated(Date.now());
    persistDraft(newElements);
  };

  const handleUndo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setElements(history[historyStep - 1]);
      setSelectedId(null);
    }
  };

  const handleRedo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setElements(history[historyStep + 1]);
      setSelectedId(null);
    }
  };

  const handleAddElement = (type, extraProps = {}) => {
    const id = uuidv4();
    const basePath = {
      id,
      type,
      x: templateSize.width / 2 - 50,
      y: templateSize.height / 2 - 50,
    };
    
    let props = {};
    if (type === 'text') {
      props = {
        text: 'Double click to edit',
        fontSize: 40,
        fontFamily: "'Poppins', sans-serif",
        fill: '#000000',
        width: 320,
        isBold: false,
        isItalic: false,
        align: 'left',
        opacity: 1,
        lineHeight: 1.15,
        letterSpacing: -0.4,
      };
      basePath.x = templateSize.width / 2 - 150;
    } else if (type === 'rectangle') {
      props = { width: 200, height: 150, fill: '#3B82F6', opacity: 1, strokeWidth: 0, shadowBlur: 0, shadowOpacity: 0.25 };
      basePath.x = templateSize.width / 2 - 100;
    } else if (type === 'circle') {
      props = { width: 150, height: 150, fill: '#ef4444', opacity: 1, strokeWidth: 0, shadowBlur: 0, shadowOpacity: 0.25 };
      basePath.x = templateSize.width / 2 - 75;
    } else if (type === 'ellipse') {
      props = { width: 210, height: 130, fill: '#8B5CF6', opacity: 1, strokeWidth: 0, shadowBlur: 0, shadowOpacity: 0.25 };
      basePath.x = templateSize.width / 2 - 105;
      basePath.y = templateSize.height / 2 - 65;
    } else if (type === 'triangle') {
      props = { width: 150, height: 150, fill: '#10B981', opacity: 1, strokeWidth: 0, shadowBlur: 0, shadowOpacity: 0.25 };
      basePath.x = templateSize.width / 2 - 75;
    } else if (type === 'hexagon') {
      props = { width: 170, height: 170, fill: '#14B8A6', opacity: 1, strokeWidth: 0, shadowBlur: 0, shadowOpacity: 0.25 };
      basePath.x = templateSize.width / 2 - 85;
    } else if (type === 'star') {
      props = { width: 150, height: 150, fill: '#F59E0B', opacity: 1, strokeWidth: 0, shadowBlur: 0, shadowOpacity: 0.25 };
      basePath.x = templateSize.width / 2 - 75;
    } else if (type === 'line') {
      props = { width: 300, height: 10, fill: '#1F2937', opacity: 1 };
      basePath.x = templateSize.width / 2 - 150;
    } else if (type === 'arrow') {
      props = { width: 260, height: 24, fill: '#0F172A', opacity: 1, pointerLength: 28, pointerWidth: 24 };
      basePath.x = templateSize.width / 2 - 130;
    } else if (type === 'image') {
      props = {
        width: 300,
        height: 300,
        src: extraProps.src,
        opacity: 1,
        blurRadius: 0,
        imageFit: 'fill',
        cornerRadius: 0,
        cropX: 0,
        cropY: 0,
        cropWidth: 1,
        cropHeight: 1,
        shadowBlur: 0,
        shadowOpacity: 0.25,
      };
      basePath.x = templateSize.width / 2 - 150;
    } else if (type === 'profileImage') {
      props = {
        width: 220,
        height: 220,
        src: extraProps.src,
        opacity: 1,
        blurRadius: 0,
        imageFit: 'cover',
        maskShape: 'circle',
        cornerRadius: 110,
        cropX: 0,
        cropY: 0,
        cropWidth: 1,
        cropHeight: 1,
        strokeColor: '#ffffff',
        strokeWidth: 6,
        shadowBlur: 16,
        shadowOpacity: 0.32,
      };
      basePath.x = templateSize.width / 2 - 110;
    } else if (type === 'photoFrame') {
      props = {
        width: 260,
        height: 320,
        src: extraProps.src || null,
        opacity: 1,
        blurRadius: 0,
        imageFit: 'cover',
        cropX: 0,
        cropY: 0,
        cropWidth: 1,
        cropHeight: 1,
        frameStyle: extraProps.frameStyle || 'rounded',
        frameColor: extraProps.frameColor || '#ffffff',
        accentColor: extraProps.accentColor || '#f59e0b',
        strokeColor: extraProps.strokeColor || '#e5e7eb',
        strokeWidth: extraProps.strokeWidth ?? 2,
        shadowBlur: extraProps.shadowBlur ?? 20,
        shadowOpacity: extraProps.shadowOpacity ?? 0.24,
        cornerRadius: extraProps.cornerRadius ?? 28,
        label: extraProps.label || 'Drop Photo',
      };
      basePath.x = templateSize.width / 2 - 130;
      basePath.y = templateSize.height / 2 - 160;
    }

    const nextElement = type === 'text' ? normalizeTextElement({ ...basePath, ...props, ...extraProps }) : { ...basePath, ...props, ...extraProps };
    updateElementsAndHistory([...elements, nextElement]);
    setSelectedId(id);
  };

  const handleAddGraphicPreset = (variant) => {
    const graphicElements = createGraphicElements(variant, templateSize).map((el) => ({
      id: uuidv4(),
      ...el,
    }));

    if (graphicElements.length === 0) return;
    updateElementsAndHistory([...elements, ...graphicElements]);
    setSelectedId(graphicElements[graphicElements.length - 1].id);
  };

  const handleAddElements = (newElements, originalSize) => {
    let scale = 1;
    let offsetX = 0;
    let offsetY = 0;

    if (originalSize && originalSize.width && originalSize.height) {
      // Fit within 100% of canvas area
      const margin = 1.0;
      const scaleX = (templateSize.width * margin) / originalSize.width;
      const scaleY = (templateSize.height * margin) / originalSize.height;
      scale = Math.min(scaleX, scaleY); // Allow scaling UP to fit the canvas
      
      offsetX = (templateSize.width - originalSize.width * scale) / 2;
      offsetY = (templateSize.height - originalSize.height * scale) / 2;
    }

    const elementsWithIds = newElements.map(el => {
      const scaledEl = {
        ...el,
        id: el.id || uuidv4(),
        x: (el.x * scale) + offsetX,
        y: (el.y * scale) + offsetY,
      };

      if (['rectangle', 'circle', 'ellipse', 'triangle', 'hexagon', 'star', 'line', 'arrow', 'image', 'profileImage', 'photoFrame'].includes(el.type)) {
        scaledEl.width = (el.width || 0) * scale;
        scaledEl.height = (el.height || 0) * scale;
        if (scaledEl.cornerRadius) {
          scaledEl.cornerRadius = scaledEl.cornerRadius * scale;
        }
      } else {
        scaledEl.scaleX = (el.scaleX || 1) * scale;
        scaledEl.scaleY = (el.scaleY || 1) * scale;
      }
      
      return scaledEl.type === 'text' ? normalizeTextElement(scaledEl) : scaledEl;
    });

    updateElementsAndHistory([...elements, ...elementsWithIds]);
    if (elementsWithIds.length > 0) {
      setSelectedId(elementsWithIds[elementsWithIds.length - 1].id);
    }
  };

  const handleChangeElement = (newProps) => {
    const normalizedProps = newProps.type === 'text' ? normalizeTextElement(newProps) : newProps;
    updateElementsAndHistory(elements.map(el => el.id === normalizedProps.id ? normalizedProps : el));
  };

  const handleDuplicateElement = () => {
    if (selectedId) {
       const elToCopy = elements.find(el => el.id === selectedId);
       if (elToCopy) {
          const newId = uuidv4();
          const newElement = {
            ...elToCopy,
            id: newId,
            x: elToCopy.x + 20,
            y: elToCopy.y + 20,
          };
          updateElementsAndHistory([...elements, newElement.type === 'text' ? normalizeTextElement(newElement) : newElement]);
          setSelectedId(newId);
       }
    }
  };

  const handleLayerChange = (direction) => {
    if (!selectedId) return;
    const index = elements.findIndex(el => el.id === selectedId);
    if (index === -1) return;

    const newElements = [...elements];
    const elementToMove = newElements.splice(index, 1)[0];

    if (direction === 'forward') {
      newElements.splice(Math.min(index + 1, elements.length - 1), 0, elementToMove);
    } else {
      newElements.splice(Math.max(index - 1, 0), 0, elementToMove);
    }

    updateElementsAndHistory(newElements);
  };

  const handleDeleteElement = () => {
    if (selectedId) {
      updateElementsAndHistory(elements.filter(el => el.id !== selectedId));
      setSelectedId(null);
    }
  };

  const handleMoveSelectedElement = (deltaX, deltaY) => {
    if (!selectedId) return;
    const elementToMove = elements.find((el) => el.id === selectedId);
    if (!elementToMove || elementToMove.isLocked) return;

    handleChangeElement({
      ...elementToMove,
      x: Math.round((elementToMove.x || 0) + deltaX),
      y: Math.round((elementToMove.y || 0) + deltaY),
    });
  };

  const handleClear = () => {
    if(window.confirm("Are you sure you want to clear the canvas?")) {
      updateElementsAndHistory([]);
      setSelectedId(null);
      setBgColor('#ffffff');
      setBackgroundImage(null);
      try {
        window.localStorage.removeItem(LOCAL_DRAFT_KEY);
      } catch (error) {
        console.error('Failed to clear local draft', error);
      }
    }
  };

  const handleDownloadJSON = () => {
    const payload = {
      width: templateSize.width,
      height: templateSize.height,
      bgColor,
      backgroundImage,
      objects: elements
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "template.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadFabricJSON = () => {
    const fabricObjects = elements.map(el => {
      const common = {
        angle: el.rotation || 0,
        opacity: el.opacity ?? 1,
        scaleX: el.scaleX || 1,
        scaleY: el.scaleY || 1,
        stroke: el.strokeColor || null,
        strokeWidth: el.strokeWidth || 0,
        selectable: true,
        visible: true,
      };

      if (el.type === 'rectangle') {
        return { ...common, type: 'rect', left: el.x, top: el.y,
          width: el.width, height: el.height, fill: el.fill,
          rx: el.cornerRadius || 0, ry: el.cornerRadius || 0 };

      } else if (el.type === 'circle') {
        const radius = el.width / 2;
        return { ...common, type: 'circle',
          left: el.x - radius, top: el.y - radius,
          radius, fill: el.fill };

      } else if (el.type === 'triangle') {
        const r = el.width / 2;
        return { ...common, type: 'triangle',
          left: el.x - r, top: el.y - r,
          width: el.width, height: el.height, fill: el.fill };

      } else if (el.type === 'text') {
        return { ...common, type: 'textbox',
          left: el.x, top: el.y, width: el.width || 300,
          text: el.text, fontSize: el.fontSize,
          fontFamily: el.fontFamily || 'Arial', fill: el.fill,
          fontWeight: el.isBold ? 'bold' : 'normal',
          fontStyle: el.isItalic ? 'italic' : 'normal',
          textAlign: el.align || 'left' };

      } else if (el.type === 'image' || el.type === 'photoFrame') {
        return { ...common, type: 'image',
          left: el.x, top: el.y,
          width: el.width, height: el.height,
          src: el.src, crossOrigin: 'anonymous',
          scaleX: 1, scaleY: 1,
          blurRadius: el.blurRadius || 0,
          imageFit: el.imageFit || 'fill',
          cornerRadius: el.cornerRadius || 0 };

      } else if (el.type === 'profileImage') {
        return { ...common, type: 'image',
          left: el.x, top: el.y,
          width: el.width, height: el.height,
          src: el.src, crossOrigin: 'anonymous',
          scaleX: 1, scaleY: 1,
          blurRadius: el.blurRadius || 0,
          imageFit: el.imageFit || 'cover',
          cornerRadius: el.cornerRadius || 0,
          maskShape: el.maskShape || 'circle' };

      } else if (el.type === 'line') {
        return { ...common, type: 'line',
          left: el.x, top: el.y,
          x1: 0, y1: 0, x2: el.width, y2: 0,
          stroke: el.fill,
          strokeWidth: Math.max(2, (el.height || 10) / 10),
          fill: '' };

      } else if (el.type === 'arrow') {
        return { ...common, type: 'arrow',
          left: el.x, top: el.y,
          x1: 0, y1: (el.height || 24) / 2, x2: el.width, y2: (el.height || 24) / 2,
          stroke: el.fill,
          strokeWidth: Math.max(2, (el.height || 24) / 3),
          fill: el.fill,
          pointerLength: el.pointerLength || 28,
          pointerWidth: el.pointerWidth || 24 };

      } else if (el.type === 'star') {
        // Fabric has no star — convert to SVG path
        const outerR = el.width / 2;
        const innerR = el.width / 4;
        const pts = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outerR : innerR;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          pts.push(`${i === 0 ? 'M' : 'L'}${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
        }
        return { ...common, type: 'path',
          path: pts.join(' ') + ' Z',
          left: el.x, top: el.y, fill: el.fill };
      } else if (el.type === 'path') {
        return { ...common, type: 'path',
          path: el.data,
          left: el.x, top: el.y, fill: el.fill };
      }
      return null;
    }).filter(Boolean);

    const fabricJSON = {
      version: '5.3.0',
      background: bgColor,
      backgroundImage,
      width: templateSize.width,
      height: templateSize.height,
      objects: fabricObjects,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(fabricJSON, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', 'template-fabric.json');
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleLoadJSON = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        let json = JSON.parse(e.target.result);

        // Detect if it's a Fabric.js JSON
        const isFabric = json.version && Array.isArray(json.objects) && (json.objects.length === 0 || json.objects[0].left !== undefined || json.background !== undefined);

        if (isFabric) {
          console.log("Fabric JSON detected, converting...");
          json = {
            width: json.width || 800,
            height: json.height || 800,
            bgColor: json.background || '#ffffff',
            backgroundImage: json.backgroundImage || null,
            objects: json.objects.map(obj => {
              const common = {
                id: uuidv4(),
                rotation: obj.angle || 0,
                opacity: obj.opacity ?? 1,
                scaleX: obj.scaleX || 1,
                scaleY: obj.scaleY || 1,
                strokeColor: obj.stroke || null,
                strokeWidth: obj.strokeWidth || 0,
                isLocked: false
              };

              if (obj.type === 'rect') {
                return { ...common, type: 'rectangle', x: obj.left, y: obj.top, width: obj.width * (obj.scaleX || 1), height: obj.height * (obj.scaleY || 1), fill: obj.fill, cornerRadius: obj.rx || 0, scaleX: 1, scaleY: 1 };
              } else if (obj.type === 'circle') {
                const radius = (obj.radius || 50) * (obj.scaleX || 1);
                return { ...common, type: 'circle', x: obj.left + radius, y: obj.top + radius, width: radius * 2, height: radius * 2, fill: obj.fill, scaleX: 1, scaleY: 1 };
              } else if (obj.type === 'triangle') {
                const width = (obj.width || 100) * (obj.scaleX || 1);
                const height = (obj.height || 100) * (obj.scaleY || 1);
                return { ...common, type: 'triangle', x: obj.left + (width / 2), y: obj.top + (height / 2), width: width, height: height, fill: obj.fill, scaleX: 1, scaleY: 1 };
              } else if (obj.type === 'textbox') {
                return { ...common, type: 'text', x: obj.left, y: obj.top, text: obj.text, fontSize: obj.fontSize, fontFamily: obj.fontFamily, fill: obj.fill, isBold: obj.fontWeight === 'bold', isItalic: obj.fontStyle === 'italic', align: obj.textAlign || 'left', width: obj.width * (obj.scaleX || 1), height: obj.height * (obj.scaleY || 1), scaleX: 1, scaleY: 1 };
              } else if (obj.type === 'image') {
                return { ...common, type: 'image', x: obj.left, y: obj.top, width: obj.width * (obj.scaleX || 1), height: obj.height * (obj.scaleY || 1), src: obj.src, scaleX: 1, scaleY: 1, blurRadius: obj.blurRadius || 0, imageFit: obj.imageFit || 'fill', cornerRadius: obj.cornerRadius || 0 };
              } else if (obj.type === 'line') {
                return { ...common, type: 'line', x: obj.left, y: obj.top, width: (obj.x2 - obj.x1) * (obj.scaleX || 1), height: 10, fill: obj.stroke, scaleX: 1, scaleY: 1 };
              } else if (obj.type === 'arrow') {
                return { ...common, type: 'arrow', x: obj.left, y: obj.top, width: (obj.x2 - obj.x1) * (obj.scaleX || 1), height: obj.strokeWidth || 24, fill: obj.stroke || '#000000', scaleX: 1, scaleY: 1 };
              } else if (obj.type === 'path') {
                // Fabric path (likely a star from our export)
                return { ...common, type: 'star', x: obj.left, y: obj.top, width: 150, height: 150, fill: obj.fill, scaleX: 1, scaleY: 1 };
              }
              return null;
            }).filter(Boolean)
          };
        }

        if (!json.objects || !json.width || !json.height) {
          alert('Invalid JSON: missing width, height, or objects.');
          return;
        }

        // Set canvas size to match JSON dimensions
        setTemplateSize({
          id: 'custom',
          name: `Custom (${json.width}x${json.height})`,
          width: json.width,
          height: json.height,
        });

        // Apply background color
        if (json.bgColor) setBgColor(json.bgColor);
        setBackgroundImage(json.backgroundImage || null);

        // Load objects and push to history
        updateElementsAndHistory(json.objects.map((element) => normalizeTextElement(element)));
        setSelectedId(null);
      } catch (err) {
        alert('Failed to parse JSON file. Please upload a valid template JSON.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadImage = () => {
    setSelectedId(null); // Unselect to hide transformers
    setTimeout(() => {
      if (stageRef.current) {
        // Reverse the viewport scaling to export the exact original pixel dimension seamlessly
        const exportScale = 1 / stageRef.current.scaleX();
        const dataURL = stageRef.current.toDataURL({ pixelRatio: exportScale });
        const link = document.createElement('a');
        link.download = 'design.png';
        link.href = dataURL;
        link.click();
        link.remove();
      }
    }, 50);
  };

  const handleDownloadSVG = () => {
    let defs = '<defs>';
    let content = '';
    const backgroundFilters = [];

    if (backgroundImage?.src && backgroundImage.blurRadius > 0) {
      backgroundFilters.push(`<filter id="bg-blur"><feGaussianBlur stdDeviation="${Math.max(0, backgroundImage.blurRadius / 4)}" /></filter>`);
    }

    elements.forEach((el, index) => {
      const transform = `translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}) scale(${el.scaleX || 1}, ${el.scaleY || 1})`;
      const opacityAttr = `opacity="${el.opacity ?? 1}"`;
      const strokeAttr = `stroke="${el.strokeColor || 'transparent'}" stroke-width="${el.strokeWidth || 0}"`;

      if (el.type === 'rectangle') {
        content += `<rect width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.cornerRadius || 0}" ry="${el.cornerRadius || 0}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'circle') {
        const r = el.width / 2;
        content += `<circle cx="${r}" cy="${r}" r="${r}" fill="${el.fill}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'text') {
        const { lines, fontSize, width, lineHeight, letterSpacing } = getSvgTextLayout(el);
        let xOffset = 0;
        let textAnchor = 'start';
        if (el.align === 'center' && width) {
          xOffset = width / 2;
          textAnchor = 'middle';
        } else if (el.align === 'right' && width) {
          xOffset = width;
          textAnchor = 'end';
        }
        const tspans = lines.map((line, i) => {
          const y = i * fontSize * lineHeight;
          return `<tspan x="${xOffset}" y="${y}">${escapeSvgText(line || ' ')}</tspan>`;
        }).join('');
        content += `<text fill="${el.fill || '#000000'}" font-family="${(el.fontFamily || 'Arial').replace(/'/g, '')}" font-size="${fontSize}" font-weight="${el.isBold ? 'bold' : 'normal'}" font-style="${el.isItalic ? 'italic' : 'normal'}" text-anchor="${textAnchor}" dominant-baseline="hanging" xml:space="preserve" lengthAdjust="spacingAndGlyphs" ${letterSpacing ? `letter-spacing="${letterSpacing}"` : ''} ${opacityAttr} ${strokeAttr} transform="${transform}">${tspans}</text>`;
      } else if (el.type === 'image' || el.type === 'profileImage' || el.type === 'photoFrame') {
        let clipAttr = '';
        const useCircleMask = el.maskShape === 'circle';
        const effectiveCornerRadius = el.type === 'photoFrame'
          ? (el.frameStyle === 'rounded' ? (el.cornerRadius || 28) : el.frameStyle === 'arch' ? Math.min(el.width, el.height) / 2 : 0)
          : el.cornerRadius;
        if (effectiveCornerRadius || useCircleMask || el.height === el.width) {
           const clipId = `clip-${index}`;
           defs += useCircleMask
             ? `<clipPath id="${clipId}"><circle cx="${el.width / 2}" cy="${el.height / 2}" r="${Math.min(el.width, el.height) / 2}" /></clipPath>`
             : `<clipPath id="${clipId}"><rect width="${el.width}" height="${el.height}" rx="${effectiveCornerRadius || (el.height === el.width ? el.width/2 : 0)}" ry="${effectiveCornerRadius || (el.height === el.width ? el.height/2 : 0)}" /></clipPath>`;
           clipAttr = `clip-path="url(#${clipId})"`;
        }
        const imageFilterAttr = el.blurRadius > 0 ? `filter="url(#img-blur-${index})"` : '';
        if (el.blurRadius > 0) {
          defs += `<filter id="img-blur-${index}"><feGaussianBlur stdDeviation="${Math.max(0, el.blurRadius / 4)}" /></filter>`;
        }
        const preserveAspectRatio = el.imageFit === 'cover' ? 'xMidYMid slice' : el.imageFit === 'contain' ? 'xMidYMid meet' : 'none';
        content += `<image href="${el.src}" width="${el.width}" height="${el.height}" preserveAspectRatio="${preserveAspectRatio}" ${opacityAttr} ${clipAttr} ${imageFilterAttr} transform="${transform}" />`;
      } else if (el.type === 'ellipse') {
        content += `<ellipse cx="${el.width / 2}" cy="${el.height / 2}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${el.fill}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'triangle') {
        const r = el.width / 2;
        content += `<polygon points="${r},0 ${el.width},${el.height} 0,${el.height}" fill="${el.fill}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'hexagon') {
        const w = el.width;
        const h = el.height;
        const points = `${w * 0.25},0 ${w * 0.75},0 ${w},${h / 2} ${w * 0.75},${h} ${w * 0.25},${h} 0,${h / 2}`;
        content += `<polygon points="${points}" fill="${el.fill}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'star') {
        const outer = el.width / 2;
        const inner = el.width / 4;
        let points = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outer : inner;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          points.push(`${outer + r * Math.cos(a)},${outer + r * Math.sin(a)}`);
        }
        content += `<polygon points="${points.join(' ')}" fill="${el.fill}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'line') {
        content += `<line x1="0" y1="0" x2="${el.width}" y2="0" stroke="${el.fill}" stroke-width="${Math.max(2, el.height / 10)}" ${opacityAttr} transform="${transform}" />`;
      } else if (el.type === 'arrow') {
        content += `<line x1="0" y1="${el.height / 2}" x2="${el.width}" y2="${el.height / 2}" stroke="${el.fill}" stroke-width="${Math.max(2, el.height / 3)}" marker-end="url(#arrow-head-${index})" ${opacityAttr} transform="${transform}" />`;
        defs += `<marker id="arrow-head-${index}" markerWidth="${el.pointerLength || 28}" markerHeight="${el.pointerWidth || 24}" refX="${el.pointerLength || 28}" refY="${(el.pointerWidth || 24) / 2}" orient="auto"><polygon points="0 0, ${(el.pointerLength || 28)} ${(el.pointerWidth || 24) / 2}, 0 ${(el.pointerWidth || 24)}" fill="${el.fill}" /></marker>`;
      } else if (el.type === 'path') {
        content += `<path d="${el.data}" fill="${el.fill || 'transparent'}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      }
    });

    defs += backgroundFilters.join('');
    defs += '</defs>';
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${templateSize.width}" height="${templateSize.height}" viewBox="0 0 ${templateSize.width} ${templateSize.height}">`;
    svg += defs;
    svg += `<rect width="${templateSize.width}" height="${templateSize.height}" fill="${bgColor}" />`;
    if (backgroundImage?.src) {
      svg += `<image href="${backgroundImage.src}" width="${templateSize.width}" height="${templateSize.height}" preserveAspectRatio="${backgroundImage.fit === 'cover' ? 'xMidYMid slice' : backgroundImage.fit === 'contain' ? 'xMidYMid meet' : 'none'}" opacity="${backgroundImage.opacity ?? 1}" ${backgroundImage.blurRadius > 0 ? 'filter="url(#bg-blur)"' : ''} />`;
    }
    svg += content;
    svg += `</svg>`;

    const dataStr = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "design.svg");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadFabricSVG = () => {
    // Generate SVG specifically optimized for Fabric.js
    let defs = '<defs>';
    let content = '';
    
    elements.forEach((el, index) => {
      const transform = `translate(${el.x}, ${el.y}) rotate(${el.rotation || 0}) scale(${el.scaleX || 1}, ${el.scaleY || 1})`;
      const opacityAttr = `opacity="${el.opacity ?? 1}"`;
      const strokeAttr = `stroke="${el.strokeColor || 'transparent'}" stroke-width="${el.strokeWidth || 0}"`;

      if (el.type === 'rectangle') {
        content += `<rect x="0" y="0" width="${el.width}" height="${el.height}" fill="${el.fill}" rx="${el.cornerRadius || 0}" ry="${el.cornerRadius || 0}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'circle') {
        const r = el.width / 2;
        content += `<circle cx="${r}" cy="${r}" r="${r}" fill="${el.fill}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'text') {
        const { lines, fontSize, width, lineHeight, letterSpacing } = getSvgTextLayout(el);
        let xOffset = 0;
        let textAnchor = 'start';
        if (el.align === 'center') {
          xOffset = width / 2;
          textAnchor = 'middle';
        } else if (el.align === 'right') {
          xOffset = width;
          textAnchor = 'end';
        }
        
        const tspans = lines.map((line, i) => {
          const dy = i === 0 ? fontSize : fontSize * lineHeight;
          return `<tspan x="${xOffset}" dy="${dy}">${escapeSvgText(line || ' ')}</tspan>`;
        }).join('');
        
        content += `<text x="0" y="0" fill="${el.fill || '#000000'}" font-family="${(el.fontFamily || 'Arial').replace(/'/g, '')}" font-size="${fontSize}" font-weight="${el.isBold ? 'bold' : 'normal'}" font-style="${el.isItalic ? 'italic' : 'normal'}" text-anchor="${textAnchor}" xml:space="preserve" ${letterSpacing ? `letter-spacing="${letterSpacing}"` : ''} ${opacityAttr} ${strokeAttr} transform="${transform}">${tspans}</text>`;
      } else if (el.type === 'image' || el.type === 'profileImage' || el.type === 'photoFrame') {
        content += `<image href="${el.src}" x="0" y="0" width="${el.width}" height="${el.height}" preserveAspectRatio="xMidYMid slice" ${opacityAttr} transform="${transform}" />`;
      } else if (el.type === 'ellipse') {
        content += `<ellipse cx="${el.width / 2}" cy="${el.height / 2}" rx="${el.width / 2}" ry="${el.height / 2}" fill="${el.fill}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'triangle') {
        const r = el.width / 2;
        content += `<polygon points="${r},0 ${el.width},${el.height} 0,${el.height}" fill="${el.fill}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'hexagon') {
        const w = el.width;
        const h = el.height;
        const points = `${w * 0.25},0 ${w * 0.75},0 ${w},${h / 2} ${w * 0.75},${h} ${w * 0.25},${h} 0,${h / 2}`;
        content += `<polygon points="${points}" fill="${el.fill}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'star') {
        const outer = el.width / 2;
        const inner = el.width / 4;
        let pointsArr = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 === 0 ? outer : inner;
          const a = (i * Math.PI) / 5 - Math.PI / 2;
          pointsArr.push(`${outer + r * Math.cos(a)},${outer + r * Math.sin(a)}`);
        }
        content += `<polygon points="${pointsArr.join(' ')}" fill="${el.fill}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      } else if (el.type === 'line') {
        content += `<line x1="0" y1="0" x2="${el.width}" y2="0" stroke="${el.fill}" stroke-width="${Math.max(2, el.height / 10)}" ${opacityAttr} transform="${transform}" />`;
      } else if (el.type === 'arrow') {
        content += `<line x1="0" y1="${el.height / 2}" x2="${el.width}" y2="${el.height / 2}" stroke="${el.fill}" stroke-width="${Math.max(2, el.height / 3)}" ${opacityAttr} transform="${transform}" />`;
      } else if (el.type === 'path') {
        content += `<path d="${el.data}" fill="${el.fill || 'transparent'}" ${opacityAttr} ${strokeAttr} transform="${transform}" />`;
      }
    });

    defs += '</defs>';
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${templateSize.width}" height="${templateSize.height}" viewBox="0 0 ${templateSize.width} ${templateSize.height}">`;
    svg += defs;
    svg += `<rect width="${templateSize.width}" height="${templateSize.height}" fill="${bgColor}" />`;
    if (backgroundImage?.src) {
      svg += `<image href="${backgroundImage.src}" width="${templateSize.width}" height="${templateSize.height}" preserveAspectRatio="xMidYMid slice" opacity="${backgroundImage.opacity ?? 1}" />`;
    }
    svg += content;
    svg += `</svg>`;

    const dataStrFromFabric = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    const downloadAnchorFromFabric = document.createElement('a');
    downloadAnchorFromFabric.setAttribute("href", dataStrFromFabric);
    downloadAnchorFromFabric.setAttribute("download", "fabric-design.svg");
    document.body.appendChild(downloadAnchorFromFabric);
    downloadAnchorFromFabric.click();
    downloadAnchorFromFabric.remove();
  };

  const handleSaveTemplate = async () => {
    const payload = {
      width: templateSize.width,
      height: templateSize.height,
      bgColor,
      backgroundImage,
      objects: elements
    };
    try {
      const response = await fetch(`${API_URL}/templates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: templateSize.name + ' ' + new Date().toLocaleTimeString(),
          canvas_json: payload
        })
      });
      if (response.ok) {
        alert('Template saved to PostgreSQL database successfully!');
      } else {
        alert('Failed to save template');
      }
    } catch (e) {
      console.error(e);
      alert('Error fetching backend API. Is the server running?');
    }
  };

  useEffect(() => {
    try {
      const rawDraft = window.localStorage.getItem(LOCAL_DRAFT_KEY);
      if (!rawDraft) return;

      const draft = JSON.parse(rawDraft);
      if (!draft || !Array.isArray(draft.elements)) return;

      if (draft.templateSize?.width && draft.templateSize?.height) {
        setTemplateSize(draft.templateSize);
      }
      if (draft.bgColor) {
        setBgColor(draft.bgColor);
      }
      if (draft.backgroundImage !== undefined) {
        setBackgroundImage(draft.backgroundImage);
      }
      if (draft.savedAt) {
        setLastUpdated(draft.savedAt);
      }

      setElements(draft.elements);
      setHistory([draft.elements]);
      setHistoryStep(0);
      setSelectedId(null);
    } catch (error) {
      console.error('Failed to restore local draft', error);
    }
  }, []);

  useEffect(() => {
    persistDraft(elements, bgColor, backgroundImage, templateSize);
  }, [bgColor, backgroundImage, templateSize]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditableTarget(e.target)) return;

      const isMeta = e.ctrlKey || e.metaKey;
      const step = e.shiftKey ? 10 : 1;

      if (isMeta && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (
        (isMeta && e.key.toLowerCase() === 'y') ||
        (isMeta && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
        return;
      }

      if (isMeta && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault();
        handleDuplicateElement();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        handleDeleteElement();
        return;
      }

      if (!selectedId) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleMoveSelectedElement(-step, 0);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleMoveSelectedElement(step, 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleMoveSelectedElement(0, -step);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleMoveSelectedElement(0, step);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements, historyStep, history]);

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden font-sans">
      <TopToolbar 
        onSave={handleSaveTemplate} 
        onDownload={handleDownloadJSON}
        onDownloadFabricJSON={handleDownloadFabricJSON}
        onDownloadSVG={handleDownloadSVG}
        onDownloadFabricSVG={handleDownloadFabricSVG}
        onDownloadImage={handleDownloadImage}
        onClear={handleClear} 
        lastUpdated={lastUpdated}
        templateSizes={TEMPLATE_SIZES}
        templateSize={templateSize}
        setTemplateSize={setTemplateSize}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyStep > 0}
        canRedo={historyStep < history.length - 1}
        onLoadJSON={handleLoadJSON}
      />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar 
          onAddElement={handleAddElement} 
          onAddElements={handleAddElements}
          onAddGraphicPreset={handleAddGraphicPreset}
          bgColor={bgColor}
          onBgColorChange={setBgColor}
          backgroundImage={backgroundImage}
          onBackgroundImageChange={setBackgroundImage}
          onDownloadJSON={handleDownloadJSON}
        />
        <EditorCanvas 
          stageRef={stageRef}
          elements={elements} 
          setElements={updateElementsAndHistory}
          selectedId={selectedId}
          selectElement={setSelectedId}
          bgColor={bgColor}
          backgroundImage={backgroundImage}
          templateSize={templateSize}
          onDelete={handleDeleteElement}
          onDuplicate={handleDuplicateElement}
        />
        <RightPanel 
          selectedElement={selectedElement}
          onChange={handleChangeElement}
          onLayerChange={handleLayerChange}
          onDelete={handleDeleteElement}
          onDuplicate={handleDuplicateElement}
          backgroundImage={backgroundImage}
          onBackgroundImageChange={setBackgroundImage}
        />
      </div>
    </div>
  );
}

export default App;

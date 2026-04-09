import React, { useState, useMemo, useRef } from 'react';
import { 
  Type, Square, Circle, Triangle, Star, Minus, 
  Image as ImageIcon, PaintBucket, Octagon, MoveRight, 
  Aperture, LayoutGrid, Sparkles, Wand2,
  Box, Shapes, UploadCloud, Palette, Pencil, Search,
  Plus, ChevronRight, Download
} from 'lucide-react';

const SHAPE_TOOLS = [
  { type: 'rectangle', label: 'Rectangle', icon: Square },
  { type: 'circle', label: 'Circle', icon: Circle },
  { type: 'ellipse', label: 'Ellipse', icon: Aperture },
  { type: 'triangle', label: 'Triangle', icon: Triangle },
  { type: 'star', label: 'Star', icon: Star },
  { type: 'hexagon', label: 'Hexagon', icon: Octagon },
  { type: 'line', label: 'Line', icon: Minus },
  { type: 'arrow', label: 'Arrow', icon: MoveRight },
];

const FRAME_PRESETS = [
  { label: 'Rounded', frameStyle: 'rounded', frameColor: '#ffffff', accentColor: '#fb7185', strokeColor: '#fecdd3', labelText: 'Featured Shot' },
  { label: 'Polaroid', frameStyle: 'polaroid', frameColor: '#fff7ed', accentColor: '#f97316', strokeColor: '#fdba74', labelText: 'Summer Story' },
  { label: 'Stack', frameStyle: 'stack', frameColor: '#ffffff', accentColor: '#2563eb', strokeColor: '#dbeafe', labelText: 'Mood Board' },
  { label: 'Arch', frameStyle: 'arch', frameColor: '#f8fafc', accentColor: '#14b8a6', strokeColor: '#99f6e4', labelText: 'Portrait' },
];

const PRESET_COLORS = [
  '#000000', '#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#94a3b8', '#64748b', '#475569',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

const PRESET_GRADIENTS = [
  { name: 'Cosmic', value: 'linear-gradient(to bottom right, #ff00cc, #3333ff)' },
  { name: 'Mango', value: 'linear-gradient(to bottom right, #ffe259, #ffa751)' },
  { name: 'Aurora', value: 'linear-gradient(to bottom right, #24c6dc, #514a9d)' },
  { name: 'Peach', value: 'linear-gradient(to bottom right, #ed4264, #ffedbc)' },
  { name: 'Sea', value: 'linear-gradient(to bottom right, #2b5876, #4e4376)' },
  { name: 'Glow', value: 'linear-gradient(to bottom right, #00c6ff, #0072ff)' },
];

export default function LeftSidebar({ onAddElement, onAddElements, onAddGraphicPreset, bgColor, onBgColorChange, backgroundImage, onBackgroundImageChange, onDownloadJSON }) {
  const [activeTab, setActiveTab] = useState('templates');
  const imageInputRef = useRef(null);
  const backgroundInputRef = useRef(null);

  const collagePresets = useMemo(() => ([
    {
      name: '3-Up Story',
      originalSize: { width: 600, height: 780 },
      elements: [
        { type: 'photoFrame', x: 40, y: 44, width: 230, height: 310, frameStyle: 'rounded', frameColor: '#ffffff', accentColor: '#f97316', strokeColor: '#fed7aa', strokeWidth: 2, cornerRadius: 30, label: 'Cover' },
        { type: 'photoFrame', x: 298, y: 44, width: 262, height: 220, frameStyle: 'arch', frameColor: '#f8fafc', accentColor: '#06b6d4', strokeColor: '#bae6fd', strokeWidth: 2, label: 'Portrait' },
        { type: 'photoFrame', x: 298, y: 292, width: 262, height: 280, frameStyle: 'polaroid', frameColor: '#fff7ed', accentColor: '#f97316', strokeColor: '#fdba74', strokeWidth: 2, label: 'Story' },
        { type: 'ellipse', x: 16, y: 620, width: 180, height: 96, fill: '#fda4af', opacity: 0.72, rotation: -10 },
        { type: 'ellipse', x: 398, y: 608, width: 160, height: 108, fill: '#67e8f9', opacity: 0.66, rotation: 12 },
      ],
    },
    {
      name: 'Mood Grid',
      originalSize: { width: 720, height: 720 },
      elements: [
        { type: 'photoFrame', x: 40, y: 40, width: 300, height: 300, frameStyle: 'stack', frameColor: '#ffffff', accentColor: '#2563eb', strokeColor: '#dbeafe', strokeWidth: 2, label: 'Main' },
        { type: 'photoFrame', x: 376, y: 40, width: 300, height: 190, frameStyle: 'rounded', frameColor: '#ffffff', accentColor: '#f43f5e', strokeColor: '#fecdd3', strokeWidth: 2, cornerRadius: 28, label: 'Detail' },
        { type: 'photoFrame', x: 376, y: 266, width: 300, height: 250, frameStyle: 'arch', frameColor: '#f8fafc', accentColor: '#14b8a6', strokeColor: '#99f6e4', strokeWidth: 2, label: 'Focus' },
        { type: 'photoFrame', x: 40, y: 378, width: 300, height: 260, frameStyle: 'polaroid', frameColor: '#fff7ed', accentColor: '#f59e0b', strokeColor: '#fdba74', strokeWidth: 2, label: 'Memory' },
      ],
    },
    {
        name: 'Social Cards',
        originalSize: { width: 760, height: 520 },
        elements: [
          { type: 'photoFrame', x: 42, y: 48, width: 208, height: 280, frameStyle: 'rounded', frameColor: '#ffffff', accentColor: '#8b5cf6', strokeColor: '#ddd6fe', strokeWidth: 2, cornerRadius: 32, label: 'Hero' },
          { type: 'photoFrame', x: 276, y: 48, width: 208, height: 280, frameStyle: 'stack', frameColor: '#ffffff', accentColor: '#3b82f6', strokeColor: '#bfdbfe', strokeWidth: 2, label: 'Scene' },
          { type: 'photoFrame', x: 510, y: 48, width: 208, height: 280, frameStyle: 'polaroid', frameColor: '#fffbeb', accentColor: '#ef4444', strokeColor: '#fecaca', strokeWidth: 2, label: 'Note' },
          { type: 'rectangle', x: 44, y: 362, width: 674, height: 98, fill: '#0f172a', cornerRadius: 28, opacity: 0.96 },
        ],
      },
  ]), []);

  const parseSVG = (svgText) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svgEl = doc.querySelector('svg');
    if (!svgEl) return [];

    const elements = [];
    const viewBox = svgEl.getAttribute('viewBox');
    let vbWidth = parseFloat(svgEl.getAttribute('width'));
    let vbHeight = parseFloat(svgEl.getAttribute('height'));
    let minX = 0;
    let minY = 0;

    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(parseFloat);
      if (parts.length === 4) {
        minX = parts[0];
        minY = parts[1];
        vbWidth = vbWidth || parts[2];
        vbHeight = vbHeight || parts[3];
      }
    }

    vbWidth = vbWidth || 300;
    vbHeight = vbHeight || 300;

    const traverse = (node, parentX = 0, parentY = 0, parentScaleX = 1, parentScaleY = 1, parentRotation = 0) => {
      if (node.nodeType !== 1) return;

      const tag = node.tagName.toLowerCase();
      const getAttrOrStyle = (attr) => {
        const val = node.getAttribute(attr);
        if (val) return val;
        const style = node.getAttribute('style');
        if (style) {
          const regex = new RegExp(`${attr}:\\s*([^;]+)`);
          const match = style.match(regex);
          if (match) return match[1].trim();
        }
        return undefined;
      };

      const fill = getAttrOrStyle('fill');
      const stroke = getAttrOrStyle('stroke');
      const strokeWidthVal = getAttrOrStyle('stroke-width');
      const strokeWidth = strokeWidthVal ? parseFloat(strokeWidthVal) : undefined;
      const opacityVal = getAttrOrStyle('opacity');
      const opacity = opacityVal ? parseFloat(opacityVal) : undefined;
      const transform = node.getAttribute('transform');

      const props = {
        fill: fill === 'none' ? 'transparent' : fill,
        strokeColor: stroke === 'none' ? 'transparent' : stroke,
        strokeWidth,
        opacity,
      };

      if (!props.fill && !props.strokeColor && tag !== 'g') {
        props.fill = '#000000';
      }

      let localX = 0;
      let localY = 0;
      let localRotation = 0;
      let localScaleX = 1;
      let localScaleY = 1;

      if (transform) {
        const translateMatch = transform.match(/translate\(([^,)\s]+)[,\s]*([^)\s]+)?\)/);
        if (translateMatch) {
          localX = parseFloat(translateMatch[1]);
          localY = parseFloat(translateMatch[2]) || 0;
        }
        const rotateMatch = transform.match(/rotate\(([^)]+)\)/);
        if (rotateMatch) {
          localRotation = parseFloat(rotateMatch[1]);
        }
        const scaleMatch = transform.match(/scale\(([^,)\s]+)[,\s]*([^)\s]+)?\)/);
        if (scaleMatch) {
          localScaleX = parseFloat(scaleMatch[1]);
          localScaleY = parseFloat(scaleMatch[2]) || localScaleX;
        }
      }

      const currentScaleX = parentScaleX * localScaleX;
      const currentScaleY = parentScaleY * localScaleY;
      const currentX = parentX + (localX * parentScaleX);
      const currentY = parentY + (localY * parentScaleY);
      const currentRotation = parentRotation + localRotation;

      if (tag === 'path') {
        const d = node.getAttribute('d');
        if (d) {
          elements.push({ type: 'path', data: d, x: currentX - minX * currentScaleX, y: currentY - minY * currentScaleY, rotation: currentRotation, scaleX: currentScaleX, scaleY: currentScaleY, ...props });
        }
      } else if (tag === 'rect') {
        const x = parseFloat(node.getAttribute('x')) || 0;
        const y = parseFloat(node.getAttribute('y')) || 0;
        elements.push({ type: 'rectangle', x: currentX + (x * parentScaleX) - minX * currentScaleX, y: currentY + (y * parentScaleY) - minY * currentScaleY, width: (parseFloat(node.getAttribute('width')) || 0) * currentScaleX, height: (parseFloat(node.getAttribute('height')) || 0) * currentScaleY, cornerRadius: parseFloat(node.getAttribute('rx')) || 0, rotation: currentRotation, ...props });
      } else if (tag === 'circle') {
        const cx = parseFloat(node.getAttribute('cx')) || 0;
        const cy = parseFloat(node.getAttribute('cy')) || 0;
        const rx = parseFloat(node.getAttribute('r')) || 0;
        elements.push({ type: 'circle', x: currentX + (cx * parentScaleX) - minX * currentScaleX, y: currentY + (cy * parentScaleY) - minY * currentScaleY, width: rx * 2 * currentScaleX, height: rx * 2 * currentScaleY, rotation: currentRotation, ...props });
      } else if (tag === 'ellipse') {
        const cx = parseFloat(node.getAttribute('cx')) || 0;
        const cy = parseFloat(node.getAttribute('cy')) || 0;
        const rx = parseFloat(node.getAttribute('rx')) || 0;
        const ry = parseFloat(node.getAttribute('ry')) || 0;
        elements.push({ type: 'ellipse', x: currentX + (cx * parentScaleX) - minX * currentScaleX, y: currentY + (cy * parentScaleY) - minY * currentScaleY, width: rx * 2 * currentScaleX, height: ry * 2 * currentScaleY, rotation: currentRotation, ...props });
      } else if (tag === 'line') {
        const x1 = parseFloat(node.getAttribute('x1')) || 0;
        const y1 = parseFloat(node.getAttribute('y1')) || 0;
        const x2 = parseFloat(node.getAttribute('x2')) || 0;
        const y2 = parseFloat(node.getAttribute('y2')) || 0;
        elements.push({ type: 'path', data: `M ${x1} ${y1} L ${x2} ${y2}`, x: currentX - minX * currentScaleX, y: currentY - minY * currentScaleY, rotation: currentRotation, scaleX: currentScaleX, scaleY: currentScaleY, ...props, strokeColor: props.strokeColor || props.fill || '#000000' });
      } else if (tag === 'polygon' || tag === 'polyline') {
        const points = node.getAttribute('points');
        if (points) {
          elements.push({ type: 'path', data: `M ${points}${tag === 'polygon' ? ' Z' : ''}`, x: currentX - minX * currentScaleX, y: currentY - minY * currentScaleY, rotation: currentRotation, scaleX: currentScaleX, scaleY: currentScaleY, ...props });
        }
      } else if (tag === 'text') {
        elements.push({ type: 'text', text: node.textContent.trim(), x: currentX + ((parseFloat(node.getAttribute('x')) || 0) * parentScaleX) - minX * currentScaleX, y: currentY + ((parseFloat(node.getAttribute('y')) || 0) * parentScaleY) - minY * currentScaleY, fontSize: (parseFloat(node.getAttribute('font-size')) || 16) * currentScaleX, fontFamily: node.getAttribute('font-family') || 'Arial', fill: props.fill || '#000000', rotation: currentRotation, opacity: props.opacity });
      } else if (tag === 'image') {
        const href = node.getAttribute('href') || node.getAttribute('xlink:href');
        if (href) {
          elements.push({ type: 'image', src: href, x: currentX + ((parseFloat(node.getAttribute('x')) || 0) * parentScaleX) - minX * currentScaleX, y: currentY + ((parseFloat(node.getAttribute('y')) || 0) * parentScaleY) - minY * currentScaleY, width: (parseFloat(node.getAttribute('width')) || 0) * currentScaleX, height: (parseFloat(node.getAttribute('height')) || 0) * currentScaleY, rotation: currentRotation, opacity: props.opacity });
        }
      } else if (tag === 'g') {
        Array.from(node.childNodes).forEach((child) => traverse(child, currentX, currentY, currentScaleX, currentScaleY, currentRotation));
      }
    };

    Array.from(svgEl.childNodes).forEach((child) => traverse(child));
    return { elements, width: vbWidth, height: vbHeight };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target.result;

      if (file.type === 'image/svg+xml') {
        const svgText = src.includes('base64') ? atob(src.split(',')[1]) : decodeURIComponent(src.split(',')[1]);
        const { elements: parsedElements, width, height } = parseSVG(svgText);
        if (parsedElements.length > 0) {
          onAddElements(parsedElements, { width, height });
        } else {
          onAddElement('image', { src });
        }
      } else {
        onAddElement('image', { src });
      }

      e.target.value = '';
    };

    reader.readAsDataURL(file);
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      onBackgroundImageChange({
        src: ev.target.result,
        blurRadius: backgroundImage?.blurRadius || 0,
        opacity: backgroundImage?.opacity ?? 1,
        fit: backgroundImage?.fit || 'cover',
      });
      e.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const TABS = [
    { id: 'templates', icon: LayoutGrid, label: 'Templates' },
    { id: 'elements', icon: Shapes, label: 'Elements' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'uploads', icon: UploadCloud, label: 'Uploads' },
    { id: 'background', icon: Palette, label: 'Background' },
    { id: 'draw', icon: Pencil, label: 'Draw' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'templates':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Layouts</h3>
              <Sparkles className="text-sky-500" size={20} />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {collagePresets.map((preset) => (
                <button 
                  key={preset.name} 
                  onClick={() => onAddElements(preset.elements, preset.originalSize)} 
                  className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-sky-400 hover:shadow-lg"
                >
                  <div className="font-bold text-slate-700">{preset.name}</div>
                  <div className="mt-1 text-xs text-slate-400">Perfectly balanced grid for stories</div>
                  <div className="mt-3 flex gap-1 opacity-20 group-hover:opacity-40 transition">
                      <div className="h-12 w-8 bg-slate-300 rounded" />
                      <div className="h-12 w-12 bg-slate-300 rounded" />
                      <div className="h-12 w-8 bg-slate-400 rounded" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      case 'elements':
        return (
          <div className="space-y-8">
            <section>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Basic Shapes</h3>
              <div className="grid grid-cols-3 gap-3">
                {SHAPE_TOOLS.map(({ type, label, icon: Icon }) => (
                  <button 
                    key={type} 
                    onClick={() => onAddElement(type)} 
                    className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white py-4 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600"
                  >
                    <Icon size={24} className="mb-2" />
                    <span className="text-[10px] font-medium leading-none">{label}</span>
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Stylish Frames</h3>
              <div className="grid grid-cols-2 gap-3">
                {FRAME_PRESETS.map((frame) => (
                  <button
                    key={frame.label}
                    onClick={() => onAddElement('photoFrame', { frameStyle: frame.frameStyle, frameColor: frame.frameColor, accentColor: frame.accentColor, strokeColor: frame.strokeColor, label: frame.labelText })}
                    className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-sky-300 hover:shadow-md"
                  >
                    <div 
                        className="mb-2 h-16 w-full rounded-lg border border-dashed border-slate-200" 
                        style={{ backgroundColor: frame.frameColor, borderColor: frame.strokeColor }} 
                    />
                    <span className="text-xs font-bold text-slate-600">{frame.label}</span>
                  </button>
                ))}
              </div>
            </section>
            <section>
              <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Graphic Pack</h3>
              <div className="space-y-2">
                <button onClick={() => onAddGraphicPreset('sparkleBurst')} className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-sky-50 hover:border-sky-200">
                    <Sparkles className="text-amber-400" size={18} />
                    Sparkle Burst
                </button>
                <button onClick={() => onAddGraphicPreset('blobMix')} className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-rose-50 hover:border-rose-200">
                    <Wand2 className="text-rose-400" size={18} />
                    Color Blobs
                </button>
              </div>
            </section>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-8">
            <section>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Typography</h3>
                <div className="space-y-4">
                    <button 
                        onClick={() => onAddElement('text', { fontSize: 64, isBold: true, text: 'Heading' })}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-sky-400"
                    >
                        <div className="text-2xl font-black text-slate-800">Add a heading</div>
                        <div className="text-xs text-slate-400">Bold & Impactful</div>
                    </button>
                    <button 
                        onClick={() => onAddElement('text', { fontSize: 32, isBold: true, text: 'Subheading' })}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-sky-400"
                    >
                        <div className="text-lg font-bold text-slate-800">Add a subheading</div>
                    </button>
                    <button 
                        onClick={() => onAddElement('text', { fontSize: 18, text: 'Body text' })}
                        className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-sky-400"
                    >
                        <div className="text-sm font-medium text-slate-800">Add body text</div>
                    </button>
                </div>
            </section>
            <section>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Fancy Styles</h3>
                <div className="grid grid-cols-1 gap-3">
                    <button 
                         onClick={() => onAddElement('text', { fontSize: 48, fontFamily: "'Playfair Display', serif", fill: '#f43f5e', text: 'Classic' })}
                         className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-center font-bold text-rose-600 transition hover:shadow-md"
                    >
                        Classic Serif
                    </button>
                    <button 
                         onClick={() => onAddElement('text', { fontSize: 48, fontFamily: "'Bebas Neue', sans-serif", fill: '#0f172a', text: 'MODERN' })}
                         className="rounded-xl border border-slate-200 bg-white p-4 text-center font-bold text-slate-900 tracking-[0.1em] transition hover:shadow-md"
                    >
                        MODERN BOLD
                    </button>
                </div>
            </section>
          </div>
        );
      case 'uploads':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Downloads & Uploads</h3>
            <div 
                onClick={() => imageInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 transition hover:border-sky-400 hover:bg-sky-50"
            >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                    <UploadCloud size={32} />
                </div>
                <div className="text-center">
                    <div className="font-bold text-slate-700">Upload Images</div>
                    <div className="text-xs text-slate-400">PNG, JPG, SVG supported</div>
                </div>
            </div>
            
            <div className="mt-8 space-y-3">
                <button 
                    onClick={onDownloadJSON}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-4 py-4 text-sm font-bold text-white transition hover:bg-slate-800 shadow-lg shadow-slate-200"
                >
                    <Download size={18} />
                    Download Project (JSON)
                </button>
                <div className="text-[10px] text-center text-slate-400">Save the entire design state to edit later</div>
            </div>

            <div className="mt-8 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase text-slate-400">Your Assets</h4>
                <button className="text-xs font-bold text-sky-600 hover:underline">View All</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-square rounded-xl bg-slate-100 flex items-center justify-center text-slate-300">
                        <Plus size={16} />
                    </div>
                ))}
            </div>
          </div>
        );
      case 'background':
        return (
          <div className="space-y-8">
            <section>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Canvas Color</h3>
                <div className="grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map(color => (
                        <button 
                            key={color}
                            onClick={() => onBgColorChange(color)}
                            className="aspect-square rounded-full border border-slate-200 transition hover:scale-110 active:scale-90"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    <label className="relative aspect-square flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 cursor-pointer overflow-hidden transition hover:scale-110">
                         <Plus size={16} className="text-slate-400" />
                         <input type="color" value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                    </label>
                </div>
            </section>
            <section>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Gradients</h3>
                <div className="grid grid-cols-2 gap-3">
                    {PRESET_GRADIENTS.map(grad => (
                        <button 
                            key={grad.name}
                            onClick={() => onBgColorChange(grad.value)}
                            className="h-16 rounded-xl border border-slate-200 transition hover:shadow-md"
                            style={{ background: grad.value }}
                        />
                    ))}
                </div>
            </section>
            <section>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Backdrop Image</h3>
                <button 
                    onClick={() => backgroundInputRef.current?.click()}
                    className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                    <ImageIcon className="text-sky-500" size={20} />
                    {backgroundImage?.src ? 'Change Background' : 'Upload Backdrop'}
                </button>
                {backgroundImage?.src && (
                    <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sky-50 p-3 text-xs text-sky-700">
                        <ImageIcon size={14} />
                        Background is active
                    </div>
                )}
            </section>
          </div>
        );
      case 'draw':
        return (
          <div className="flex h-[80%] flex-col items-center justify-center p-6 text-center">
            <div className="mb-6 rounded-3xl bg-amber-100 p-8 text-amber-600">
                <Pencil size={48} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Drawing Tool Coming Soon!</h3>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">We're working on a brush system to let you doodle directly on your canvas.</p>
            <button className="mt-8 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800">Notify Me</button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full shrink-0 overflow-hidden border-r border-slate-200 bg-white">
      {/* Navigation Rail */}
      <div className="w-16 flex flex-col items-center border-r border-slate-100 bg-slate-50 py-4 dark:bg-slate-950 dark:border-slate-800">
        <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg ring-4 ring-sky-500/20">
            <Wand2 size={20} />
        </div>
        
        <div className="flex flex-1 flex-col gap-2">
            {TABS.map(tab => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`group relative flex h-14 w-14 flex-col items-center justify-center transition-all ${
                            isActive ? 'text-sky-600' : 'text-slate-400 hover:text-slate-600'
                        }`}
                        title={tab.label}
                    >
                        {isActive && (
                            <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-sky-600" />
                        )}
                        <tab.icon size={22} className={isActive ? 'scale-110 transition-transform' : 'group-hover:scale-110 transition-transform'} />
                        <span className="mt-1 text-[9px] font-bold uppercase tracking-tight">{tab.label.slice(0, 4)}</span>
                    </button>
                );
            })}
        </div>
        
        <button className="mt-auto h-12 w-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-sky-600 hover:border-sky-200 transition shadow-sm">
            <Plus size={20} />
        </button>
      </div>

      {/* Content Panel */}
      <div className="w-80 flex flex-col bg-slate-50/50 backdrop-blur-3xl overflow-y-auto">
        <div className="p-6">
            {renderTabContent()}
        </div>
      </div>

      <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      <input type="file" ref={backgroundInputRef} onChange={handleBackgroundUpload} accept="image/*" className="hidden" />
    </div>
  );
}

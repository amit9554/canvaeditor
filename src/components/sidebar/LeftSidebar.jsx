import React, { useState, useMemo, useRef } from 'react';
import { 
  Type, Square, Circle, Triangle, Star, Minus, 
  Image as ImageIcon, PaintBucket, Octagon, MoveRight, 
  Aperture, LayoutGrid, Sparkles, Wand2,
  Box, Shapes, UploadCloud, Palette, Pencil, Search,
  Plus, ChevronRight, Download, Frame
} from 'lucide-react';
import { FRAME_SHAPES } from '../../utils/frames';
import { SHAPE_DIVIDERS } from '../../utils/dividers';
import { parseSVG } from '../../utils/svgParser';

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
  { id: 'circle-pro', label: 'Pro Circle', maskShape: 'circle', strokeColor: '#fbbf24', strokeWidth: 6, shadowBlur: 20, shadowOpacity: 0.3 },
  { id: 'rounded-pro', label: 'Pro Square', maskShape: 'rounded', cornerRadius: 32, strokeColor: '#3b82f6', strokeWidth: 4, shadowBlur: 15, shadowOpacity: 0.2 },
  { id: 'mountain-pro', label: 'Mountain', maskPath: 'M0,0 L100,0 L100,100 L85,85 L70,100 L50,80 L30,100 L15,85 L0,100 Z', strokeColor: '#10b981', strokeWidth: 2, shadowBlur: 10 },
  { id: 'wave-pro', label: 'Wave Cut', maskPath: 'M0,0 C20,20 40,0 60,20 C80,40 100,20 100,0 L100,100 L0,100 Z', strokeColor: '#3b82f6', strokeWidth: 0, shadowBlur: 15 },
  { id: 'slant-pro', label: 'Slant Cut', maskPath: 'M0,0 L100,15 L100,100 L0,100 Z', strokeColor: '#f59e0b', strokeWidth: 3, shadowBlur: 12 },
  { id: 'badge-pro', label: 'Gold Badge', maskPath: 'M50,0 L58.8,11.2 L72.7,7.3 L77.3,21.2 L91.2,21.2 L91.2,35.1 L100,43.9 L91.2,52.7 L91.2,66.6 L77.3,66.6 L72.7,80.5 L58.8,76.6 L50,87.8 L41.2,76.6 L27.3,80.5 L22.7,66.6 L8.8,66.6 L8.8,52.7 L0,43.9 L8.8,35.1 L8.8,21.2 L22.7,21.2 L27.3,7.3 L41.2,11.2 Z', strokeColor: '#f59e0b', strokeWidth: 2, shadowBlur: 25 },
  { id: 'stamp-pro', label: 'Post Stamp', maskPath: 'M10,10 L10,0 L20,0 L20,5 A5,5 0 0,0 30,5 L30,0 L40,0 L40,5 A5,5 0 0,0 50,5 L50,0 L60,0 L60,5 A5,5 0 0,0 70,5 L70,0 L80,0 L80,5 A5,5 0 0,0 90,5 L90,0 L100,0 L100,10 L95,10 A5,5 0 0,0 95,20 L100,20 L100,30 L95,30 A5,5 0 0,0 95,40 L100,40 L100,50 L95,50 A5,5 0 0,0 95,60 L100,60 L100,70 L95,70 A5,5 0 0,0 95,80 L100,80 L100,90 L95,90 A5,5 0 0,0 95,100 L100,100 L90,100 L90,95 A5,5 0 0,0 80,95 L80,100 L70,100 L70,95 A5,5 0 0,0 60,95 L60,100 L50,100 L50,95 A5,5 0 0,0 40,95 L40,100 L30,100 L30,95 A5,5 0 0,0 20,95 L20,100 L10,100 L10,90 L15,90 A5,5 0 0,0 15,80 L10,80 L10,70 L15,70 A5,5 0 0,0 15,60 L10,60 L10,50 L15,50 A5,5 0 0,0 15,40 L10,40 L10,30 L15,30 A5,5 0 0,0 15,20 L10,20 L10,10 Z', strokeColor: '#ef4444', strokeWidth: 0, fill: '#fff' }
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

export default function LeftSidebar({ onAddElement, onAddElements, onAddGraphicPreset, selectedElement, onChange, bgColor, onBgColorChange, backgroundImage, onBackgroundImageChange, onDownloadJSON }) {
  const [activeTab, setActiveTab] = useState('templates');
  const [dividerPosition, setDividerPosition] = useState('bottom');
  const [dividerColor, setDividerColor] = useState('#f1f5f9');
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
    { id: 'frames', icon: Frame, label: 'Frames' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'dividers', icon: Minus, label: 'Dividers' },
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
      case 'frames':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Professional Frames</h3>
              <Frame className="text-sky-500" size={20} />
            </div>
            
            <section>
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Premium Presets</h3>
              <div className="grid grid-cols-2 gap-3">
                {FRAME_PRESETS.map((frame) => (
                  <button
                    key={frame.id}
                  onClick={() => {
                    if (selectedElement?.type === 'image' || selectedElement?.type === 'profileImage') {
                      const { id, label, ...frameProps } = frame;
                      onChange({ ...selectedElement, ...frameProps, imageFit: 'cover' });
                    } else {
                      onAddElement('image', { ...frame, imageFit: 'cover' });
                    }
                  }}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-white p-2 transition hover:border-sky-400 hover:shadow-md"
                  >
                    <div className="relative mb-2 h-14 w-14 rounded-lg flex items-center justify-center overflow-hidden border border-slate-100 bg-slate-50">
                        {frame.maskShape === 'circle' ? (
                          <div className="h-10 w-10 rounded-full border-2 border-slate-300 group-hover:border-sky-400 transition-colors" />
                        ) : frame.maskPath ? (
                          <svg viewBox="0 0 100 100" className="w-8 h-8 text-slate-300 group-hover:text-sky-400 fill-current transition-colors">
                            <path d={frame.maskPath} />
                          </svg>
                        ) : (
                          <div className="h-10 w-10 rounded-lg border-2 border-slate-300 group-hover:border-sky-400 transition-colors" />
                        )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-600">{frame.label}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">All Shapes</h3>
              <div className="grid grid-cols-4 gap-2">
                {FRAME_SHAPES.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => onAddElement('image', { maskPath: frame.path, imageFit: 'cover' })}
                    className="group relative flex flex-col items-center justify-center rounded-xl border border-slate-100 bg-white p-2 transition hover:border-sky-300 hover:shadow-md aspect-square"
                  >
                    <svg viewBox={frame.viewBox || "0 0 100 100"} className="w-full h-full text-slate-200 group-hover:text-sky-400 fill-current transition-colors">
                      <path d={frame.path} />
                    </svg>
                  </button>
                ))}
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
      case 'dividers':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Shape Dividers</h3>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                <LayoutGrid size={16} />
              </div>
            </div>
            
            <div className="flex p-1 bg-slate-100 rounded-xl">
              <button 
                onClick={() => setDividerPosition('top')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${dividerPosition === 'top' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Top
              </button>
              <button 
                onClick={() => setDividerPosition('bottom')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${dividerPosition === 'bottom' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Bottom
              </button>
            </div>

            <div className="space-y-3">
               <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Divider Color</h4>
               <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.slice(0, 12).map(color => (
                    <button 
                      key={color} 
                      onClick={() => setDividerColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition ${dividerColor === color ? 'border-sky-500 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
               </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              {SHAPE_DIVIDERS.map((divider) => (
                <button
                  key={divider.id}
                  onClick={() => {
                    if (selectedElement?.type === 'image' || selectedElement?.type === 'profileImage') {
                      onChange({ ...selectedElement, maskPath: divider.path, maskShape: null, imageFit: 'cover' });
                      return;
                    }

                    const h = divider.id === 'book' ? 240 : 120;
                    const w = 1000; // Use 1000 as base width for our paths
                    
                    onAddElement('path', { 
                      data: divider.path, 
                      fill: dividerColor, 
                      width: 1000, 
                      height: h, 
                      scaleX: 1,
                      scaleY: dividerPosition === 'top' ? -1 : 1,
                      x: 0,
                      y: dividerPosition === 'top' ? h : 0,
                      opacity: 1
                    });
                  }}
                  className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-sky-400 hover:shadow-md"
                >
                  <div className="bg-slate-50 p-2 pt-4 min-h-[60px] flex items-center">
                    <svg viewBox={divider.viewBox} className={`w-full h-auto text-slate-300 group-hover:text-slate-400 fill-current transition-transform ${dividerPosition === 'top' ? 'scale-y-[-1]' : ''}`}>
                      <path d={divider.path} />
                    </svg>
                  </div>
                  <div className="px-3 py-2 text-[10px] font-bold text-slate-600 border-t border-slate-100 bg-white">
                    {divider.name}
                  </div>
                </button>
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

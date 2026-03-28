import React, { useMemo, useRef } from 'react';
import { Type, Square, Circle, Triangle, Star, Minus, Image as ImageIcon, PaintBucket, Octagon, MoveRight, Aperture, LayoutGrid, Sparkles, Wand2 } from 'lucide-react';

const SHAPE_TOOLS = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'rectangle', label: 'Rect', icon: Square },
  { type: 'circle', label: 'Circle', icon: Circle },
  { type: 'ellipse', label: 'Ellipse', icon: Aperture },
  { type: 'triangle', label: 'Triangle', icon: Triangle },
  { type: 'star', label: 'Star', icon: Star },
  { type: 'hexagon', label: 'Hex', icon: Octagon },
  { type: 'line', label: 'Line', icon: Minus },
  { type: 'arrow', label: 'Arrow', icon: MoveRight },
];

const FRAME_PRESETS = [
  { label: 'Rounded', frameStyle: 'rounded', frameColor: '#ffffff', accentColor: '#fb7185', strokeColor: '#fecdd3', labelText: 'Featured Shot' },
  { label: 'Polaroid', frameStyle: 'polaroid', frameColor: '#fff7ed', accentColor: '#f97316', strokeColor: '#fdba74', labelText: 'Summer Story' },
  { label: 'Stack', frameStyle: 'stack', frameColor: '#ffffff', accentColor: '#2563eb', strokeColor: '#dbeafe', labelText: 'Mood Board' },
  { label: 'Arch', frameStyle: 'arch', frameColor: '#f8fafc', accentColor: '#14b8a6', strokeColor: '#99f6e4', labelText: 'Portrait' },
];

export default function LeftSidebar({ onAddElement, onAddElements, onAddGraphicPreset, bgColor, onBgColorChange, backgroundImage, onBackgroundImageChange }) {
  const imageInputRef = useRef(null);
  const profileInputRef = useRef(null);
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

  const cardClass = 'rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur';
  const miniButtonClass = 'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700';

  return (
    <div className="w-80 shrink-0 border-r border-slate-200 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.22),_transparent_28%),linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] p-4 shadow-sm z-10 h-full overflow-y-auto">
      <div className="mb-4 rounded-3xl bg-slate-950 px-4 py-4 text-white shadow-xl shadow-slate-900/15">
        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.22em] text-sky-200">
          <Wand2 size={16} />
          Design Lab
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-200">Collage layouts, stylish frames aur ready graphics yahin se insert karo.</p>
      </div>

      <div className="space-y-4">
        <section className={cardClass}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <LayoutGrid size={16} />
            Collage Layouts
          </div>
          <div className="grid grid-cols-1 gap-2">
            {collagePresets.map((preset) => (
              <button key={preset.name} onClick={() => onAddElements(preset.elements, preset.originalSize)} className={miniButtonClass}>
                <div>{preset.name}</div>
                <div className="mt-1 text-xs font-normal text-slate-500">Editable photo slots + decorative accents</div>
              </button>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <ImageIcon size={16} />
            Stylish Frames
          </div>
          <div className="grid grid-cols-2 gap-2">
            {FRAME_PRESETS.map((frame) => (
              <button
                key={frame.label}
                onClick={() => onAddElement('photoFrame', { frameStyle: frame.frameStyle, frameColor: frame.frameColor, accentColor: frame.accentColor, strokeColor: frame.strokeColor, label: frame.labelText })}
                className="rounded-2xl border border-slate-200 bg-white p-3 text-left transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md"
              >
                <div className="text-sm font-semibold text-slate-800">{frame.label}</div>
                <div className="mt-2 h-14 rounded-xl border border-dashed" style={{ backgroundColor: frame.frameColor, borderColor: frame.strokeColor }} />
              </button>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Sparkles size={16} />
            Graphic Pack
          </div>
          <div className="grid grid-cols-1 gap-2">
            <button onClick={() => onAddGraphicPreset('sparkleBurst')} className={miniButtonClass}>Sparkle Burst</button>
            <button onClick={() => onAddGraphicPreset('blobMix')} className={miniButtonClass}>Color Blobs</button>
            <button onClick={() => onAddGraphicPreset('accentLines')} className={miniButtonClass}>Accent Lines</button>
          </div>
        </section>

        <section className={cardClass}>
          <div className="mb-3 text-sm font-semibold text-slate-900">Basic Tools</div>
          <div className="grid grid-cols-3 gap-2">
            {SHAPE_TOOLS.map(({ type, label, icon: Icon }) => (
              <button key={type} onClick={() => onAddElement(type)} className="rounded-2xl border border-slate-200 bg-white px-2 py-3 text-center text-xs font-semibold text-slate-700 transition hover:border-sky-300 hover:bg-sky-50">
                <Icon size={18} className="mx-auto mb-2" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <section className={cardClass}>
          <div className="mb-3 text-sm font-semibold text-slate-900">Images & Canvas</div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => imageInputRef.current?.click()} className={miniButtonClass}>
              Add Image
            </button>
            <button onClick={() => profileInputRef.current?.click()} className={miniButtonClass}>
              Profile Frame
            </button>
            <button onClick={() => backgroundInputRef.current?.click()} className={miniButtonClass}>
              Background
            </button>
            <label className="relative rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700">
              <div className="flex items-center gap-2">
                <PaintBucket size={16} />
                Canvas Color
              </div>
              <input type="color" value={bgColor} onChange={(e) => onBgColorChange(e.target.value)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
            </label>
          </div>
          <div className="mt-3 flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
            <ImageIcon size={16} />
            <span>{backgroundImage?.src ? 'Background image active' : 'No background image yet'}</span>
          </div>
        </section>
      </div>

      <input type="file" ref={imageInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
      <input
        type="file"
        ref={profileInputRef}
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => {
            onAddElement('profileImage', { src: ev.target.result });
            e.target.value = '';
          };
          reader.readAsDataURL(file);
        }}
        accept="image/*"
        className="hidden"
      />
      <input type="file" ref={backgroundInputRef} onChange={handleBackgroundUpload} accept="image/*" className="hidden" />
    </div>
  );
}

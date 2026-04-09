import React from 'react';
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Minus, Plus, Copy, Trash, Lock, Unlock } from 'lucide-react';

const FONT_FAMILIES = [
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { label: 'Manrope', value: "'Manrope', sans-serif" },
  { label: 'Open Sans', value: "'Open Sans', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'DM Serif Display', value: "'DM Serif Display', serif" },
  { label: 'Cormorant Garamond', value: "'Cormorant Garamond', serif" },
  { label: 'Bebas Neue', value: "'Bebas Neue', sans-serif" },
  { label: 'Lora', value: "'Lora', serif" },
  { label: 'Arial', value: 'Arial' },
  { label: 'Georgia', value: 'Georgia' },
];

export default function FloatingToolbar({ selectedElement, onChange, onDelete, onDuplicate }) {
  if (!selectedElement) return null;

  const updateFontSize = (delta) => {
    onChange({
      ...selectedElement,
      fontSize: Math.max(8, (selectedElement.fontSize || 16) + delta),
    });
  };

  const updateTextCase = (mode) => {
    const text = `${selectedElement.text || ''}`;
    let newText = text;
    if (mode === 'upper') newText = text.toUpperCase();
    if (mode === 'lower') newText = text.toLowerCase();
    if (mode === 'title') newText = text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    if (mode === 'sentence') newText = text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (char) => char.toUpperCase());
    
    onChange({ ...selectedElement, text: newText });
  };

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-1 p-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-white/50 animate-in fade-in zoom-in duration-200 flex-nowrap min-w-max whitespace-nowrap">
      {selectedElement.type === 'text' && (
        <>
          {/* Font Family */}
          <select 
            className="h-8 rounded-lg border-none bg-slate-100/50 px-2 py-0 text-xs font-semibold focus:outline-none w-32 cursor-pointer hover:bg-slate-100 transition-colors mr-1"
            value={selectedElement.fontFamily || 'Arial'}
            onChange={(e) => onChange({...selectedElement, fontFamily: e.target.value})}
          >
            {FONT_FAMILIES.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>

          {/* Font Size group */}
          <div className="flex items-center bg-slate-100/50 rounded-lg p-0.5 mr-1">
            <button onClick={() => updateFontSize(-2)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all">
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-xs font-bold text-slate-700">{selectedElement.fontSize || 16}</span>
            <button onClick={() => updateFontSize(2)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm text-slate-600 transition-all">
              <Plus size={14} />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 mx-0.5"></div>

          {/* Formatting group */}
          <div className="flex items-center gap-0.5 px-1">
            <button 
              onClick={() => onChange({...selectedElement, isBold: !selectedElement.isBold})} 
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${selectedElement.isBold ? 'bg-primary/10 text-primary shadow-inner' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Bold size={15} />
            </button>
            <button 
              onClick={() => onChange({...selectedElement, isItalic: !selectedElement.isItalic})} 
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${selectedElement.isItalic ? 'bg-primary/10 text-primary shadow-inner' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Italic size={15} />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 mx-0.5"></div>

          {/* Alignment group */}
          <div className="flex items-center gap-0.5 px-1">
            <button 
              onClick={() => onChange({...selectedElement, align: 'left'})} 
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${(!selectedElement.align || selectedElement.align === 'left') ? 'bg-primary/10 text-primary shadow-inner' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <AlignLeft size={15} />
            </button>
            <button 
              onClick={() => onChange({...selectedElement, align: 'center'})} 
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${selectedElement.align === 'center' ? 'bg-primary/10 text-primary shadow-inner' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <AlignCenter size={15} />
            </button>
            <button 
              onClick={() => onChange({...selectedElement, align: 'right'})} 
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${selectedElement.align === 'right' ? 'bg-primary/10 text-primary shadow-inner' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <AlignRight size={15} />
            </button>
          </div>

          <div className="w-px h-5 bg-slate-200 mx-0.5"></div>

          {/* Case group */}
          <div className="flex items-center gap-1 px-1">
            <button onClick={() => updateTextCase('upper')} className="px-1.5 h-8 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all uppercase">TT</button>
            <button onClick={() => updateTextCase('title')} className="px-1.5 h-8 text-[11px] font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all">Tt</button>
          </div>

          <div className="w-px h-5 bg-slate-200 mx-0.5"></div>
        </>
      )}

      {/* Common tools */}
      <div className="flex items-center gap-1 px-1">
        {/* Color Picker */}
        {['text', 'rectangle', 'circle', 'triangle', 'star', 'path', 'ellipse', 'hexagon'].includes(selectedElement.type) && (
          <div className="relative group mr-1">
            <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden transition-transform group-hover:scale-110 active:scale-95 cursor-pointer ring-1 ring-slate-200">
               <input 
                 type="color" 
                 value={selectedElement.fill || '#000'} 
                 onChange={(e) => onChange({...selectedElement, fill: e.target.value})} 
                 className="w-12 h-12 -ml-2 -mt-2 cursor-pointer" 
               />
            </div>
          </div>
        )}

        <div className="w-px h-5 bg-slate-200 mx-0.5"></div>

        {/* Actions */}
        <button 
          onClick={onDuplicate} 
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
          title="Duplicate"
        >
          <Copy size={15} />
        </button>
        
        <button 
          onClick={() => onChange({...selectedElement, isLocked: !selectedElement.isLocked})} 
          className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all ${selectedElement.isLocked ? 'bg-red-50 text-red-500 shadow-inner' : 'text-slate-500 hover:bg-slate-100'}`}
          title={selectedElement.isLocked ? "Unlock" : "Lock"}
        >
          {selectedElement.isLocked ? <Lock size={15} /> : <Unlock size={15} />}
        </button>

        <button 
          onClick={onDelete} 
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold"
          title="Delete"
        >
          <Trash size={15} />
        </button>
      </div>
    </div>
  );
}

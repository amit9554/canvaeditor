import React, { useRef } from 'react';
import { ArrowUp, ArrowDown, Trash, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Copy, Image as ImageIcon, Eraser, Upload } from 'lucide-react';

const transformTextCase = (text, mode) => {
  const value = `${text || ''}`;

  if (mode === 'upper') return value.toUpperCase();
  if (mode === 'lower') return value.toLowerCase();
  if (mode === 'title') {
    return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  }
  if (mode === 'sentence') {
    return value.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (char) => char.toUpperCase());
  }

  return value;
};

const TEXT_PRESETS = {
  h2: {
    fontSize: 56,
    isBold: true,
    isItalic: false,
    fontFamily: "'Montserrat', sans-serif",
    lineHeight: 1.05,
    letterSpacing: -1,
  },
  h3: {
    fontSize: 42,
    isBold: true,
    isItalic: false,
    fontFamily: "'Montserrat', sans-serif",
    lineHeight: 1.1,
    letterSpacing: -0.6,
  },
  h4: {
    fontSize: 30,
    isBold: true,
    isItalic: false,
    fontFamily: "'Open Sans', sans-serif",
    lineHeight: 1.15,
    letterSpacing: -0.2,
  },
  paragraph: {
    fontSize: 18,
    isBold: false,
    isItalic: false,
    fontFamily: "'Open Sans', sans-serif",
    lineHeight: 1.5,
    letterSpacing: 0,
  },
};

export default function RightPanel({ selectedElement, onChange, onLayerChange, onDelete, onDuplicate, backgroundImage, onBackgroundImageChange }) {
  const elementImageInputRef = useRef(null);

  if (!selectedElement) {
    return (
      <div className="w-72 bg-white border-l shadow-sm text-gray-500 text-sm text-center flex flex-col justify-start shrink-0 z-10 h-full overflow-y-auto">
        <div className="p-4 border-b sticky top-0 bg-white z-20">
          <h3 className="font-semibold text-gray-800">Canvas Settings</h3>
          <p className="text-xs text-gray-500 uppercase mt-1">Background controls</p>
        </div>
        <div className="p-5 space-y-5 text-left">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
            <div className="flex items-center gap-2 text-gray-800">
              <ImageIcon size={16} />
              <span className="text-sm font-medium">Background image</span>
            </div>
            {backgroundImage?.src ? (
              <>
                <div className="aspect-video overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <img src={backgroundImage.src} alt="Background preview" className="h-full w-full object-cover" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold tracking-wide text-gray-700 uppercase">
                    <label>Fade</label>
                    <span>{Math.round((backgroundImage.opacity ?? 1) * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={backgroundImage.opacity ?? 1}
                    onChange={(e) => onBackgroundImageChange({ ...backgroundImage, opacity: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold tracking-wide text-gray-700 uppercase">
                    <label>Blur</label>
                    <span>{backgroundImage.blurRadius || 0}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={backgroundImage.blurRadius || 0}
                    onChange={(e) => onBackgroundImageChange({ ...backgroundImage, blurRadius: Number(e.target.value) })}
                    className="w-full accent-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Fit</label>
                  <select
                    value={backgroundImage.fit || 'cover'}
                    onChange={(e) => onBackgroundImageChange({ ...backgroundImage, fit: e.target.value })}
                    className="w-full border border-gray-200 rounded-md p-2 text-sm bg-white"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                    <option value="fill">Stretch</option>
                  </select>
                </div>
                <button
                  onClick={() => onBackgroundImageChange(null)}
                  className="w-full flex items-center justify-center gap-2 rounded-md bg-red-50 py-2 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Eraser size={16} /> Remove Background Image
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-500 leading-6">Upload a background image to control blur, fade, and fit settings here.</p>
            )}
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 p-4 text-sm text-gray-500 leading-6">
            Select an element to access advanced controls for opacity, blur, collage photo slots, stylish frame colors, path data, and layers.
          </div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;
    if (type === 'number' || type === 'range') finalValue = Number(value);
    
    onChange({
      ...selectedElement,
      [name]: finalValue
    });
  };

  const handleToggle = (propName) => {
    onChange({
      ...selectedElement,
      [propName]: !selectedElement[propName]
    });
  };
  
  const handleAssign = (propName, value) => {
    onChange({
      ...selectedElement,
      [propName]: value
    });
  };

  const handleTextCase = (mode) => {
    onChange({
      ...selectedElement,
      text: transformTextCase(selectedElement.text, mode)
    });
  };

  const handleFontStep = (delta) => {
    onChange({
      ...selectedElement,
      fontSize: Math.max(8, (selectedElement.fontSize || 16) + delta)
    });
  };

  const handleTextPreset = (presetKey) => {
    const preset = TEXT_PRESETS[presetKey];
    if (!preset) return;

    onChange({
      ...selectedElement,
      ...preset,
    });
  };

  return (
    <div className="w-72 bg-white border-l flex flex-col shadow-sm shrink-0 z-10 h-full overflow-y-auto">
      <div className="p-4 border-b sticky top-0 bg-white z-20">
        <h3 className="font-semibold text-gray-800">Element Settings</h3>
        <p className="text-xs text-gray-500 uppercase mt-1">{selectedElement.type}</p>
      </div>

      <div className="p-5 space-y-5 flex-1 pb-20">
        {selectedElement.type === 'text' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Text Content</label>
              <textarea 
                name="text"
                value={selectedElement.text || ''}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3">
               <div className="space-y-1 flex-1">
                 <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Size</label>
                 <input 
                   type="number"
                   name="fontSize"
                   value={selectedElement.fontSize || 20}
                   onChange={handleChange}
                   className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                 />
               </div>
               <div className="space-y-1 flex-1">
                 <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Color</label>
                 <div className="h-[38px] border border-gray-200 rounded-md flex items-center justify-center p-1 w-full overflow-hidden hover:border-gray-300 transition-colors">
                   <input 
                     type="color"
                     name="fill"
                     value={selectedElement.fill || '#000000'}
                     onChange={handleChange}
                     className="w-[150%] h-[150%] cursor-pointer border-none p-0 outline-none"
                   />
                 </div>
               </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Font Family</label>
              <select 
                name="fontFamily"
                value={selectedElement.fontFamily || 'Arial'}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all bg-white"
              >
                <optgroup label="System Fonts">
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Georgia">Georgia</option>
                </optgroup>
                <optgroup label="Google Fonts">
                  <option value="'Roboto', sans-serif">Roboto</option>
                  <option value="'Open Sans', sans-serif">Open Sans</option>
                  <option value="'Lato', sans-serif">Lato</option>
                  <option value="'Montserrat', sans-serif">Montserrat</option>
                  <option value="'Oswald', sans-serif">Oswald</option>
                  <option value="'Raleway', sans-serif">Raleway</option>
                  <option value="'Playfair Display', serif">Playfair Display</option>
                  <option value="'Merriweather', serif">Merriweather</option>
                  <option value="'Ubuntu', sans-serif">Ubuntu</option>
                  <option value="'Lora', serif">Lora</option>
                </optgroup>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase mb-2 block">Text Style</label>
              <div className="flex bg-gray-100 p-1 rounded-md border border-gray-200">
                 <button onClick={() => handleToggle('isBold')} className={`p-1.5 rounded flex-1 flex justify-center transition-all ${selectedElement.isBold ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800'}`}><Bold size={16} /></button>
                 <button onClick={() => handleToggle('isItalic')} className={`p-1.5 rounded flex-1 flex justify-center transition-all ${selectedElement.isItalic ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800'}`}><Italic size={16} /></button>
                 <div className="w-px bg-gray-300 mx-1 my-1"></div>
                 <button onClick={() => handleAssign('align', 'left')} className={`p-1.5 rounded flex-1 flex justify-center transition-all ${(!selectedElement.align || selectedElement.align === 'left') ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800'}`}><AlignLeft size={16} /></button>
                 <button onClick={() => handleAssign('align', 'center')} className={`p-1.5 rounded flex-1 flex justify-center transition-all ${(selectedElement.align === 'center') ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800'}`}><AlignCenter size={16} /></button>
                 <button onClick={() => handleAssign('align', 'right')} className={`p-1.5 rounded flex-1 flex justify-center transition-all ${(selectedElement.align === 'right') ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-800'}`}><AlignRight size={16} /></button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Text Presets</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleTextPreset('h2')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">H2 Heading</button>
                <button onClick={() => handleTextPreset('h3')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">H3 Heading</button>
                <button onClick={() => handleTextPreset('h4')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">H4 Heading</button>
                <button onClick={() => handleTextPreset('paragraph')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">Paragraph</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Quick Text Tools</label>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleTextCase('upper')} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">UPPERCASE</button>
                <button onClick={() => handleTextCase('lower')} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">lowercase</button>
                <button onClick={() => handleTextCase('title')} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">Title Case</button>
                <button onClick={() => handleTextCase('sentence')} className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-blue-50 hover:text-blue-700">Sentence case</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handleFontStep(-2)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">A- Small</button>
                <button onClick={() => handleFontStep(2)} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">A+ Large</button>
              </div>
            </div>
          </div>
        )}

        {['rectangle', 'circle', 'ellipse', 'triangle', 'hexagon', 'star', 'line', 'arrow'].includes(selectedElement.type) && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">{['line', 'arrow'].includes(selectedElement.type) ? 'Stroke Color' : 'Fill Color'}</label>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 border border-gray-200 rounded-md flex items-center justify-center p-1 overflow-hidden hover:border-gray-300 transition-colors">
                  <input 
                    type="color"
                    name="fill"
                    value={selectedElement.fill || '#3B82F6'}
                    onChange={handleChange}
                    className="w-[150%] h-[150%] cursor-pointer border-none p-0 outline-none"
                  />
                </div>
                <span className="text-sm font-mono text-gray-600 uppercase bg-gray-50 px-2 py-1 rounded border border-gray-100">{selectedElement.fill || '#3B82F6'}</span>
              </div>
            </div>

            {!['line', 'arrow'].includes(selectedElement.type) && (
              <div className="space-y-1 pt-2">
                 <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Border Color (Stroke)</label>
                 <div className="flex items-center gap-3">
                   <div className="h-10 w-10 border border-gray-200 rounded-md flex items-center justify-center p-1 overflow-hidden hover:border-gray-300 transition-colors">
                     <input 
                       type="color"
                       name="strokeColor"
                       value={selectedElement.strokeColor || '#000000'}
                       onChange={handleChange}
                       className="w-[150%] h-[150%] cursor-pointer border-none p-0 outline-none"
                     />
                   </div>
                   <span className="text-sm font-mono text-gray-600 uppercase bg-gray-50 px-2 py-1 rounded border border-gray-100">{selectedElement.strokeColor || '#000000'}</span>
                 </div>
              </div>
            )}
            
            {!['line', 'arrow'].includes(selectedElement.type) && (
              <div className="space-y-1">
                 <div className="flex justify-between items-center mb-1">
                   <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Border Width</label>
                   <span className="text-[10px] text-gray-500 font-medium">{selectedElement.strokeWidth || 0}px</span>
                 </div>
                 <input 
                   type="range"
                   name="strokeWidth"
                   min="0"
                   max="40"
                   step="1"
                   value={selectedElement.strokeWidth || 0}
                   onChange={handleChange}
                   className="w-full accent-primary"
                 />
              </div>
            )}
            
            {selectedElement.type === 'rectangle' && (
              <div className="space-y-1">
                 <div className="flex justify-between items-center mb-1">
                   <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Corner Radius</label>
                   <span className="text-[10px] text-gray-500 font-medium">{selectedElement.cornerRadius || 0}px</span>
                 </div>
                 <input 
                   type="range"
                   name="cornerRadius"
                   min="0"
                   max="150"
                   step="1"
                   value={selectedElement.cornerRadius || 0}
                   onChange={handleChange}
                   className="w-full accent-primary"
                 />
              </div>
            )}

            {selectedElement.type === 'arrow' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Arrow Head Length</label>
                    <span className="text-[10px] text-gray-500 font-medium">{selectedElement.pointerLength || 28}px</span>
                  </div>
                  <input type="range" name="pointerLength" min="10" max="80" step="1" value={selectedElement.pointerLength || 28} onChange={handleChange} className="w-full accent-primary" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Arrow Head Width</label>
                    <span className="text-[10px] text-gray-500 font-medium">{selectedElement.pointerWidth || 24}px</span>
                  </div>
                  <input type="range" name="pointerWidth" min="10" max="80" step="1" value={selectedElement.pointerWidth || 24} onChange={handleChange} className="w-full accent-primary" />
                </div>
              </div>
            )}
          </div>
        )}

        {['image', 'profileImage'].includes(selectedElement.type) && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Image Fit</label>
              <select
                name="imageFit"
                value={selectedElement.imageFit || 'fill'}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md p-2 text-sm bg-white"
              >
                <option value="fill">Stretch</option>
                <option value="contain">Contain</option>
                <option value="cover">Cover</option>
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Blur</label>
                <span className="text-[10px] text-gray-500 font-medium">{selectedElement.blurRadius || 0}px</span>
              </div>
              <input type="range" name="blurRadius" min="0" max="40" step="1" value={selectedElement.blurRadius || 0} onChange={handleChange} className="w-full accent-primary" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Rounded Corners</label>
                <span className="text-[10px] text-gray-500 font-medium">{selectedElement.cornerRadius || 0}px</span>
              </div>
              <input type="range" name="cornerRadius" min="0" max="150" step="1" value={selectedElement.cornerRadius || 0} onChange={handleChange} className="w-full accent-primary" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Mask Shape</label>
              <select
                name="maskShape"
                value={selectedElement.maskShape || 'none'}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md p-2 text-sm bg-white"
              >
                <option value="none">None</option>
                <option value="rounded">Rounded Rectangle</option>
                <option value="circle">Circle Frame</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Border</label>
                <div className="h-[38px] border border-gray-200 rounded-md flex items-center justify-center p-1 overflow-hidden">
                  <input type="color" name="strokeColor" value={selectedElement.strokeColor || '#ffffff'} onChange={handleChange} className="w-[150%] h-[150%] cursor-pointer border-none p-0 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Border Width</label>
                <input type="number" name="strokeWidth" min="0" max="40" value={selectedElement.strokeWidth || 0} onChange={handleChange} className="w-full border border-gray-200 rounded-md p-2 text-sm" />
              </div>
            </div>
          </div>
        )}

        {selectedElement.type === 'photoFrame' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Frame Image</label>
              <button
                onClick={() => elementImageInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-gray-50 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <Upload size={16} />
                {selectedElement.src ? 'Replace Photo' : 'Upload Photo'}
              </button>
              <input
                ref={elementImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    onChange({ ...selectedElement, src: ev.target.result });
                    e.target.value = '';
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Caption</label>
              <input
                type="text"
                name="label"
                value={selectedElement.label || ''}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md p-2 text-sm"
                placeholder="Frame label"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Frame Style</label>
              <select
                name="frameStyle"
                value={selectedElement.frameStyle || 'rounded'}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md p-2 text-sm bg-white"
              >
                <option value="rounded">Rounded</option>
                <option value="polaroid">Polaroid</option>
                <option value="stack">Stack</option>
                <option value="arch">Arch</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Image Fit</label>
              <select
                name="imageFit"
                value={selectedElement.imageFit || 'cover'}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md p-2 text-sm bg-white"
              >
                <option value="fill">Stretch</option>
                <option value="contain">Contain</option>
                <option value="cover">Cover</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Frame</label>
                <div className="h-[38px] border border-gray-200 rounded-md flex items-center justify-center p-1 overflow-hidden">
                  <input type="color" name="frameColor" value={selectedElement.frameColor || '#ffffff'} onChange={handleChange} className="w-[150%] h-[150%] cursor-pointer border-none p-0 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Accent</label>
                <div className="h-[38px] border border-gray-200 rounded-md flex items-center justify-center p-1 overflow-hidden">
                  <input type="color" name="accentColor" value={selectedElement.accentColor || '#f59e0b'} onChange={handleChange} className="w-[150%] h-[150%] cursor-pointer border-none p-0 outline-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Border</label>
                <div className="h-[38px] border border-gray-200 rounded-md flex items-center justify-center p-1 overflow-hidden">
                  <input type="color" name="strokeColor" value={selectedElement.strokeColor || '#e5e7eb'} onChange={handleChange} className="w-[150%] h-[150%] cursor-pointer border-none p-0 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Border Width</label>
                <input type="number" name="strokeWidth" min="0" max="40" value={selectedElement.strokeWidth || 0} onChange={handleChange} className="w-full border border-gray-200 rounded-md p-2 text-sm" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Corner Radius</label>
                <span className="text-[10px] text-gray-500 font-medium">{selectedElement.cornerRadius || 0}px</span>
              </div>
              <input type="range" name="cornerRadius" min="0" max="120" step="1" value={selectedElement.cornerRadius || 0} onChange={handleChange} className="w-full accent-primary" />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Blur</label>
                <span>{selectedElement.blurRadius || 0}px</span>
              </div>
              <input type="range" name="blurRadius" min="0" max="40" step="1" value={selectedElement.blurRadius || 0} onChange={handleChange} className="w-full accent-primary" />
            </div>
          </div>
        )}

        {selectedElement.type === 'path' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">SVG Path Data</label>
              <textarea
                name="data"
                value={selectedElement.data || ''}
                onChange={handleChange}
                rows={6}
                className="w-full border border-gray-200 rounded-md p-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Fill</label>
                <div className="h-[38px] border border-gray-200 rounded-md flex items-center justify-center p-1 overflow-hidden">
                  <input type="color" name="fill" value={selectedElement.fill || '#000000'} onChange={handleChange} className="w-[150%] h-[150%] cursor-pointer border-none p-0 outline-none" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Stroke</label>
                <div className="h-[38px] border border-gray-200 rounded-md flex items-center justify-center p-1 overflow-hidden">
                  <input type="color" name="strokeColor" value={selectedElement.strokeColor || '#000000'} onChange={handleChange} className="w-[150%] h-[150%] cursor-pointer border-none p-0 outline-none" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Stroke Width</label>
                <span className="text-[10px] text-gray-500 font-medium">{selectedElement.strokeWidth || 0}px</span>
              </div>
              <input type="range" name="strokeWidth" min="0" max="40" step="1" value={selectedElement.strokeWidth || 0} onChange={handleChange} className="w-full accent-primary" />
            </div>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Shadow Blur</label>
              <span className="text-[10px] text-gray-500 font-medium">{selectedElement.shadowBlur || 0}px</span>
            </div>
            <input type="range" name="shadowBlur" min="0" max="40" step="1" value={selectedElement.shadowBlur || 0} onChange={handleChange} className="w-full accent-primary" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Shadow Opacity</label>
              <span className="text-[10px] text-gray-500 font-medium">{Math.round((selectedElement.shadowOpacity ?? 0.25) * 100)}%</span>
            </div>
            <input type="range" name="shadowOpacity" min="0" max="1" step="0.05" value={selectedElement.shadowOpacity ?? 0.25} onChange={handleChange} className="w-full accent-primary" />
          </div>
        </div>

        <div className="space-y-1 pt-4 border-t border-gray-100">
           <div className="flex justify-between items-center mb-1">
             <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Opacity</label>
             <span className="text-[10px] text-gray-500 font-medium">{Math.round((selectedElement.opacity ?? 1) * 100)}%</span>
           </div>
           <input 
             type="range"
             name="opacity"
             min="0"
             max="1"
             step="0.05"
             value={selectedElement.opacity ?? 1}
             onChange={handleChange}
             className="w-full accent-primary"
           />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">X</label>
            <input type="number" name="x" value={Math.round(selectedElement.x || 0)} onChange={handleChange} className="w-full border border-gray-200 rounded-md p-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Y</label>
            <input type="number" name="y" value={Math.round(selectedElement.y || 0)} onChange={handleChange} className="w-full border border-gray-200 rounded-md p-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Width</label>
            <input type="number" name="width" value={Math.round(selectedElement.width || 0)} onChange={handleChange} className="w-full border border-gray-200 rounded-md p-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Height</label>
            <input type="number" name="height" value={Math.round(selectedElement.height || 0)} onChange={handleChange} className="w-full border border-gray-200 rounded-md p-2 text-sm" />
          </div>
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase">Rotation</label>
            <input type="range" name="rotation" min="-180" max="180" step="1" value={selectedElement.rotation || 0} onChange={handleChange} className="w-full accent-primary" />
          </div>
        </div>
        
        <div className="pt-5 border-t border-gray-100">
          <label className="text-xs font-semibold tracking-wide text-gray-700 uppercase mb-3 block">Layers & Actions</label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button 
              onClick={() => onLayerChange('forward')}
              className="flex justify-center items-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors"
            >
              <ArrowUp size={14} /> Forward
            </button>
            <button 
              onClick={() => onLayerChange('backward')}
              className="flex justify-center items-center gap-1.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-md text-xs font-medium transition-colors"
            >
              <ArrowDown size={14} /> Backward
            </button>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={onDuplicate}
              className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md text-sm font-medium transition-colors"
            >
              <Copy size={16} /> Duplicate
            </button>
            <button 
              onClick={onDelete}
              className="flex-1 flex justify-center items-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md text-sm font-medium transition-colors"
            >
              <Trash size={16} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

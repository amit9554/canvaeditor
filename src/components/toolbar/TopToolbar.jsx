import React, { useRef } from 'react';
import { Save, Download, Trash2, Image as ImageIcon, Undo2, Redo2, Upload } from 'lucide-react';

export default function TopToolbar({ onSave, onDownload, onDownloadSVG, onDownloadImage, onClear, templateSizes, templateSize, setTemplateSize, onUndo, onRedo, canUndo, canRedo, onLoadJSON, onDownloadFabricJSON }) {
  const jsonInputRef = useRef(null);

  const handleJSONFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onLoadJSON(file);
      e.target.value = ''; // reset so same file can be re-uploaded
    }
  };
  return (
    <div className="h-14 bg-white border-b flex items-center justify-between px-6 shadow-sm shrink-0">
      <div className="font-bold text-xl text-primary flex items-center gap-4">
        webnexEditor
        <div className="h-6 w-px bg-gray-300"></div>
        <select 
          value={templateSize.id}
          onChange={(e) => setTemplateSize(templateSizes[e.target.value])}
          className="text-sm border rounded bg-gray-50 text-gray-700 py-1 px-2 focus:outline-primary outline-none"
        >
          {Object.entries(templateSizes).map(([key, item]) => (
             <option key={key} value={key}>{item.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-4 items-center">
        <div className="flex gap-1 border-r pr-4">
          <button 
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${canUndo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300'}`}
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          <button 
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${canRedo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300'}`}
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
        </div>
        <button 
          onClick={onClear}
          className="flex items-center gap-2 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors text-sm font-medium"
        >
          <Trash2 size={16} /> Clear Canvas
        </button>
        <button 
          onClick={onDownloadImage}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium border border-gray-200 shadow-sm"
        >
          <ImageIcon size={16} /> PNG
        </button>
        <button 
          onClick={onDownloadSVG}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium border border-gray-200 shadow-sm"
        >
          <ImageIcon size={16} /> SVG
        </button>
        <button 
          onClick={onDownload}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium"
        >
          <Download size={16} /> JSON
        </button>
        <button 
          onClick={onDownloadFabricJSON}
          className="flex items-center gap-2 px-3 py-1.5 text-purple-700 hover:bg-purple-50 rounded-md transition-colors text-sm font-medium border border-purple-200 shadow-sm"
          title="Download as Fabric.js compatible JSON"
        >
          <Download size={16} /> Fabric JSON
        </button>
        <input
          ref={jsonInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleJSONFileChange}
        />
        <button 
          onClick={() => jsonInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium border border-gray-200 shadow-sm"
          title="Upload JSON template"
        >
          <Upload size={16} /> Upload JSON
        </button>
        <button 
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white hover:bg-blue-600 rounded-md transition-colors text-sm font-medium"
        >
          <Save size={16} /> Save Template
        </button>
      </div>
    </div>
  );
}

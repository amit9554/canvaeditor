import React, { useRef } from 'react';
import { Save, Download, Trash2, Image as ImageIcon, Undo2, Redo2, Upload } from 'lucide-react';

export default function TopToolbar({ 
  onSave, 
  onDownload, 
  onDownloadSVG, 
  onDownloadFabricSVG,
  onDownloadImage, 
  onClear, 
  templateSizes, 
  templateSize, 
  setTemplateSize, 
  onUndo, 
  onRedo, 
  canUndo, 
  canRedo, 
  onLoadJSON, 
  onDownloadFabricJSON,
  lastUpdated
}) {
  const jsonInputRef = useRef(null);

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleJSONFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onLoadJSON(file);
      e.target.value = ''; // reset so same file can be re-uploaded
    }
  };

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm shrink-0">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <span className="font-bold text-xl text-primary leading-tight">webnexEditor</span>
          {lastUpdated && (
            <span className="text-[10px] text-gray-500 font-medium">
              Last update: {formatLastUpdated(lastUpdated)}
            </span>
          )}
        </div>
        
        <div className="h-8 w-px bg-gray-200"></div>
        
        <select 
          value={templateSize.id}
          onChange={(e) => setTemplateSize(templateSizes[e.target.value])}
          className="text-sm border border-gray-200 rounded-md bg-gray-50 text-gray-700 py-1.5 px-3 focus:outline-primary outline-none hover:border-gray-300 transition-colors"
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
          <Trash2 size={16} /> Clear
        </button>

        <div className="h-6 w-px bg-gray-200"></div>

        <div className="flex gap-2">
          <button 
            onClick={onDownloadImage}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium border border-gray-200 shadow-sm"
            title="Download PNG"
          >
            <ImageIcon size={16} /> PNG
          </button>
          <button 
            onClick={onDownloadSVG}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium border border-gray-200 shadow-sm"
            title="Standard SVG Download"
          >
            <ImageIcon size={16} /> SVG
          </button>
          <button 
            onClick={onDownloadFabricSVG}
            className="flex items-center gap-2 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors text-sm font-medium border border-emerald-200 shadow-sm"
            title="Download Fabric.js compatible SVG"
          >
            <Download size={16} /> Fabric SVG
          </button>
        </div>

        <div className="h-6 w-px bg-gray-200"></div>

        <div className="flex gap-2">
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
            <Upload size={16} /> Upload
          </button>
        </div>

        <button 
          onClick={onSave}
          className="flex items-center gap-2 px-4 py-1.5 bg-primary text-white hover:bg-blue-600 rounded-md shadow-sm transition-colors text-sm font-medium"
        >
          <Save size={16} /> Save
        </button>
      </div>
    </div>
  );
}

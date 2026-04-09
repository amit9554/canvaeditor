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
    <div className="h-14 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-5 sticky top-0 z-50 shadow-sm shrink-0">
      <div className="flex items-center gap-5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <span className="font-bold text-lg select-none">W</span>
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight leading-none">webnexEditor</span>
          </div>
          {lastUpdated && (
            <span className="text-[9px] text-gray-400 font-medium ml-9 -mt-0.5">
              Updated: {formatLastUpdated(lastUpdated)}
            </span>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200"></div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <select
              value={templateSize.id}
              onChange={(e) => setTemplateSize(templateSizes[e.target.value])}
              className="text-xs font-semibold border border-gray-200 rounded-lg bg-gray-50/50 text-gray-700 py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary border-none bg-gray-100/50 hover:bg-gray-100 transition-all cursor-pointer appearance-none min-w-[180px]"
            >
              {Object.entries(templateSizes).map(([key, item]) => (
                <option key={key} value={key}>{item.name}</option>
              ))}
            </select>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-gray-600 transition-colors">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>

          {(templateSize.id === 'custom' || templateSize.id === 'logo') && (
            <div className="flex items-center gap-1.5 bg-gray-100/50 p-0.5 rounded-lg border border-gray-100 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center">
                <div className="flex items-center px-1.5 h-7">
                  <span className="text-[10px] font-bold text-gray-400 select-none">W</span>
                </div>
                <input
                  type="number"
                  value={templateSize.width}
                  onChange={(e) => setTemplateSize({ ...templateSize, width: parseInt(e.target.value) || 0 })}
                  className="w-14 h-7 text-[11px] bg-white border-none rounded-md py-0 px-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-gray-700 text-center shadow-sm"
                  placeholder="W"
                />
              </div>
              <div className="text-gray-300 font-light select-none">×</div>
              <div className="flex items-center">
                <input
                  type="number"
                  value={templateSize.height}
                  onChange={(e) => setTemplateSize({ ...templateSize, height: parseInt(e.target.value) || 0 })}
                  className="w-14 h-7 text-[11px] bg-white border-none rounded-md py-0 px-2 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-gray-700 text-center shadow-sm"
                  placeholder="H"
                />
                <div className="flex items-center px-1.5 h-7">
                  <span className="text-[10px] font-bold text-gray-400 select-none">H</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* History Group */}
        <div className="flex items-center bg-gray-100/50 p-0.5 rounded-lg border border-gray-100">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-all ${canUndo ? 'text-gray-700 hover:bg-white hover:shadow-sm' : 'text-gray-300'}`}
            title="Undo"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-all ${canRedo ? 'text-gray-700 hover:bg-white hover:shadow-sm' : 'text-gray-300'}`}
            title="Redo"
          >
            <Redo2 size={15} />
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200 shrink-0"></div>

        <button
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-semibold"
        >
          <Trash2 size={14} />
          <span className="max-[1100px]:hidden">Clear</span>
        </button>

        <div className="h-5 w-px bg-gray-200 shrink-0"></div>

        {/* Export Group */}
        <div className="flex items-center gap-1.5 bg-gray-100/50 p-1 rounded-xl border border-gray-100">
          <button
            onClick={onDownloadImage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-all text-[11px] font-bold shadow-sm border border-gray-100"
          >
            <ImageIcon size={14} className="text-blue-500" /> PNG
          </button>
          <button
            onClick={onDownloadSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-all text-[11px] font-bold shadow-sm border border-gray-100"
          >
            <ImageIcon size={14} className="text-orange-500" /> SVG
          </button>
          <button
            onClick={onDownloadFabricSVG}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-all text-[11px] font-bold border border-emerald-100"
          >
            <Download size={14} /> Fabric SVG
          </button>
          <button
            onClick={onDownload}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-all text-[11px] font-bold border border-indigo-100"
          >
            <Download size={14} /> Project JSON
          </button>
          <button
            onClick={onDownloadFabricJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg transition-all text-[11px] font-bold border border-purple-100"
          >
            <Download size={14} /> Fabric JSON
          </button>
        </div>

        <div className="h-5 w-px bg-gray-200 shrink-0"></div>

        {/* File Group */}
        <div className="flex items-center gap-2">
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleJSONFileChange}
          />
          <button
            onClick={() => jsonInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-xs font-semibold"
          >
            <Upload size={14} /> Upload
          </button>

          <button
            onClick={onSave}
            className="flex items-center gap-2 px-5 py-1.5 bg-primary text-white hover:bg-blue-600 rounded-lg shadow-lg shadow-primary/20 transition-all text-xs font-bold active:scale-95"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
        </div>
      </div>
    </div>
  );
}

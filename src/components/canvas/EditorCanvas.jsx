import React, { useRef, useState, useEffect } from 'react';
import Konva from 'konva';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import { ElementNode } from './Elements';
import FloatingToolbar from './FloatingToolbar';

export default function EditorCanvas({ 
  stageRef,
  elements, 
  setElements, 
  selectedId, 
  selectElement, 
  bgColor,
  backgroundImage,
  templateSize,
  onDelete,
  onDuplicate
}) {
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });
  const containerRef = useRef(null);
  const bgImageRef = useRef(null);
  const [bgImage, setBgImage] = useState(null);

  const selectedElement = elements.find(el => el.id === selectedId);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    // Re-check after a tiny delay in case sidebars shifted
    setTimeout(updateSize, 100);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!backgroundImage?.src) {
      setBgImage(null);
      return;
    }

    const img = new window.Image();
    img.onload = () => setBgImage(img);
    img.src = backgroundImage.src;
  }, [backgroundImage?.src]);

  useEffect(() => {
    if (!bgImageRef.current) return;
    if (backgroundImage?.blurRadius > 0) {
      bgImageRef.current.cache();
    } else {
      bgImageRef.current.clearCache();
    }
    bgImageRef.current.getLayer()?.batchDraw();
  }, [backgroundImage?.blurRadius, bgImage, templateSize.width, templateSize.height]);

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.name() === 'bgRect';
    if (clickedOnEmpty) {
      selectElement(null);
    }
  };

  const handleChange = (id, newProps) => {
    const nodeIndex = elements.findIndex(el => el.id === id);
    if (nodeIndex > -1) {
      const newElements = [...elements];
      newElements[nodeIndex] = { ...newElements[nodeIndex], ...newProps };
      setElements(newElements);
    }
  };

  // Determine scaling so template fits in container
  const PADDING = 140;
  const scaleX = Math.max(0.1, (containerSize.width - PADDING) / templateSize.width);
  const scaleY = Math.max(0.1, (containerSize.height - PADDING) / templateSize.height);
  const scale = Math.min(scaleX, scaleY, 1); // Avoid zooming IN beyond 100% usually, or allow it? Let's allow up to 2x or 1x.
  const finalScale = Math.min(scale, 1.5); 

  // Calculate centered position
  const stageWidth = templateSize.width * finalScale;
  const stageHeight = templateSize.height * finalScale;
  
  return (
    <div 
      className="flex-1 w-full h-full relative overflow-auto bg-gray-200 flex flex-col items-center px-8 pt-4 pb-16"
      onKeyDown={(e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
           if(onDelete) {
             onDelete(selectedId);
           } else {
             setElements(elements.filter(el => el.id !== selectedId));
           }
           selectElement(null);
        }
      }}
      tabIndex={0}
      ref={containerRef}
    >
      {/* Floating Toolbar Space */}
      <div className="h-16 w-full flex-shrink-0 relative">
        <FloatingToolbar 
          selectedElement={selectedElement}
          onChange={(newProps) => handleChange(selectedId, newProps)}
          onDelete={() => onDelete && onDelete(selectedId)}
          onDuplicate={() => onDuplicate && onDuplicate(selectedId)}
        />
      </div>

      <div 
        className="relative z-10 bg-white shadow-xl overflow-visible mt-4" 
        style={{ 
          width: stageWidth, 
          height: stageHeight,
          transition: 'width 0.3s, height 0.3s'
        }}
      >
        <Stage
          ref={stageRef}
          width={stageWidth}
          height={stageHeight}
          scaleX={finalScale}
          scaleY={finalScale}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            {/* Background */}
            <Rect 
              x={0} 
              y={0} 
              width={templateSize.width} 
              height={templateSize.height} 
              fill={bgColor} 
              name="bgRect"
            />
            {bgImage && (
              <KonvaImage
                ref={bgImageRef}
                x={0}
                y={0}
                width={templateSize.width}
                height={templateSize.height}
                image={bgImage}
                opacity={backgroundImage?.opacity ?? 1}
                listening={false}
                filters={backgroundImage?.blurRadius > 0 ? [Konva.Filters.Blur] : []}
                blurRadius={backgroundImage?.blurRadius || 0}
                crop={
                  backgroundImage?.fit === 'cover'
                    ? (() => {
                        const frameRatio = templateSize.width / templateSize.height;
                        const imageRatio = bgImage.width / bgImage.height;
                        if (imageRatio > frameRatio) {
                          const cropWidth = bgImage.height * frameRatio;
                          return { x: (bgImage.width - cropWidth) / 2, y: 0, width: cropWidth, height: bgImage.height };
                        }
                        const cropHeight = bgImage.width / frameRatio;
                        return { x: 0, y: (bgImage.height - cropHeight) / 2, width: bgImage.width, height: cropHeight };
                      })()
                    : undefined
                }
              />
            )}
            {elements.map((el) => {
              return (
                <ElementNode
                  key={el.id}
                  shapeProps={el}
                  isSelected={el.id === selectedId}
                  onSelect={() => selectElement(el.id)}
                  onChange={(newProps) => handleChange(el.id, newProps)}
                  onDelete={() => onDelete && onDelete(el.id)}
                  onDuplicate={() => onDuplicate && onDuplicate(el.id)}
                />
              );
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}

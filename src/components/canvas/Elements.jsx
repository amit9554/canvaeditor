import React, { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { Text, Rect, Circle, Ellipse, RegularPolygon, Line, Star, Path, Image as KonvaImage, Transformer, Group, Arrow } from 'react-konva';
import { Html } from 'react-konva-utils';
import { Copy, Trash, Lock, Unlock, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Minus, Plus } from 'lucide-react';
import { getTextBoxWidth } from '../../utils/textLayout';

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

export const ElementNode = ({ shapeProps, isSelected, onSelect, onChange, onDelete, onDuplicate }) => {
  const shapeRef = useRef();
  const trRef = useRef();
  const textareaRef = useRef();
  const textEditActionRef = useRef('save');
  const [image, setImage] = useState(null);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [isEditingText, setIsEditingText] = useState(false);
  const [draftText, setDraftText] = useState(shapeProps.text || '');

  useEffect(() => {
    if (shapeProps.type === 'text') {
      setDraftText(shapeProps.text || '');
    }
  }, [shapeProps.text, shapeProps.type]);

  useEffect(() => {
    if (isSelected && !shapeProps.isLocked && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected, image, shapeProps.isLocked]);

  useEffect(() => {
    if (['image', 'profileImage', 'photoFrame'].includes(shapeProps.type) && shapeProps.src) {
      const img = new window.Image();
      img.onload = () => setImage(img);
      img.onerror = (e) => console.error('Image load error:', e);
      img.src = shapeProps.src;
    } else {
      setImage(null);
    }
  }, [shapeProps.src, shapeProps.type]);

  const handleDragEnd = (e) => {
    onChange({
      ...shapeProps,
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransform = (e) => {
    const node = shapeRef.current;
    if (shapeProps.type === 'text') {
      const scaleX = node.scaleX();
      const anchor = trRef.current?.getActiveAnchor();
      
      // If it's a side handle, update width and reset scale in real-time for wrapping effect
      if (anchor === 'middle-right' || anchor === 'middle-left') {
        const newWidth = Math.max(5, node.width() * scaleX);
        node.width(newWidth);
        node.scaleX(1);
        node.scaleY(1);
      }
    }
  };

  const handleTransformEnd = (e) => {
    const node = shapeRef.current;
    let newProps = {
      ...shapeProps,
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
    };

    if (shapeProps.type === 'text') {
      const scaleX = node.scaleX();
      const anchor = trRef.current?.getActiveAnchor();
      
      // Reset scale to keep text sharp and maintain logic
      node.scaleX(1);
      node.scaleY(1);

      const newWidth = Math.max(5, node.width() * scaleX);
      let newFontSize = shapeProps.fontSize;

      // If it's NOT a side handle, it's a corner handle drag -> update fontSize
      if (anchor && anchor !== 'middle-right' && anchor !== 'middle-left') {
        newFontSize = Math.round(shapeProps.fontSize * scaleX);
      }
      
      newProps = {
        ...newProps,
        width: newWidth,
        fontSize: newFontSize,
      };
    } else {
      const baseWidth = shapeProps.width || node.width() || 1;
      const baseHeight = shapeProps.height || node.height() || 1;
      newProps.width = Math.max(5, baseWidth * node.scaleX());
      newProps.height = Math.max(5, baseHeight * node.scaleY());
      // Reset scale after applying to width/height
      node.scaleX(1);
      node.scaleY(1);
    }
    
    onChange(newProps);
  };

  useEffect(() => {
    if (shapeProps.blurRadius > 0 && shapeRef.current?.cache) {
      shapeRef.current.cache();
      shapeRef.current.getLayer()?.batchDraw();
    } else if (shapeRef.current?.clearCache) {
      shapeRef.current.clearCache();
      shapeRef.current.getLayer()?.batchDraw();
    }
  }, [shapeProps.blurRadius, image, shapeProps.width, shapeProps.height, shapeProps.maskShape, shapeProps.cornerRadius]);

  useEffect(() => {
    if (!isSelected || !shapeRef.current) return;

    const updateToolbarPosition = () => {
      const node = shapeRef.current;
      const box = node.getClientRect({ skipShadow: false, skipStroke: false });
      const stage = node.getStage();
      if (!stage) return;

      const stageWidth = stage.width() / (stage.scaleX() || 1);
      const centeredX = box.x + box.width / 2;
      const topY = box.y - 28;
      const sidePadding = Math.max(40, Math.min(180, (stageWidth / 2) - 24));

      setToolbarPosition({
        x: Math.max(sidePadding, Math.min(stageWidth - sidePadding, centeredX)),
        y: topY,
      });
    };

    const rafId = window.requestAnimationFrame(updateToolbarPosition);
    return () => window.cancelAnimationFrame(rafId);
  }, [
    isSelected,
    shapeProps.x,
    shapeProps.y,
    shapeProps.width,
    shapeProps.height,
    shapeProps.rotation,
    shapeProps.scaleX,
    shapeProps.scaleY,
    shapeProps.text,
    shapeProps.fontSize,
    shapeProps.type,
  ]);

  const commonProps = {
    onClick: onSelect,
    onTap: onSelect,
    ref: shapeRef,
    ...shapeProps,
    draggable: !shapeProps.isLocked,
    onDragEnd: handleDragEnd,
    onTransform: handleTransform,
    onTransformEnd: handleTransformEnd,
  };

  const getFontStyle = () => {
    let style = '';
    if (shapeProps.isItalic) style += 'italic ';
    if (shapeProps.isBold) style += 'bold';
    return style.trim() || 'normal';
  };

  const getTextLayout = (incomingProps = shapeProps, textValue = incomingProps.text) => {
    const textNode = new Konva.Text({
      text: textValue || ' ',
      fontSize: incomingProps.fontSize || 20,
      fontFamily: incomingProps.fontFamily || 'Arial',
      fontStyle: `${incomingProps.isItalic ? 'italic ' : ''}${incomingProps.isBold ? 'bold' : ''}`.trim() || 'normal',
      lineHeight: incomingProps.lineHeight || 1.2,
      letterSpacing: incomingProps.letterSpacing || 0,
      padding: 0,
      align: incomingProps.align || 'left',
    });

    const naturalWidth = Math.ceil(textNode.width());
    const requestedWidth = Number(incomingProps.width);
    const hasRequestedWidth = Number.isFinite(requestedWidth) && requestedWidth > 0;
    const finalWidth = hasRequestedWidth ? Math.min(requestedWidth, naturalWidth) : naturalWidth;
    const renderWidth = getTextBoxWidth(finalWidth);
    textNode.width(renderWidth);
    textNode.wrap('word');

    return {
      width: renderWidth,
      height: Math.max(incomingProps.fontSize || 20, Math.ceil(textNode.height())),
    };
  };

  const measureTextLayout = (textValue) => getTextLayout(shapeProps, textValue);

  const startInlineEditing = () => {
    if (shapeProps.type !== 'text') return;
    onSelect();
    textEditActionRef.current = 'save';
    setIsEditingText(true);
    setDraftText(shapeProps.text || '');
  };

  const finishInlineEditing = (shouldSave = true) => {
    if (shouldSave) {
      const layout = measureTextLayout(draftText);
      onChange({
        ...shapeProps,
        text: draftText,
        width: layout.width,
        height: layout.height,
      });
    } else {
      setDraftText(shapeProps.text || '');
    }
    setIsEditingText(false);
  };

  useEffect(() => {
    if (!isEditingText) return;
    const rafId = window.requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        const end = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(end, end);
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [isEditingText]);

  useEffect(() => {
    if (!isEditingText || !textareaRef.current) return;
    textareaRef.current.style.height = 'auto';
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  }, [draftText, isEditingText, shapeProps.fontSize, shapeProps.width]);

  const shadowProps = {
    shadowColor: shapeProps.shadowColor || '#000000',
    shadowBlur: shapeProps.shadowBlur || 0,
    shadowOffset: { x: shapeProps.shadowOffsetX || 0, y: shapeProps.shadowOffsetY || 0 },
    shadowOpacity: shapeProps.shadowOpacity ?? 0.25,
  };

  const strokeProps = {
    stroke: shapeProps.strokeColor || '#ffffff',
    strokeWidth: shapeProps.strokeWidth || 0,
    dash: shapeProps.dashStyle === 'dashed' ? [10, 10] : shapeProps.dashStyle === 'dotted' ? [2, 5] : undefined,
    listening: false
  };

  const getImageFilters = () => {
    const filters = [];
    if (shapeProps.blurRadius > 0) filters.push(Konva.Filters.Blur);
    if (shapeProps.brightness !== undefined && shapeProps.brightness !== 0) filters.push(Konva.Filters.Brighten);
    if (shapeProps.contrast !== undefined && shapeProps.contrast !== 0) filters.push(Konva.Filters.Contrast);
    if (shapeProps.saturation !== undefined && shapeProps.saturation !== 0) filters.push(Konva.Filters.HSL);
    if (shapeProps.grayscale) filters.push(Konva.Filters.Grayscale);
    if (shapeProps.invert) filters.push(Konva.Filters.Invert);
    if (shapeProps.sepia) filters.push(Konva.Filters.Sepia);
    return filters;
  };

  const filterProps = {
    filters: getImageFilters(),
    blurRadius: shapeProps.blurRadius || 0,
    brightness: (shapeProps.brightness || 0) / 100,
    contrast: (shapeProps.contrast || 0) / 100,
    saturation: (shapeProps.saturation || 0),
  };

  const updateTextCase = (mode) => {
    onChange({
      ...shapeProps,
      text: transformTextCase(shapeProps.text, mode),
    });
  };

  const updateFontSize = (delta) => {
    onChange({
      ...shapeProps,
      fontSize: Math.max(8, (shapeProps.fontSize || 16) + delta),
    });
  };

  const applyTextPreset = (presetKey) => {
    const preset = TEXT_PRESETS[presetKey];
    if (!preset) return;
    onChange({
      ...shapeProps,
      ...preset,
    });
  };

  const getImageCrop = () => {
    if (!image || !shapeProps.width || !shapeProps.height || shapeProps.imageFit !== 'cover') {
      return undefined;
    }

    const frameRatio = shapeProps.width / shapeProps.height;
    const imageRatio = image.width / image.height;

    if (imageRatio > frameRatio) {
      const cropWidth = image.height * frameRatio;
      return {
        x: (image.width - cropWidth) / 2,
        y: 0,
        width: cropWidth,
        height: image.height,
      };
    }

    const cropHeight = image.width / frameRatio;
    return {
      x: 0,
      y: (image.height - cropHeight) / 2,
      width: image.width,
      height: cropHeight,
    };
  };

  const renderImageSurface = (extraProps = {}) => {
    if (!image) return null;

    const fit = shapeProps.imageFit || 'fill';
    const crop = fit === 'cover' ? getImageCrop() : undefined;

    return (
      <KonvaImage
        image={image}
        width={shapeProps.width}
        height={shapeProps.height}
        opacity={shapeProps.opacity ?? 1}
        crop={crop}
        filters={shapeProps.blurRadius > 0 ? [Konva.Filters.Blur] : []}
        blurRadius={shapeProps.blurRadius || 0}
        {...extraProps}
      />
    );
  };

  const renderImageNode = () => {
    // If no image and no special mask, we don't render an image node
    if (!image && !shapeProps.maskPath && !shapeProps.maskShape) return null;
    
    const crop = shapeProps.imageFit === 'cover' ? getImageCrop() : undefined;

    // Handle Stylish Frames (SVG Mask Paths)
    if (shapeProps.maskPath) {
      return (
        <Group
          x={shapeProps.x}
          y={shapeProps.y}
          rotation={shapeProps.rotation || 0}
          scaleX={shapeProps.scaleX || 1}
          scaleY={shapeProps.scaleY || 1}
          draggable={!shapeProps.isLocked}
          onClick={onSelect}
          onTap={onSelect}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
          onTransform={handleTransform}
          ref={shapeRef}
        >
          <Group
            clipFunc={(ctx) => {
              const p = new Path2D(shapeProps.maskPath);
              ctx.save();
              ctx.scale(shapeProps.width / 100, shapeProps.height / 100);
              ctx.fill(p);
              ctx.restore();
            }}
          >
            {image ? (
              <KonvaImage
                image={image}
                width={shapeProps.width}
                height={shapeProps.height}
                opacity={shapeProps.opacity ?? 1}
                crop={crop}
                {...shadowProps}
                {...filterProps}
                onUpdate={(node) => {
                  if (filterProps.filters.length > 0) node.cache();
                  else node.clearCache();
                }}
              />
            ) : (
              <Group>
                 <Rect width={shapeProps.width} height={shapeProps.height} fill={shapeProps.fill || '#f1f5f9'} />
                 <Path 
                    data="M0,80 Q40,60 80,90 T160,70 L160,160 L0,160 Z" 
                    fill="#cbd5e1" 
                    scaleX={shapeProps.width / 160} 
                    scaleY={shapeProps.height / 160} 
                    y={shapeProps.height / 4}
                />
                <Circle 
                    x={shapeProps.width * 0.7} 
                    y={shapeProps.height * 0.3} 
                    radius={shapeProps.width * 0.1} 
                    fill="#e2e8f0" 
                />
                <Text 
                    text="Drop image" 
                    width={shapeProps.width} 
                    y={shapeProps.height / 2 - 5} 
                    align="center" 
                    fontSize={Math.max(10, shapeProps.width / 10)} 
                    fontStyle="bold" 
                    fill="#64748b" 
                />
              </Group>
            )}
          </Group>

          {(shapeProps.strokeWidth || 0) > 0 && (
             <Path
               data={shapeProps.maskPath}
               scaleX={shapeProps.width / 100}
               scaleY={shapeProps.height / 100}
               {...strokeProps}
               strokeWidth={(shapeProps.strokeWidth || 0) / (shapeProps.width / 100)}
             />
          )}

          <Path 
            data={shapeProps.maskPath}
            scaleX={shapeProps.width / 100}
            scaleY={shapeProps.height / 100}
            fill="transparent"
            hitStrokeWidth={10}
          />
        </Group>
      );
    }

    // Handle maskShape (circle, rounded) or regular image
    return (
      <Group
        x={shapeProps.x}
        y={shapeProps.y}
        rotation={shapeProps.rotation || 0}
        scaleX={shapeProps.scaleX || 1}
        scaleY={shapeProps.scaleY || 1}
        draggable={!shapeProps.isLocked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        onTransform={handleTransform}
        ref={shapeRef}
        clipFunc={shapeProps.maskShape === 'circle' ? (ctx) => {
          const radius = Math.min(shapeProps.width, shapeProps.height) / 2;
          ctx.beginPath();
          ctx.arc(shapeProps.width / 2, shapeProps.height / 2, radius, 0, Math.PI * 2, false);
        } : undefined}
      >
        {image ? (
          <KonvaImage
            image={image}
            width={shapeProps.width}
            height={shapeProps.height}
            opacity={shapeProps.opacity ?? 1}
            cornerRadius={shapeProps.maskShape === 'rounded' ? (shapeProps.cornerRadius || 24) : 0}
            crop={crop}
            {...shadowProps}
            {...filterProps}
            onUpdate={(node) => {
               if (filterProps.filters.length > 0) node.cache();
               else node.clearCache();
            }}
          />
        ) : (
          <Group>
            <Rect 
              width={shapeProps.width} 
              height={shapeProps.height} 
              fill={shapeProps.fill || '#f1f5f9'} 
              cornerRadius={shapeProps.maskShape === 'rounded' ? (shapeProps.cornerRadius || 24) : 0} 
            />
            <Text 
                text={shapeProps.maskShape ? `${shapeProps.maskShape} Frame` : "Image Frame"}
                width={shapeProps.width} 
                y={shapeProps.height / 2 - 10} 
                align="center" 
                fontSize={Math.max(10, shapeProps.width / 12)} 
                fontStyle="bold" 
                fill="#94a3b8" 
            />
          </Group>
        )}
        
        {(shapeProps.strokeWidth || 0) > 0 && (
          <React.Fragment>
            {shapeProps.maskShape === 'circle' ? (
              <Circle
                x={shapeProps.width / 2}
                y={shapeProps.height / 2}
                radius={Math.min(shapeProps.width, shapeProps.height) / 2 - (shapeProps.strokeWidth || 0) / 2}
                {...strokeProps}
              />
            ) : (
              <Rect
                width={shapeProps.width}
                height={shapeProps.height}
                cornerRadius={shapeProps.maskShape === 'rounded' ? (shapeProps.cornerRadius || 24) : 0}
                {...strokeProps}
              />
            )}
          </React.Fragment>
        )}
      </Group>
    );
  };

  const renderPhotoFrameNode = () => {
    const width = shapeProps.width || 260;
    const height = shapeProps.height || 320;
    const frameStyle = shapeProps.frameStyle || 'rounded';
    const frameColor = shapeProps.frameColor || '#ffffff';
    const accentColor = shapeProps.accentColor || '#f59e0b';
    const outerRadius = frameStyle === 'rounded' ? (shapeProps.cornerRadius || 28) : frameStyle === 'arch' ? Math.min(width / 2, 999) : 0;
    const innerInset = frameStyle === 'polaroid' ? 16 : 12;
    const labelHeight = frameStyle === 'polaroid' ? 56 : 0;
    const imageHeight = Math.max(80, height - innerInset * 2 - labelHeight);
    const placeholderFill = '#e2e8f0';

    return (
      <Group
        x={shapeProps.x}
        y={shapeProps.y}
        rotation={shapeProps.rotation || 0}
        scaleX={shapeProps.scaleX || 1}
        scaleY={shapeProps.scaleY || 1}
        draggable={!shapeProps.isLocked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
        ref={shapeRef}
        opacity={shapeProps.opacity ?? 1}
      >
        {frameStyle === 'stack' && (
          <>
            <Rect
              x={14}
              y={8}
              width={width - 6}
              height={height - 2}
              fill="#ffffff"
              cornerRadius={24}
              rotation={6}
              shadowColor="#0f172a"
              shadowBlur={8}
              shadowOpacity={0.08}
            />
            <Rect
              x={6}
              y={2}
              width={width - 4}
              height={height - 4}
              fill="#f8fafc"
              cornerRadius={22}
              rotation={-4}
              shadowColor="#0f172a"
              shadowBlur={8}
              shadowOpacity={0.08}
            />
          </>
        )}
        <Rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill={frameColor}
          cornerRadius={outerRadius}
          stroke={shapeProps.strokeColor || '#e5e7eb'}
          strokeWidth={shapeProps.strokeWidth || 2}
          {...shadowProps}
        />
        {frameStyle === 'arch' ? (
          <Group clipFunc={(ctx) => {
            const radius = width / 2;
            ctx.beginPath();
            ctx.moveTo(innerInset, height - innerInset);
            ctx.lineTo(innerInset, radius);
            ctx.arc(width / 2, radius, Math.max(10, radius - innerInset), Math.PI, 0, false);
            ctx.lineTo(width - innerInset, height - innerInset);
            ctx.closePath();
          }}>
            <Rect x={innerInset} y={innerInset} width={width - innerInset * 2} height={height - innerInset * 2} fill={placeholderFill} />
            {image ? renderImageSurface({ x: innerInset, y: innerInset, width: width - innerInset * 2, height: height - innerInset * 2 }) : null}
          </Group>
        ) : (
          <>
            <Rect
              x={innerInset}
              y={innerInset}
              width={width - innerInset * 2}
              height={imageHeight}
              fill={placeholderFill}
              cornerRadius={frameStyle === 'rounded' ? Math.max(12, outerRadius - 10) : 18}
            />
            {image ? renderImageSurface({
              x: innerInset,
              y: innerInset,
              width: width - innerInset * 2,
              height: imageHeight,
              cornerRadius: frameStyle === 'rounded' ? Math.max(12, outerRadius - 10) : 18,
            }) : null}
          </>
        )}
        {!image && (
          <>
            <Rect
              x={width / 2 - 32}
              y={height / 2 - 42}
              width={64}
              height={64}
              cornerRadius={18}
              fill="#ffffff"
              opacity={0.8}
            />
            <Text
              x={innerInset}
              y={height / 2 + 34}
              width={width - innerInset * 2}
              align="center"
              text={shapeProps.label || 'Drop Photo'}
              fontSize={18}
              fontFamily="Arial"
              fill="#475569"
              fontStyle="bold"
            />
          </>
        )}
        {frameStyle === 'polaroid' && (
          <Text
            x={20}
            y={height - 42}
            width={width - 40}
            align="center"
            text={shapeProps.label || 'Memories'}
            fontSize={18}
            fontFamily="'Playfair Display', serif"
            fill="#334155"
          />
        )}
        {frameStyle === 'rounded' && (
          <Rect
            x={18}
            y={18}
            width={width - 36}
            height={10}
            fill={accentColor}
            cornerRadius={999}
            opacity={0.95}
          />
        )}
        {frameStyle === 'arch' && (
          <Rect
            x={20}
            y={height - 32}
            width={width - 40}
            height={12}
            fill={accentColor}
            cornerRadius={999}
            opacity={0.92}
          />
        )}
        {frameStyle === 'stack' && (
          <Circle x={width - 26} y={26} radius={10} fill={accentColor} />
        )}
      </Group>
    );
  };

  return (
    <React.Fragment>
      {shapeProps.type === 'rectangle' && (
        <Rect {...commonProps} cornerRadius={shapeProps.cornerRadius || 0} opacity={shapeProps.opacity ?? 1} {...strokeProps} {...shadowProps} />
      )}
      {shapeProps.type === 'circle' && (
        <Circle {...commonProps} radius={shapeProps.width / 2} opacity={shapeProps.opacity ?? 1} {...strokeProps} {...shadowProps} />
      )}
      {shapeProps.type === 'ellipse' && (
        <Ellipse {...commonProps} radiusX={shapeProps.width / 2} radiusY={shapeProps.height / 2} opacity={shapeProps.opacity ?? 1} {...strokeProps} {...shadowProps} />
      )}
      {shapeProps.type === 'triangle' && (
        <RegularPolygon {...commonProps} sides={3} radius={shapeProps.width / 2} opacity={shapeProps.opacity ?? 1} {...strokeProps} {...shadowProps} />
      )}
      {shapeProps.type === 'hexagon' && (
        <RegularPolygon {...commonProps} sides={6} radius={shapeProps.width / 2} opacity={shapeProps.opacity ?? 1} {...strokeProps} {...shadowProps} />
      )}
      {shapeProps.type === 'star' && (
        <Star {...commonProps} numPoints={5} innerRadius={shapeProps.width / 4} outerRadius={shapeProps.width / 2} opacity={shapeProps.opacity ?? 1} {...strokeProps} {...shadowProps} />
      )}
      {shapeProps.type === 'line' && (
        <Line {...commonProps} points={[0, 0, shapeProps.width, 0]} stroke={shapeProps.fill} strokeWidth={Math.max(2, shapeProps.height / 10)} opacity={shapeProps.opacity ?? 1} dash={strokeProps.dash} />
      )}
      {shapeProps.type === 'arrow' && (
        <Arrow {...commonProps} points={[0, shapeProps.height / 2, shapeProps.width, shapeProps.height / 2]} stroke={shapeProps.fill} fill={shapeProps.fill} strokeWidth={Math.max(2, shapeProps.height / 3)} pointerLength={shapeProps.pointerLength || 28} pointerWidth={shapeProps.pointerWidth || 24} opacity={shapeProps.opacity ?? 1} dash={strokeProps.dash} {...shadowProps} />
      )}
      {shapeProps.type === 'text' && (
         <Text
           {...(() => {
             const { height, ...textCommonProps } = commonProps;
             return textCommonProps;
           })()}
           text={isEditingText ? draftText : shapeProps.text} 
           width={getTextBoxWidth(shapeProps.width)}
           fontSize={shapeProps.fontSize} 
           fontFamily={shapeProps.fontFamily} 
           fill={shapeProps.fill} 
           fontStyle={getFontStyle()}
           align={shapeProps.align || 'left'}
           wrap="word"
           lineHeight={shapeProps.lineHeight || 1.2}
           letterSpacing={shapeProps.letterSpacing || 0}
           opacity={shapeProps.opacity ?? 1}
           stroke={shapeProps.strokeColor}
           strokeWidth={shapeProps.strokeWidth || 0}
           hitStrokeWidth={10}
           onDblClick={startInlineEditing}
           onDblTap={startInlineEditing}
           {...shadowProps}
         />
      )}
      {shapeProps.type === 'path' && (
         <Path {...commonProps} data={shapeProps.data} fill={shapeProps.fill} opacity={shapeProps.opacity ?? 1} stroke={shapeProps.strokeColor} strokeWidth={shapeProps.strokeWidth || 0} hitStrokeWidth={10} {...shadowProps} />
      )}
      {['image', 'profileImage'].includes(shapeProps.type) && renderImageNode()}
      {shapeProps.type === 'photoFrame' && renderPhotoFrameNode()}
      {['image', 'profileImage'].includes(shapeProps.type) && shapeProps.maskShape !== 'circle' && image && (shapeProps.strokeWidth || 0) > 0 && (
        <Rect
          x={shapeProps.x}
          y={shapeProps.y}
          width={shapeProps.width}
          height={shapeProps.height}
          cornerRadius={shapeProps.maskShape === 'rounded' ? (shapeProps.cornerRadius || 24) : (shapeProps.cornerRadius || 0)}
          stroke={shapeProps.strokeColor || '#ffffff'}
          strokeWidth={shapeProps.strokeWidth || 0}
          listening={false}
        />
      )}
      
      {isSelected && !shapeProps.isLocked && !isEditingText && (
        <Transformer
          ref={trRef}
          enabledAnchors={
            shapeProps.type === 'text'
              ? ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']
              : ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'middle-left', 'middle-right']
          }
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}

      {isEditingText && shapeProps.type === 'text' && (
        <Html
          groupProps={{
            x: shapeProps.x,
            y: shapeProps.y,
          }}
        >
          <textarea
            ref={textareaRef}
            value={draftText}
            onChange={(e) => setDraftText(e.target.value)}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
            onBlur={() => finishInlineEditing(textEditActionRef.current !== 'cancel')}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                textEditActionRef.current = 'cancel';
                finishInlineEditing(false);
              }
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                textEditActionRef.current = 'save';
                finishInlineEditing(true);
              }
            }}
            onFocus={(e) => {
              const end = e.target.value.length;
              e.target.setSelectionRange(end, end);
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="resize-none overflow-hidden bg-transparent px-0 py-0 outline-none selection:bg-transparent selection:text-transparent"
            style={{
              width: `${getTextBoxWidth(shapeProps.width)}px`,
              minHeight: `${Math.max(48, shapeProps.height || (shapeProps.fontSize || 20) + 16)}px`,
              fontSize: `${shapeProps.fontSize || 20}px`,
              fontFamily: shapeProps.fontFamily || 'Arial',
              fontWeight: shapeProps.isBold ? '700' : '400',
              fontStyle: shapeProps.isItalic ? 'italic' : 'normal',
              color: 'transparent',
              caretColor: shapeProps.fill || '#000000',
              lineHeight: `${shapeProps.lineHeight || 1.2}`,
              letterSpacing: `${shapeProps.letterSpacing || 0}px`,
              textAlign: shapeProps.align || 'left',
              transform: `rotate(${shapeProps.rotation || 0}deg)`,
              transformOrigin: 'top left',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
              border: 'none',
              background: 'transparent',
              boxShadow: 'none',
            }}
          />
        </Html>
      )}
    </React.Fragment>
  );
};

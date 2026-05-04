/**
 * Parses SVG text into a list of Konva-compatible element objects.
 */
export const parseSVG = (svgText) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svgEl = doc.querySelector('svg');
  if (!svgEl) return { elements: [], width: 300, height: 300 };

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

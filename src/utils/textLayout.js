export const MIN_TEXT_BOX_WIDTH = 120;
export const DEFAULT_TEXT_BOX_WIDTH = 180;

export const getTextBoxWidth = (width, fallback = DEFAULT_TEXT_BOX_WIDTH) => {
  const numericWidth = Number(width);
  const safeFallback = Math.max(MIN_TEXT_BOX_WIDTH, Number(fallback) || DEFAULT_TEXT_BOX_WIDTH);

  if (!Number.isFinite(numericWidth) || numericWidth <= 0) {
    return safeFallback;
  }

  return Math.max(MIN_TEXT_BOX_WIDTH, numericWidth);
};

// Use an empty 1x1 pixel data URI as default placeholder
export const defaultPlaceholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Get the actual placeholder to use
export const getActualPlaceholder = (placeholderSrc) => {
  return placeholderSrc || defaultPlaceholder;
}; 
export const IMAGE_TYPES = new Set(['image/jpeg','image/png','image/webp','image/heic','image/heif']);
export const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp|heic|heif)$/i;

export function formatBytes(bytes) {
  const value = Number(bytes) || 0;
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(value < 100 * 1024 ? 1 : 0)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

export function dimensions(image) {
  return {
    width: Number(image?.naturalWidth || image?.videoWidth || image?.width || 0),
    height: Number(image?.naturalHeight || image?.videoHeight || image?.height || 0)
  };
}

export async function decodeImageFile(file) {
  if (!file) throw new Error('No image selected.');
  const isKnownType = IMAGE_TYPES.has(String(file.type || '').toLowerCase()) || IMAGE_EXTENSIONS.test(file.name || '');
  if (!isKnownType) throw new Error('Use a JPG, PNG, WebP, HEIC, or HEIF image.');

  if ('createImageBitmap' in window) {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
      const size = dimensions(bitmap);
      if (size.width && size.height) {
        return { image: bitmap, ...size, close: () => bitmap.close?.() };
      }
      bitmap.close?.();
    } catch {}
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = objectUrl;
    });
    const size = dimensions(image);
    if (!size.width || !size.height) throw new Error('The image has no readable dimensions.');
    return { image, ...size, close: () => URL.revokeObjectURL(objectUrl) };
  } catch {
    URL.revokeObjectURL(objectUrl);
    if (/heic|heif/i.test(`${file.type} ${file.name}`)) {
      throw new Error('This browser cannot decode that HEIC/HEIF file. On iPhone/iPad, try Safari, or export the photo as JPEG first.');
    }
    throw new Error('Could not decode that image.');
  }
}

export function coverScale(width, height, targetWidth, targetHeight) {
  return Math.max(targetWidth / width, targetHeight / height);
}

export function clampOffsets(state, sourceWidth, sourceHeight, targetWidth, targetHeight) {
  const scale = state.baseScale * state.zoom;
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const maxX = Math.max(0, (width - targetWidth) / 2);
  const maxY = Math.max(0, (height - targetHeight) / 2);
  state.offsetX = Math.min(maxX, Math.max(-maxX, state.offsetX));
  state.offsetY = Math.min(maxY, Math.max(-maxY, state.offsetY));
}

export function drawCrop(ctx, image, sourceWidth, sourceHeight, state, targetWidth, targetHeight, fill = '#080808') {
  clampOffsets(state, sourceWidth, sourceHeight, targetWidth, targetHeight);
  const scale = state.baseScale * state.zoom;
  const width = sourceWidth * scale;
  const height = sourceHeight * scale;
  const x = (targetWidth - width) / 2 + state.offsetX;
  const y = (targetHeight - height) / 2 + state.offsetY;
  ctx.clearRect(0, 0, targetWidth, targetHeight);
  ctx.fillStyle = fill;
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(image, x, y, width, height);
}

export function canvasBlob(canvas, quality = 0.88) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not prepare the JPEG image.')), 'image/jpeg', quality);
  });
}

export async function sha256(blob) {
  const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  return [...new Uint8Array(digest)].map(value => value.toString(16).padStart(2, '0')).join('');
}

const $ = id => document.getElementById(id);

const currentImage = $('currentImage');
const currentPalette = $('currentPalette');
const imageInput = $('imageInput');
const emptyEditor = $('emptyEditor');
const cropEditor = $('cropEditor');
const cropStage = $('cropStage');
const cropCanvas = $('cropCanvas');
const cropContext = cropCanvas.getContext('2d', { willReadFrequently: true });
const zoomRange = $('zoomRange');
const resetCrop = $('resetCrop');
const newPalette = $('newPalette');
const previewStatus = $('previewStatus');
const sitePreview = $('sitePreview');
const previewProfile = $('previewProfile');
const publishStatus = $('publishStatus');
const refreshCurrent = $('refreshCurrent');
const downloadButton = $('downloadButton');
const openPublisherButton = $('openPublisherButton');

const CANVAS_SIZE = 720;
const MAX_SOURCE_SIZE = 18 * 1024 * 1024;
const PUBLISHER_URL = 'https://github.com/xm5o/xm5o.github.io/issues/new?template=profile-picture-update.md&title=%5Bprofile-update%5D%20Update%20profile%20picture';
const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

const themeEngine = window.ProfilePictureTheme
  ? new window.ProfilePictureTheme('[data-profile-theme-source-never]')
  : null;

const state = {
  sourceImage: null,
  sourceUrl: '',
  baseScale: 1,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  dragging: false,
  pointerId: null,
  dragStartX: 0,
  dragStartY: 0,
  dragOffsetX: 0,
  dragOffsetY: 0,
  palette: null,
  currentPalette: null,
  previewTimer: null
};

function setPublishStatus(message, type = '') {
  publishStatus.textContent = message;
  publishStatus.classList.remove('success', 'error');
  if (type) publishStatus.classList.add(type);
}

function rgbText(color) {
  return `${color.r}, ${color.g}, ${color.b}`;
}

function paletteFrom(element) {
  if (!themeEngine || !element) return null;
  try {
    const dominant = themeEngine.getDominantColor(element);
    return dominant ? themeEngine.buildPalette(dominant) : null;
  } catch (error) {
    console.warn('[Profile Manager] Could not extract palette:', error);
    return null;
  }
}

function paletteHex(palette) {
  if (!palette || !themeEngine) return null;
  return {
    main: themeEngine.toHex(palette.main),
    secondary: themeEngine.toHex(palette.secondary),
    accent: themeEngine.toHex(palette.accent)
  };
}

function renderPalette(container, palette) {
  if (!container) return;
  const colors = paletteHex(palette);

  if (!colors) {
    container.innerHTML = '<span class="swatch"><span>No colors yet</span></span>';
    return;
  }

  container.innerHTML = [
    ['Main', colors.main],
    ['Secondary', colors.secondary],
    ['Accent', colors.accent]
  ].map(([label, hex]) => `
    <span class="swatch" title="${label}: ${hex}">
      <span class="swatch-dot" style="background:${hex}"></span>
      <span>${hex}</span>
    </span>
  `).join('');
}

function applyPreviewPalette(palette) {
  const colors = paletteHex(palette);
  if (!colors) return;

  sitePreview.style.setProperty('--main-color', colors.main);
  sitePreview.style.setProperty('--secondary-color', colors.secondary);
  sitePreview.style.setProperty('--accent-color', colors.accent);
  sitePreview.style.setProperty('--preview-main-rgb', rgbText(palette.main));
}

function refreshCurrentPalette() {
  if (!currentImage.complete || !currentImage.naturalWidth) return;
  state.currentPalette = paletteFrom(currentImage);
  renderPalette(currentPalette, state.currentPalette);
  if (!state.palette && state.currentPalette) applyPreviewPalette(state.currentPalette);
}

function loadCurrentImage() {
  currentImage.src = `../../assets/pfp.jpg?v=${Date.now()}`;
}

currentImage.addEventListener('load', refreshCurrentPalette);
if (currentImage.complete) refreshCurrentPalette();
refreshCurrent.addEventListener('click', loadCurrentImage);

function clearSourceUrl() {
  if (state.sourceUrl) URL.revokeObjectURL(state.sourceUrl);
  state.sourceUrl = '';
}

function coverScale(image) {
  return Math.max(CANVAS_SIZE / image.naturalWidth, CANVAS_SIZE / image.naturalHeight);
}

function clampOffsets() {
  if (!state.sourceImage) return;

  const scale = state.baseScale * state.zoom;
  const width = state.sourceImage.naturalWidth * scale;
  const height = state.sourceImage.naturalHeight * scale;
  const maxX = Math.max(0, (width - CANVAS_SIZE) / 2);
  const maxY = Math.max(0, (height - CANVAS_SIZE) / 2);

  state.offsetX = Math.min(maxX, Math.max(-maxX, state.offsetX));
  state.offsetY = Math.min(maxY, Math.max(-maxY, state.offsetY));
}

function renderCrop({ updatePreview = false } = {}) {
  if (!state.sourceImage || !cropContext) return;

  clampOffsets();

  const scale = state.baseScale * state.zoom;
  const width = state.sourceImage.naturalWidth * scale;
  const height = state.sourceImage.naturalHeight * scale;
  const x = (CANVAS_SIZE - width) / 2 + state.offsetX;
  const y = (CANVAS_SIZE - height) / 2 + state.offsetY;

  cropContext.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  cropContext.fillStyle = '#080808';
  cropContext.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  cropContext.drawImage(state.sourceImage, x, y, width, height);

  if (updatePreview) scheduleThemePreview();
}

function resetCropState() {
  if (!state.sourceImage) return;
  state.baseScale = coverScale(state.sourceImage);
  state.zoom = 1;
  state.offsetX = 0;
  state.offsetY = 0;
  zoomRange.value = '1';
  renderCrop({ updatePreview: true });
}

function scheduleThemePreview() {
  clearTimeout(state.previewTimer);
  state.previewTimer = setTimeout(updateThemePreview, 80);
}

function updateThemePreview() {
  if (!state.sourceImage) return;

  state.palette = paletteFrom(cropCanvas);
  renderPalette(newPalette, state.palette);
  applyPreviewPalette(state.palette);
  previewProfile.src = cropCanvas.toDataURL('image/jpeg', 0.86);
  previewStatus.textContent = state.palette ? 'Matches live theme' : 'Could not read colors';
  updatePublishState();
}

async function loadSelectedFile(file) {
  if (!file) return;

  if (!allowedTypes.has(file.type)) {
    setPublishStatus('Use a JPG, PNG, or WebP image.', 'error');
    return;
  }

  if (file.size > MAX_SOURCE_SIZE) {
    setPublishStatus('That image is too large. Choose an image under 18 MB.', 'error');
    return;
  }

  clearSourceUrl();
  const url = URL.createObjectURL(file);
  state.sourceUrl = url;

  const image = new Image();
  image.decoding = 'async';

  image.onload = () => {
    state.sourceImage = image;
    emptyEditor.hidden = true;
    cropEditor.hidden = false;
    resetCropState();
    setPublishStatus('Preview ready. Adjust the crop, then download the prepared image.');
  };

  image.onerror = () => {
    setPublishStatus('Could not open that image.', 'error');
    clearSourceUrl();
  };

  image.src = url;
}

imageInput.addEventListener('change', () => loadSelectedFile(imageInput.files?.[0]));
resetCrop.addEventListener('click', resetCropState);

zoomRange.addEventListener('input', () => {
  state.zoom = Number(zoomRange.value) || 1;
  renderCrop();
});

zoomRange.addEventListener('change', () => renderCrop({ updatePreview: true }));

cropStage.addEventListener('pointerdown', event => {
  if (!state.sourceImage) return;

  state.dragging = true;
  state.pointerId = event.pointerId;
  state.dragStartX = event.clientX;
  state.dragStartY = event.clientY;
  state.dragOffsetX = state.offsetX;
  state.dragOffsetY = state.offsetY;
  cropStage.setPointerCapture?.(event.pointerId);
});

cropStage.addEventListener('pointermove', event => {
  if (!state.dragging || event.pointerId !== state.pointerId) return;

  const rect = cropCanvas.getBoundingClientRect();
  const scale = CANVAS_SIZE / rect.width;
  state.offsetX = state.dragOffsetX + (event.clientX - state.dragStartX) * scale;
  state.offsetY = state.dragOffsetY + (event.clientY - state.dragStartY) * scale;
  renderCrop();
});

function finishDrag(event) {
  if (!state.dragging || (event?.pointerId != null && event.pointerId !== state.pointerId)) return;

  state.dragging = false;
  if (state.pointerId != null) cropStage.releasePointerCapture?.(state.pointerId);
  state.pointerId = null;
  renderCrop({ updatePreview: true });
}

cropStage.addEventListener('pointerup', finishDrag);
cropStage.addEventListener('pointercancel', finishDrag);

function updatePublishState() {
  const ready = Boolean(state.sourceImage && state.palette);
  downloadButton.disabled = !ready;
  openPublisherButton.disabled = !ready;
}

function exportBlob() {
  return new Promise((resolve, reject) => {
    cropCanvas.toBlob(blob => {
      if (!blob) return reject(new Error('Could not prepare the JPEG image.'));
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
}

downloadButton.addEventListener('click', async () => {
  if (!state.sourceImage || !state.palette) return;

  downloadButton.disabled = true;
  downloadButton.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Preparing...';

  try {
    const blob = await exportBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'prepared-profile.jpg';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);

    const colors = paletteHex(state.palette);
    setPublishStatus(
      `prepared-profile.jpg is ready. Theme: ${colors.main} / ${colors.secondary} / ${colors.accent}. Open GitHub and attach the file.`,
      'success'
    );
  } catch (error) {
    setPublishStatus(error.message || 'Could not prepare the image.', 'error');
  } finally {
    downloadButton.innerHTML = '<i class="bx bx-download"></i> Download prepared-profile.jpg';
    updatePublishState();
  }
});

openPublisherButton.addEventListener('click', () => {
  if (!state.sourceImage || !state.palette) return;
  window.open(PUBLISHER_URL, '_blank', 'noopener,noreferrer');
  setPublishStatus('GitHub publisher opened. Attach prepared-profile.jpg, then submit the issue.', 'success');
});

renderPalette(newPalette, null);
updatePublishState();
window.addEventListener('beforeunload', clearSourceUrl);
